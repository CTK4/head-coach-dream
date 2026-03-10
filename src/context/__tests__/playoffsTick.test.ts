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

  it("playoffs.tick.repeatedTicksCompleteSeasonWithoutUserGame", () => {
    const userTeamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(userTeamId).toBeTruthy();

    vi.spyOn(playoffsSim, "simulateCpuPlayoffGamesForRound").mockImplementation(({ playoffs }) => {
      const gameId = `${playoffs.round}:LEAGUE:1:A:B`;
      return {
        completedGames: {
          ...playoffs.completedGames,
          [gameId]: { homeScore: 27, awayScore: 17, winnerTeamId: "A" },
        },
        pendingUserGame: undefined,
      };
    });
    vi.spyOn(playoffsSim, "getPlayoffRoundGames").mockImplementation((playoffs) => [{
      gameId: `${playoffs.round}:LEAGUE:1:A:B`,
      round: playoffs.round,
      homeTeamId: "A",
      awayTeamId: "B",
    }]);
    vi.spyOn(playoffsSim, "advancePlayoffRound").mockImplementation((playoffs) => {
      const nextRound = playoffs.round === "WILD_CARD"
        ? "DIVISIONAL"
        : playoffs.round === "DIVISIONAL"
          ? "CONF_FINALS"
          : "SUPER_BOWL";
      return {
        ...playoffs,
        round: nextRound,
        bracket: {
          ...playoffs.bracket,
          superBowl: {
            gameId: "SUPER_BOWL:LEAGUE:1:A:B",
            round: "SUPER_BOWL",
            homeTeamId: "A",
            awayTeamId: "B",
          },
        },
      };
    });

    let state = playoffsReadyState(String(userTeamId), false);
    for (let i = 0; i < 12 && state.playoffs; i += 1) {
      state = gameReducer(state, { type: "PLAYOFFS_TICK" });
    }

    expect(state.playoffs).toBeNull();
    expect(state.careerStage).toBe("SEASON_AWARDS");
    expect(state.league.phase).toBe("SEASON_COMPLETE");
  }, 30_000);

  it("playoffs.tick.doesNotAdvanceWhenPendingUserGame", () => {
    const userTeamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(userTeamId).toBeTruthy();
    const state = playoffsReadyState(String(userTeamId), true);
    const advanceSpy = vi.spyOn(playoffsSim, "advancePlayoffRound");

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
    expect(advanceSpy).not.toHaveBeenCalled();
  });
});
