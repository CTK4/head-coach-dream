import { gameReducer, type GameAction, type GameState, type OfferItem } from "@/context/GameContext";
import { clearPersonnelTeam, expireContract, getCoordinatorFreeAgentsAll, getPersonnel, getPersonnelContract, getPlayersByTeam } from "@/data/leagueDb";
import { StateMachine } from "@/lib/stateMachine";
import { stableDeterminismHash, stableIntegrityHash } from "@/testHarness/stateHash";

export type GoldenSummary = {
  season: number;
  careerStage: string;
  week: number;
  userTeamId: string;
  record: { wins: number; losses: number };
  standingsCount: number;
};

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

function hireBestCoordinators(state: GameState, hiredIds: string[]): GameState {
  let out = state;
  const roles = ["OC", "DC", "STC"] as const;
  for (const role of roles) {
    const pool = getCoordinatorFreeAgentsAll(role)
      .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
    const best = pool[0];
    if (!best) continue;
    hiredIds.push(String(best.personId));
    out = dispatch(out, { type: "HIRE_STAFF", payload: { role, personId: String(best.personId), salary: 1_000_000 } });
  }
  if (!out.staff?.ocId || !out.staff?.dcId || !out.staff?.stcId) {
    const ids = `ocId=${out.staff?.ocId ?? "missing"}, dcId=${out.staff?.dcId ?? "missing"}, stcId=${out.staff?.stcId ?? "missing"}`;
    throw new Error(`Failed to hire all coordinators: ${ids}`);
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
  const ids = roster.map((p: any) => String(p.playerId));
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate player IDs found on roster");
  if (roster.length < 40 || roster.length > 90) throw new Error(`Roster size out of bounds: ${roster.length}`);
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
  stopAt,
}: {
  careerSeed: number;
  userTeamId: string;
  stopAt?: "OFFSEASON_DONE" | "WEEK_9" | "POSTSEASON";
}) {
  return withFixedNow(careerSeed, () => {
    const hiredCoordIds: string[] = [];
    const releaseHiredCoords = () => {
      for (const personId of hiredCoordIds) {
        const contract = getPersonnelContract(personId);
        if (contract) expireContract(contract.contractId);
        clearPersonnelTeam(personId);
      }
    };

    let state = dispatch({} as GameState, { type: "INIT_NEW_GAME_FROM_STORY", payload: { offer: defaultOffer(userTeamId), teamName: userTeamId } });
    state = dispatch(state, { type: "SET_COACH", payload: { name: "Golden Coach", archetypeId: "ceo" } });
    state = { ...state, saveSeed: careerSeed, careerSeed };
    state = hireBestCoordinators(state, hiredCoordIds);

    const visitedSteps: string[] = [state.offseason.stepId];
    while (state.offseason.stepId !== "CUT_DOWNS") {
      state = completeAndAdvance(state);
      visitedSteps.push(state.offseason.stepId);
      if (visitedSteps.length > 16) throw new Error("Offseason did not advance deterministically");
    }

    const required = ["RESIGNING", "COMBINE", "FREE_AGENCY", "PRE_DRAFT", "DRAFT", "TRAINING_CAMP", "PRESEASON", "CUT_DOWNS"];
    for (const step of required) {
      if (!visitedSteps.includes(step)) {
        throw new Error(`GoldenSeason missing offseason step: ${step}. Visited: ${visitedSteps.join(",")}`);
      }
    }

    state = completeAndAdvance(state);

    let stageGuard = 0;
    while (state.careerStage !== "REGULAR_SEASON" && stageGuard < 8) {
      state = dispatch(state, { type: "AUTO_ADVANCE_STAGE_IF_READY" });
      stageGuard += 1;
    }
    if (state.careerStage !== "REGULAR_SEASON") {
      throw new Error(
        `Failed to reach REGULAR_SEASON after advancing career stage ${stageGuard} times (careerStage=${state.careerStage})`,
      );
    }

    if (stopAt === "OFFSEASON_DONE") {
      const summary: GoldenSummary = {
        season: Number(state.season),
        careerStage: String(state.careerStage),
        week: Number(state.hub.regularSeasonWeek ?? state.week ?? 0),
        userTeamId,
        record: { wins: 0, losses: 0 },
        standingsCount: state.currentStandings.length,
      };
      const result = {
        finalState: state,
        summary,
        determinismHash: stableDeterminismHash(state),
        integrityHash: stableIntegrityHash(state),
        stateHash: `${stableDeterminismHash(state)}:${stableIntegrityHash(state)}`,
        visitedSteps,
        personnelCount: getPersonnel().length,
      };
      releaseHiredCoords();
      return result;
    }

    let lastWeek = Number(state.hub.regularSeasonWeek ?? 1);
    let priorStage = String(state.careerStage);
    let advanceGuard = 0;
    while (advanceGuard < 40) {
      state = dispatch(state, { type: "ADVANCE_WEEK" });
      const currentStage = String(state.careerStage);
      const currentWeek = Number(state.hub.regularSeasonWeek ?? lastWeek);
      if (priorStage === "REGULAR_SEASON" && currentStage === "REGULAR_SEASON" && currentWeek < lastWeek) {
        throw new Error("Week regressed");
      }
      priorStage = currentStage;
      lastWeek = currentWeek;
      advanceGuard += 1;

      if (stopAt === "WEEK_9" && Number(state.weeklyResults?.length ?? 0) >= 9) break;
      if (stopAt === "POSTSEASON" && state.careerStage === "SEASON_AWARDS") break;
      if (!stopAt && state.careerStage === "SEASON_AWARDS") break;
    }
    if (advanceGuard >= 40) {
      const expected = stopAt === "WEEK_9"
        ? `weeklyResults.length >= 9 (got ${state.weeklyResults?.length ?? 0})`
        : `careerStage === "SEASON_AWARDS" for stopAt=${stopAt ?? "full"} (got ${state.careerStage})`;
      throw new Error(`Week-advance loop hit guard limit without reaching stop condition: ${expected}`);
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
    const result = {
      finalState: state,
      summary,
      determinismHash,
      integrityHash,
      stateHash: `${determinismHash}:${integrityHash}`,
      visitedSteps,
      personnelCount: getPersonnel().length,
    };
    releaseHiredCoords();
    return result;
  });
}
