import { afterEach, describe, expect, it, vi } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
import * as playoffsSim from "@/engine/playoffsSim";

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

function playoffsReadyState(userTeamId: string, userMakesPlayoffs: boolean): GameState {
  const state = seededState(userTeamId);
  const activeTeamIds = getTeams().filter((t) => t.isActive).map((t) => t.teamId);
  const standings = { ...state.league.standings };

  for (const [idx, teamId] of activeTeamIds.entries()) {
    const isUser = teamId === userTeamId;
    const wins = isUser
      ? (userMakesPlayoffs ? 20 : 0)
      : (userMakesPlayoffs ? 18 - Math.min(idx, 10) : 20 - Math.min(idx, 12));
    standings[teamId] = { w: Math.max(0, wins), l: 17 - Math.max(0, wins), pf: 400 - idx, pa: 300 + idx };
  }

  const league = { ...state.league, standings };
  const playoffs = buildPlayoffBracket({ league, season: state.season });
  return {
    ...state,
    league: { ...league, phase: "WILD_CARD" },
    playoffs,
    careerStage: "PLAYOFFS",
  };
}

describe("playoffs tick reducer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("playoffs.tick.advancesRoundsWithoutUserTeam", () => {
    const userTeamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(userTeamId).toBeTruthy();
    const state = playoffsReadyState(String(userTeamId), false);
    vi.spyOn(playoffsSim, "simulateCpuPlayoffGamesForRound").mockImplementation(({ playoffs }) => ({ completedGames: { ...playoffs.completedGames, "WILD_CARD:CONF:1:B:C": { homeScore: 24, awayScore: 21, winnerTeamId: "B" } }, pendingUserGame: undefined }));
    vi.spyOn(playoffsSim, "advancePlayoffRound").mockImplementation((playoffs) => ({ ...playoffs, round: "SUPER_BOWL", bracket: { ...playoffs.bracket, superBowl: { gameId: "SUPER_BOWL:LEAGUE:1:A:B", round: "SUPER_BOWL", homeTeamId: "A", awayTeamId: "B" } }, completedGames: { ...playoffs.completedGames, "SUPER_BOWL:LEAGUE:1:A:B": { homeScore: 20, awayScore: 17, winnerTeamId: "A" } } }));
    vi.spyOn(playoffsSim, "getPlayoffRoundGames").mockImplementation((playoffs) => playoffs.round === "SUPER_BOWL" ? [{ gameId: "SUPER_BOWL:LEAGUE:1:A:B", round: "SUPER_BOWL", homeTeamId: "A", awayTeamId: "B" }] : [{ gameId: "WILD_CARD:CONF:1:B:C", round: "WILD_CARD", homeTeamId: "B", awayTeamId: "C", conferenceId: "CONF" }]);

    const next = gameReducer(state, { type: "PLAYOFFS_TICK" });

    expect(next.playoffs).toBeNull();
    expect(next.careerStage).toBe("SEASON_AWARDS");
    expect(next.league.phase).toBe("SEASON_COMPLETE");
  });

  it("playoffs.tick.doesNotAdvanceWhenPendingUserGame", () => {
    const userTeamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(userTeamId).toBeTruthy();
    const state = playoffsReadyState(String(userTeamId), true);
    vi.spyOn(playoffsSim, "simulateCpuPlayoffGamesForRound").mockImplementation(({ playoffs, userTeamId }) => ({
      completedGames: playoffs.completedGames,
      pendingUserGame: {
        round: playoffs.round,
        gameId: "WILD_CARD:CONF:1:U:O",
        homeTeamId: String(userTeamId ?? "U"),
        awayTeamId: "O",
      },
    }));

    const next = gameReducer(state, { type: "PLAYOFFS_TICK" });

    expect(next.playoffs).toBeTruthy();
    expect(next.playoffs?.pendingUserGame).toBeTruthy();
    expect(next.playoffs?.round).toBe(state.playoffs?.round);
    expect(next.careerStage).toBe("PLAYOFFS");
  });
});
