import { gameReducer, type GameAction, type GameState, type OfferItem } from "@/context/GameContext";
import { getPersonnel, getPersonnelFreeAgents, getPlayersByTeam } from "@/data/leagueDb";
import { ENABLE_TAMPERING_STEP } from "@/engine/offseason";
import { getPlayoffRoundGames } from "@/engine/playoffsSim";
import { StateMachine } from "@/lib/stateMachine";
import { stableDeterminismHash, stableIntegrityHash } from "@/testHarness/stateHash";

export type GoldenStrategy = {
  resignTopN: number;
};

export type GoldenSummary = {
  season: number;
  careerStage: string;
  week: number;
  userTeamId: string;
  record: { wins: number; losses: number };
  standingsCount: number;
};

type StopAt = "OFFSEASON_DONE" | "WEEK_9" | "POSTSEASON";

type GoldenCheckpointMap = Partial<Record<StopAt, GameState>>;

function dispatch(state: GameState, action: GameAction): GameState {
  return gameReducer(state, action);
}

function defaultOffer(teamId: string): OfferItem {
  return {
    teamId,
    years: 4,
    salary: 8_000_000,
    autonomy: 60,
    patience: 60,
    mediaNarrativeKey: "GOLDEN_TEST",
    base: { years: 4, salary: 8_000_000, autonomy: 60 },
  };
}

function hireBestCoordinators(state: GameState): GameState {
  let out = state;
  const taken = new Set<string>();
  const byRole = ["OC", "DC", "STC"] as const;
  for (const role of byRole) {
    const pool = getPersonnelFreeAgents()
      .filter((p) => String(p.role).toUpperCase() === role && !taken.has(String(p.personId)))
      .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
    const best = pool[0];
    if (!best) continue;
    taken.add(String(best.personId));
    out = dispatch(out, { type: "HIRE_STAFF", payload: { role, personId: String(best.personId), salary: 1_000_000 } });
  }
  return out;
}

function completeAndAdvance(state: GameState): GameState {
  const step = state.offseason.stepId;
  let out = dispatch(state, { type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: step } });
  out = dispatch(out, { type: "OFFSEASON_ADVANCE_STEP" });
  return out;
}

function validateNoDuplicateRosterIds(state: GameState): void {
  const userTeamId = String(state.userTeamId ?? state.acceptedOffer?.teamId ?? "");
  const roster = getPlayersByTeam(userTeamId);
  const ids = roster.map((p) => String(p.playerId));
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate player IDs found on roster");
  if (roster.length < 40 || roster.length > 90) throw new Error(`Roster size out of bounds: ${roster.length}`);
}

function advanceOffseasonUntil(state: GameState, target: "OFFSEASON_DONE" | string): { state: GameState; visitedSteps: string[] } {
  const visitedSteps: string[] = [state.offseason.stepId];
  let out = state;
  let guard = 0;
  while (guard < 24) {
    if (target !== "OFFSEASON_DONE" && out.offseason.stepId === target) break;
    out = completeAndAdvance(out);
    visitedSteps.push(out.offseason.stepId);
    guard += 1;
    if (target === "OFFSEASON_DONE" && out.offseason.stepId === "CUT_DOWNS") break;
  }
  if (guard >= 24) throw new Error(`Offseason did not advance to ${target} deterministically`);
  return { state: out, visitedSteps };
}

function assertRequiredOffseasonSteps(visitedSteps: string[]): void {
  const required = ["RESIGNING", "COMBINE", "FREE_AGENCY", "PRE_DRAFT", "DRAFT", "TRAINING_CAMP", "PRESEASON", "CUT_DOWNS"];
  const expected = ENABLE_TAMPERING_STEP ? [...required.slice(0, 2), "TAMPERING", ...required.slice(2)] : required;
  let cursor = 0;
  for (const step of expected) {
    const foundAt = visitedSteps.indexOf(step, cursor);
    if (foundAt < 0) {
      throw new Error(`GoldenSeason missing required offseason step '${step}'. Visited in order: ${visitedSteps.join(" -> ")}`);
    }
    cursor = foundAt + 1;
  }
}

function advanceRegularSeasonUntil(state: GameState, weekNumber: number): GameState {
  let out = state;
  let guard = 0;
  while (guard < 32) {
    const currentWeek = Number(out.hub.regularSeasonWeek ?? out.week ?? 0);
    if (currentWeek >= weekNumber || out.careerStage !== "REGULAR_SEASON") break;
    out = dispatch(out, { type: "ADVANCE_WEEK" });
    guard += 1;
  }
  if (Number(out.hub.regularSeasonWeek ?? out.week ?? 0) < weekNumber) {
    throw new Error(`Unable to advance to week ${weekNumber}; ended at week ${String(out.hub.regularSeasonWeek ?? out.week ?? 0)} (${out.careerStage})`);
  }
  return out;
}


function advanceCareerStageUntilRegularSeason(state: GameState): GameState {
  let out = state;
  let guard = 0;
  while (out.careerStage !== "REGULAR_SEASON" && guard < 20) {
    out = dispatch(out, { type: "ADVANCE_CAREER_STAGE" });
    guard += 1;
  }
  if (out.careerStage !== "REGULAR_SEASON") {
    throw new Error(`Unable to advance career stage to REGULAR_SEASON; ended at ${out.careerStage}`);
  }
  return out;
}

