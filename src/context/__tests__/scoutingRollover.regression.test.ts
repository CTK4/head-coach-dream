import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";
import { advancePlayoffRound, buildPlayoffBracket, getPlayoffRoundGames, simulateCpuPlayoffGamesForRound } from "@/engine/playoffsSim";

function initState(teamId: string): GameState {
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

describe("scouting rollover regression", () => {
  it("PLAYOFFS_COMPLETE_SEASON clears seasonal stores while preserving scouting carryover data", () => {
    const teamId = getTeams().find((t) => t.isActive)?.teamId;
    expect(teamId).toBeTruthy();

    const state = initState(String(teamId));
    let playoffs = buildPlayoffBracket({ league: state.league, season: state.season });
    while (playoffs.round !== "SUPER_BOWL" || getPlayoffRoundGames(playoffs).some((game) => !playoffs.completedGames[game.gameId])) {
      const simmed = simulateCpuPlayoffGamesForRound({ playoffs, seed: 12345 });
      playoffs = { ...playoffs, completedGames: simmed.completedGames, pendingUserGame: undefined };
      if (playoffs.round === "SUPER_BOWL") break;
      playoffs = advancePlayoffRound(playoffs);
    }

    const withData: GameState = {
      ...state,
      playoffs,
      weeklyResults: [{ week: 1 } as any],
      gameHistory: [{ gameId: "G1" } as any],
      league: {
        ...state.league,
        results: [{ gameType: "REGULAR_SEASON", week: 1, homeTeamId: "A", awayTeamId: "B", homeScore: 17, awayScore: 14 } as any],
      },
      offseasonData: {
        ...state.offseasonData,
        scouting: {
          ...state.offseasonData.scouting,
          carryover: 17,
          budget: { ...state.offseasonData.scouting.budget, total: 40, spent: 23, remaining: 17 },
        },
        preDraft: {
          ...state.offseasonData.preDraft,
          visits: { P1: true },
          workouts: { P2: true },
          reveals: { P1: { speed: "A" } as any },
          intelByProspectId: { P1: 2, P2: 1 },
        },
        combine: {
          ...state.offseasonData.combine,
          generated: true,
          resultsByProspectId: { P1: { forty: 4.49 } as any },
          shortlist: { P1: true },
          interviewPoolIds: ["P1"],
        },
      },
    };

    const next = gameReducer(withData, { type: "PLAYOFFS_COMPLETE_SEASON" });

    expect(next.weeklyResults).toEqual([]);
    expect(next.gameHistory).toEqual([]);
    expect(next.league.results).toEqual([]);

    expect(next.offseasonData.scouting.carryover).toBe(17);
    expect(next.offseasonData.scouting.budget.remaining).toBe(17);
    expect(next.offseasonData.preDraft.visits).toEqual({ P1: true });
    expect(next.offseasonData.preDraft.workouts).toEqual({ P2: true });
    expect(next.offseasonData.combine.resultsByProspectId).toEqual({ P1: { forty: 4.49 } });
  }, 30_000);
});
