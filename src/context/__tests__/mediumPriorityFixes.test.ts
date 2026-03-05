import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getPersonnelById, getPlayerById, getPlayers, getTeams } from "@/data/leagueDb";
import { initTeamStandings, type AIGameResult } from "@/engine/leagueSim";
import { advancePlayoffRound, buildPlayoffBracket, getPlayoffRoundGames, simulateCpuPlayoffGamesForRound } from "@/engine/playoffsSim";
import { computeStandings, type TeamStanding } from "@/engine/standings";

function baseGame(overrides: Partial<AIGameResult>): AIGameResult {
  return {
    gameId: "G_TEST",
    week: 1,
    homeTeamId: "",
    awayTeamId: "",
    homeScore: 0,
    awayScore: 0,
    homePassingYards: 0,
    awayPassingYards: 0,
    homeRushingYards: 0,
    awayRushingYards: 0,
    homeHeadline: { playerName: "H", type: "PASS", value: 0 },
    awayHeadline: { playerName: "A", type: "PASS", value: 0 },
    homeReceivingLeader: { playerName: "H", value: 0 },
    awayReceivingLeader: { playerName: "A", value: 0 },
    homeSackLeader: { playerName: "H", value: 0 },
    awaySackLeader: { playerName: "A", value: 0 },
    ...overrides,
  };
}

function seededState(teamId: string): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: {
        teamId,
        years: 4,
        salary: 4_000_000,
        autonomy: 65,
        patience: 55,
        mediaNarrativeKey: "story_start",
        base: { years: 4, salary: 4_000_000, autonomy: 65 },
      },
      teamName: "Test Team",
    },
  });
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId, teamName: "Test Team" } });
}

describe("M3 standings conferenceRecord + tiebreaker", () => {
  it("initial standings include conferenceRecord and computeStandings preserves it", () => {
    const teamIds = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
    const initial = initTeamStandings(teamIds);
    expect(initial.length).toBeGreaterThan(0);
    for (const standing of initial) {
      expect(standing.conferenceRecord).toEqual({ w: 0, l: 0, t: 0 });
    }

    const next = computeStandings([], initial);
    for (const standing of next) {
      expect(standing.conferenceRecord).toEqual({ w: 0, l: 0, t: 0 });
    }
  });

  it("backward compat defaults missing conferenceRecord to zeroes", () => {
    const teamIds = getTeams().filter((t) => t.isActive).map((t) => t.teamId).slice(0, 2);
    const initial = initTeamStandings(teamIds);
    const legacy = initial.map((s) => {
      const clone = { ...s } as Partial<TeamStanding>;
      delete (clone as any).conferenceRecord;
      return clone as TeamStanding;
    });
    const out = computeStandings([], legacy);
    for (const standing of out) {
      expect(standing.conferenceRecord).toEqual({ w: 0, l: 0, t: 0 });
    }
  });

  it("uses conference record ahead of point differential when winPct and divisionPct tie", () => {
    const active = getTeams().filter((t) => t.isActive);
    const byConf = new Map<string, typeof active>();
    for (const t of active) {
      const conf = String(t.conferenceId ?? "");
      if (!conf) continue;
      byConf.set(conf, [...(byConf.get(conf) ?? []), t]);
    }
    // Find a conference with at least 2 divisions and 2 teams per division.
    const confGroup = [...byConf.values()].find((group) => {
      const divCounts = new Map<string, number>();
      for (const t of group) divCounts.set(String(t.divisionId ?? ""), (divCounts.get(String(t.divisionId ?? "")) ?? 0) + 1);
      return [...divCounts.values()].filter((c) => c >= 2).length >= 2;
    });
    expect(confGroup).toBeTruthy();

    // Pick two teams from different divisions (A/C same div, B/D same div).
    const byDiv = new Map<string, typeof confGroup>();
    for (const t of confGroup!) {
      const div = String(t.divisionId ?? "");
      byDiv.set(div, [...(byDiv.get(div) ?? []), t]);
    }
    const divArrays = [...byDiv.values()].filter((g) => g.length >= 2);
    expect(divArrays.length).toBeGreaterThanOrEqual(2);
    const [div1, div2] = divArrays;
    const [teamA, teamC] = div1; // same division (conf X, div 1)
    const [teamB, teamD] = div2; // same division (conf X, div 2)

    // Also pick 2 non-conference teams (from a different conf) for padding games.
    const otherConfGroup = [...byConf.values()].find((group) => group !== confGroup && group.length >= 2);
    expect(otherConfGroup).toBeTruthy();
    const [teamE, teamF] = otherConfGroup!;

    // Set up 6-team standings. 5 games create equal 2-1 records for A and B
    // but different conference records: B has 2 conf wins, A has 1 conf win.
    // g1: A beats C (div-conf) → A confRec+1W, A divRec+1W
    // g2: B beats D (div-conf) → B confRec+1W, B divRec+1W
    // g3: B beats A (cross-div conf) → B confRec+1W, A confRec+1L
    // g4: A beats E (non-conf) → A total+1W, no confRec change
    // g5: F beats B (non-conf) → B total+1L, no confRec change
    // Result: A=2W-1L confRec=1-1(0.5pct), B=2W-1L confRec=2-0(1.0pct)
    const initial = initTeamStandings([teamA.teamId, teamB.teamId, teamC.teamId, teamD.teamId, teamE.teamId, teamF.teamId]);
    const out = computeStandings(
      [
        baseGame({ gameId: "g1", homeTeamId: teamA.teamId, awayTeamId: teamC.teamId, homeScore: 24, awayScore: 17 }),
        baseGame({ gameId: "g2", homeTeamId: teamB.teamId, awayTeamId: teamD.teamId, homeScore: 24, awayScore: 17 }),
        baseGame({ gameId: "g3", homeTeamId: teamA.teamId, awayTeamId: teamB.teamId, homeScore: 17, awayScore: 24 }),
        baseGame({ gameId: "g4", homeTeamId: teamA.teamId, awayTeamId: teamE.teamId, homeScore: 24, awayScore: 17 }),
        baseGame({ gameId: "g5", homeTeamId: teamF.teamId, awayTeamId: teamB.teamId, homeScore: 24, awayScore: 17 }),
      ],
      initial,
    );

    const aStanding = out.find((s) => s.teamId === teamA.teamId)!;
    const bStanding = out.find((s) => s.teamId === teamB.teamId)!;
    expect(aStanding.winPct).toBe(bStanding.winPct);
    expect(aStanding.divisionRecord).toEqual(bStanding.divisionRecord);
    expect(bStanding.conferenceRecord.w).toBeGreaterThan(aStanding.conferenceRecord.w);
    const idxA = out.findIndex((s) => s.teamId === teamA.teamId);
    const idxB = out.findIndex((s) => s.teamId === teamB.teamId);
    expect(idxB).toBeLessThan(idxA);
  });
});

