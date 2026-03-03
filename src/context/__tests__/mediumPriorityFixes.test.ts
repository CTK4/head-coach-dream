import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getPersonnelById, getPlayerById, getPlayers, getTeams } from "@/data/leagueDb";
import { initTeamStandings, type AIGameResult } from "@/engine/leagueSim";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
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
    const confGroup = [...byConf.values()].find((group) => {
      const divisions = new Set(group.map((t) => String(t.divisionId ?? "")));
      return group.length >= 4 && divisions.size >= 2;
    });
    expect(confGroup).toBeTruthy();

    const teamA = confGroup![0];
    const teamB = confGroup!.find((t) => t.divisionId !== teamA.divisionId) ?? confGroup![1];
    const teamC = confGroup!.find((t) => t.teamId !== teamA.teamId && t.teamId !== teamB.teamId) ?? confGroup![2];
    const teamD = confGroup!.find((t) => ![teamA.teamId, teamB.teamId, teamC.teamId].includes(t.teamId)) ?? confGroup![3];

    const initial = initTeamStandings([teamA.teamId, teamB.teamId, teamC.teamId, teamD.teamId]);
    const out = computeStandings(
      [
        baseGame({ gameId: "g1", homeTeamId: teamA.teamId, awayTeamId: teamC.teamId, homeScore: 24, awayScore: 17 }),
        baseGame({ gameId: "g2", homeTeamId: teamB.teamId, awayTeamId: teamD.teamId, homeScore: 24, awayScore: 17 }),
        baseGame({ gameId: "g3", homeTeamId: teamA.teamId, awayTeamId: teamB.teamId, homeScore: 17, awayScore: 24 }),
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
    const playoffs = buildPlayoffBracket({ league: state.league, season: state.season });
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
  });
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
