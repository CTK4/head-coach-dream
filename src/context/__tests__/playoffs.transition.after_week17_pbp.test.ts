import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, REGULAR_SEASON_WEEKS, type GameState } from "@/context/GameContext";
import { initGameSim } from "@/engine/gameSim";
import { getTeamMatchup } from "@/engine/schedule";

function buildWeek17PbpState(): GameState {
  const base = createInitialStateForTests();
  const teamId = String(base.acceptedOffer?.teamId ?? "");
  if (!teamId || !base.hub.schedule) return base;
  const weekSchedule = base.hub.schedule.regularSeasonWeeks.find((w) => w.week === REGULAR_SEASON_WEEKS);
  const matchup = weekSchedule ? getTeamMatchup(weekSchedule, teamId) : null;
  if (!matchup) return base;

  return {
    ...base,
    saveSeed: 22222,
    careerSeed: 22222,
    careerStage: "REGULAR_SEASON",
    hub: { ...base.hub, regularSeasonWeek: REGULAR_SEASON_WEEKS },
    league: { ...base.league, phase: "REGULAR_SEASON_GAME", week: REGULAR_SEASON_WEEKS },
    game: {
      ...initGameSim({
        homeTeamId: matchup.homeTeamId,
        awayTeamId: matchup.awayTeamId,
        seed: 22222,
        weekType: "REGULAR_SEASON",
        weekNumber: REGULAR_SEASON_WEEKS,
        coachArchetypeId: base.coach.archetypeId,
        coachTenureYear: base.coach.tenureYear,
        coachUnlockedPerkIds: base.coach.unlockedPerkIds,
      }),
      homeScore: 21,
      awayScore: 14,
      clock: { quarter: 4, timeRemainingSec: 0 },
    },
  };
}

describe("playoffs transition after week 17 via pbp", () => {
  it("initializes playoffs and moves league phase to WILD_CARD", () => {
    const state = buildWeek17PbpState();
    const next = gameReducerMonolith(state, { type: "RESOLVE_PLAY", payload: { playType: "RUN" } });

    expect(next.playoffs).toBeTruthy();
    expect(next.league.phase).toBe("WILD_CARD");
  });
});
