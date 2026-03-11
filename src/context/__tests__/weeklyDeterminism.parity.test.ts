import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, REGULAR_SEASON_WEEKS, type GameState } from "@/context/GameContext";
import { deriveWeeklySeed } from "@/engine/determinism/seedDerivation";
import { initGameSim } from "@/engine/gameSim";
import { getTeamMatchup } from "@/engine/schedule";

function buildRegularSeasonState(week: number): GameState {
  const base = createInitialStateForTests();
  const teamId = String(base.acceptedOffer?.teamId ?? "");
  if (!teamId || !base.hub.schedule) return base;
  const weekSchedule = base.hub.schedule.regularSeasonWeeks.find((w) => w.week === week);
  const matchup = weekSchedule ? getTeamMatchup(weekSchedule, teamId) : null;
  if (!matchup) return base;

  return {
    ...base,
    saveSeed: 12345,
    careerSeed: 12345,
    careerStage: "REGULAR_SEASON",
    league: { ...base.league, phase: "REGULAR_SEASON_GAME", week },
    hub: { ...base.hub, regularSeasonWeek: week },
    game: {
      ...initGameSim({
        homeTeamId: matchup.homeTeamId,
        awayTeamId: matchup.awayTeamId,
        seed: 12345,
        weekType: "REGULAR_SEASON",
        weekNumber: week,
        coachArchetypeId: base.coach.archetypeId,
        coachTenureYear: base.coach.tenureYear,
        coachUnlockedPerkIds: base.coach.unlockedPerkIds,
      }),
      homeScore: 24,
      awayScore: 20,
      clock: { quarter: 4, timeRemainingSec: 0 },
    },
  };
}

describe("weekly determinism parity", () => {
  it("derives identical weekly seeds for identical inputs", () => {
    const seedA = deriveWeeklySeed(12345, 2028, 7, 202);
    const seedB = deriveWeeklySeed(12345, 2028, 7, 202);
    expect(seedA).toBe(seedB);
  });

  it("produces identical weekly outputs for identical input state/action", () => {
    const week = Math.min(2, REGULAR_SEASON_WEEKS);
    const inputA = buildRegularSeasonState(week);
    const inputB = structuredClone(inputA);

    const outA = gameReducerMonolith(inputA, { type: "ADVANCE_WEEK" });
    const outB = gameReducerMonolith(inputB, { type: "ADVANCE_WEEK" });

    const weekKey = `${inputA.season}-W${week}`;
    expect(outA.medical.injuryReportsByWeek[weekKey]).toEqual(outB.medical.injuryReportsByWeek[weekKey]);
    expect(outA.media.storiesByWeek[weekKey]).toEqual(outB.media.storiesByWeek[weekKey]);
    expect(outA.weeklyResults).toEqual(outB.weeklyResults);
  });
});