describe("M2 season rollover compaction", () => {
  it("PLAYOFFS_COMPLETE_SEASON resets weeklyResults, gameHistory, and league.results", () => {
    const teamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(teamId).toBeTruthy();
    const state = seededState(String(teamId));

    // Build a fully-completed playoff bracket (all rounds including Super Bowl).
    let playoffs = buildPlayoffBracket({ league: state.league, season: state.season });
    while (playoffs.round !== "SUPER_BOWL" || getPlayoffRoundGames(playoffs).some((g) => !playoffs.completedGames[g.gameId])) {
      const simmed = simulateCpuPlayoffGamesForRound({ playoffs, seed: 12345 });
      playoffs = { ...playoffs, completedGames: simmed.completedGames, pendingUserGame: undefined };
      if (playoffs.round === "SUPER_BOWL") break;
      playoffs = advancePlayoffRound(playoffs);
    }

    const withData: GameState = {
      ...state,
      playoffs,
      weeklyResults: [{ week: 1, userGameId: "x", allGameResults: [], updatedStandings: [], statLeaders: { passingYards: [], rushingYards: [], receivingYards: [], sacks: [] } }],
      gameHistory: [{ gameId: "H1" } as any],
      league: { ...state.league, results: [{ gameType: "REGULAR_SEASON", week: 1, homeTeamId: "A", awayTeamId: "B", homeScore: 1, awayScore: 0 }] },
    };

    const next = gameReducer(withData, { type: "PLAYOFFS_COMPLETE_SEASON" });
    expect(next.weeklyResults).toEqual([]);
    expect(next.gameHistory).toEqual([]);
    expect(next.league.results).toEqual([]);
  }, 30_000);
});

describe("M1 player lookup source", () => {
  it("getPlayerById resolves player name/pos while personnel lookup is unreliable for player IDs", () => {
    const player = getPlayers().find((p: any) => !!p.playerId && String(p.teamId ?? "") !== "") as any;
    expect(player).toBeTruthy();

    const playerId = String(player.playerId);
    const fromPlayers = getPlayerById(playerId) as any;
    expect(fromPlayers?.fullName).toBeTruthy();
    expect(String(fromPlayers?.pos ?? "")).not.toBe("UNK");

    const fromPersonnel = getPersonnelById(playerId) as any;
    expect(fromPersonnel == null || String(fromPersonnel.fullName ?? "") !== String(fromPlayers.fullName ?? "")).toBe(true);
  });
});