function advanceUntilSeasonAwards(state: GameState): GameState {
  let out = state;
  let guard = 0;
  while (out.careerStage !== "SEASON_AWARDS" && guard < 40) {
    if (out.careerStage === "PLAYOFFS" && out.playoffs) {
      // Auto-sim pending user game (home team wins) to keep progress deterministic
      if (out.playoffs.pendingUserGame) {
        const pg = out.playoffs.pendingUserGame;
        out = dispatch(out, {
          type: "PLAYOFFS_MARK_GAME_FINAL",
          payload: { gameId: pg.gameId, homeScore: 28, awayScore: 14, winnerTeamId: pg.homeTeamId },
        });
      }
      const currentGames = getPlayoffRoundGames(out.playoffs);
      const allDone = currentGames.length > 0 && currentGames.every((g) => out.playoffs!.completedGames[g.gameId]);
      if (allDone) {
        if (out.playoffs.round === "SUPER_BOWL") {
          out = dispatch(out, { type: "PLAYOFFS_COMPLETE_SEASON" });
        } else {
          out = dispatch(out, { type: "PLAYOFFS_ADVANCE_ROUND" });
          out = dispatch(out, { type: "PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND" });
        }
      } else {
        out = dispatch(out, { type: "PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND" });
      }
    } else {
      out = dispatch(out, { type: "ADVANCE_WEEK" });
    }
    guard += 1;
  }
  if (out.careerStage !== "SEASON_AWARDS") throw new Error("Unable to reach SEASON_AWARDS deterministically");
  return out;
}

function validateStandingsInvariant(state: GameState): void {
  const results = state.league.results ?? [];
  const computed = new Map<string, { wins: number; losses: number }>();
  for (const game of results) {
    const home = String(game.homeTeamId);
    const away = String(game.awayTeamId);
    const homeWon = Number(game.homeScore) > Number(game.awayScore);
    const awayWon = Number(game.awayScore) > Number(game.homeScore);
    if (!computed.has(home)) computed.set(home, { wins: 0, losses: 0 });
    if (!computed.has(away)) computed.set(away, { wins: 0, losses: 0 });
    if (homeWon) {
      computed.get(home)!.wins += 1;
      computed.get(away)!.losses += 1;
    }
    if (awayWon) {
      computed.get(away)!.wins += 1;
      computed.get(home)!.losses += 1;
    }
  }
  for (const standing of state.currentStandings) {
    const row = computed.get(String(standing.teamId));
    if (!row) continue;
    if (Number(standing.wins) !== row.wins || Number(standing.losses) !== row.losses) {
      throw new Error(`Standings mismatch for ${standing.teamId}`);
    }
  }
}

function withFixedNow<T>(now: number, fn: () => T): T {
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    return fn();
  } finally {
    Date.now = originalNow;
  }
}

export function runGoldenSeason({
  careerSeed,
  userTeamId,
  strategy,
  stopAt,
}: {
  careerSeed: number;
  userTeamId: string;
  strategy?: Partial<GoldenStrategy>;
  stopAt?: StopAt;
}) {
  const effectiveStrategy: GoldenStrategy = { resignTopN: strategy?.resignTopN ?? 5 };

  return withFixedNow(careerSeed, () => {
    let state = dispatch({} as GameState, { type: "INIT_NEW_GAME_FROM_STORY", payload: { offer: defaultOffer(userTeamId), teamName: userTeamId } });
    state = dispatch(state, { type: "SET_COACH", payload: { name: "Golden Coach", archetypeId: "ceo" } });
    state = { ...state, saveSeed: careerSeed, careerSeed };
    state = hireBestCoordinators(state);

    const checkpoints: GoldenCheckpointMap = {};
    const offseason = advanceOffseasonUntil(state, "OFFSEASON_DONE");
    state = offseason.state;
    const visitedSteps = offseason.visitedSteps;
    assertRequiredOffseasonSteps(visitedSteps);

    checkpoints.OFFSEASON_DONE = state;

    if (stopAt === "OFFSEASON_DONE") {
      const summary: GoldenSummary = {
        season: Number(state.season),
        careerStage: String(state.careerStage),
        week: Number(state.hub.regularSeasonWeek ?? state.week ?? 0),
        userTeamId,
        record: { wins: 0, losses: 0 },
        standingsCount: state.currentStandings.length,
      };
      const determinismHash = stableDeterminismHash(state);
      const integrityHash = stableIntegrityHash(state);
      return {
        finalState: state,
        summary,
        determinismHash,
        integrityHash,
        stateHash: `${determinismHash}:${integrityHash}`,
        strategy: effectiveStrategy,
        visitedSteps,
        checkpoints,
        personnelCount: getPersonnel().length,
      };
    }

    state = advanceCareerStageUntilRegularSeason(state);

    if (stopAt === "WEEK_9") {
      state = advanceRegularSeasonUntil(state, 9);
      checkpoints.WEEK_9 = state;
    } else {
      state = advanceUntilSeasonAwards(state);
      checkpoints.POSTSEASON = state;
    }

    validateNoDuplicateRosterIds(state);
    validateStandingsInvariant(state);

    const record = state.currentStandings.find((s) => s.teamId === userTeamId) ?? { wins: 0, losses: 0 };
    const summary: GoldenSummary = {
      season: Number(state.season),
      careerStage: String(state.careerStage),
      week: Number(state.hub.regularSeasonWeek ?? state.week ?? 0),
      userTeamId,
      record: { wins: Number(record.wins ?? 0), losses: Number(record.losses ?? 0) },
      standingsCount: state.currentStandings.length,
    };

    const phaseKey = StateMachine.getPhaseKey(state);
    if (!phaseKey) throw new Error("Invalid phase key");

    const determinismHash = stableDeterminismHash(state);
    const integrityHash = stableIntegrityHash(state);
    return {
      finalState: state,
      summary,
      determinismHash,
      integrityHash,
      stateHash: `${determinismHash}:${integrityHash}`,
      strategy: effectiveStrategy,
      visitedSteps,
      checkpoints,
      personnelCount: getPersonnel().length,
    };
  });
}
