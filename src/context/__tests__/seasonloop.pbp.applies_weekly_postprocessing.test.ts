import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, REGULAR_SEASON_WEEKS, type GameState } from "@/context/GameContext";
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
      homeScore: 27,
      awayScore: 17,
      clock: { quarter: 4, timeRemainingSec: 0 },
    },
  };
}

describe("season loop pbp post-processing", () => {
  it("applies weekly medical + media generation on RESOLVE_PLAY and matches ADVANCE_WEEK outputs", () => {
    const week = Math.min(2, REGULAR_SEASON_WEEKS);
    const weekKey = `${buildRegularSeasonState(week).season}-W${week}`;

    const pbpBase = buildRegularSeasonState(week);
    const pbpOut = gameReducerMonolith(pbpBase, { type: "RESOLVE_PLAY", payload: { playType: "RUN" } });

    const simBase = { ...buildRegularSeasonState(week), game: pbpBase.game };
    const simOut = gameReducerMonolith(simBase, { type: "ADVANCE_WEEK" });

    expect(pbpOut.medical.injuryReportsByWeek[weekKey]?.length ?? 0).toBeGreaterThan(0);
    expect(pbpOut.media.storiesByWeek[weekKey]?.length ?? 0).toBeGreaterThan(0);
    expect(pbpOut.medical.injuryReportsByWeek[weekKey]).toEqual(simOut.medical.injuryReportsByWeek[weekKey]);
    expect(pbpOut.media.storiesByWeek[weekKey]).toEqual(simOut.media.storiesByWeek[weekKey]);
  });
});
