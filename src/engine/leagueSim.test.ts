import { describe, expect, it } from "vitest";
import { initLeagueState, simulateLeagueWeek } from "@/engine/leagueSim";
import { generateLeagueSchedule } from "@/engine/schedule";

describe("league sim", () => {
  it("simulates an entire week and updates standings", () => {
    const teamIds = Array.from({ length: 32 }, (_, i) => `T${i}`);
    const schedule = generateLeagueSchedule(teamIds, 123);
    const league0 = initLeagueState(teamIds);

    const league1 = simulateLeagueWeek({
      schedule,
      gameType: "REGULAR_SEASON",
      week: 1,
      userHomeTeamId: schedule.regularSeasonWeeks[0].matchups[0].homeTeamId,
      userAwayTeamId: schedule.regularSeasonWeeks[0].matchups[0].awayTeamId,
      userScore: { homeScore: 21, awayScore: 17 },
      seed: 999,
      league: league0,
    });

    expect(league1.results.filter((r) => r.week === 1 && r.gameType === "REGULAR_SEASON").length).toBe(
      schedule.regularSeasonWeeks[0].matchups.length
    );

    const totals = Object.values(league1.standings).reduce((t, s) => t + s.w + s.l, 0);
    expect(totals).toBe(schedule.regularSeasonWeeks[0].matchups.length * 2);
  });
});
