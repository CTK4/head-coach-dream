import { describe, expect, it } from "vitest";
import { REGULAR_SEASON_WEEKS, generateLeagueSchedule } from "@/engine/schedule";
import { initTeamStandings, simulateWeek } from "@/engine/leagueSim";

describe("cpu-only multi-season stability", () => {
  it("simulates 5 seasons with rankings and awards", () => {
    const teamIds = Array.from({ length: 32 }, (_, i) => `CPU_${i + 1}`);
    let lastWeek: ReturnType<typeof simulateWeek> | null = null;

    for (let season = 1; season <= 5; season += 1) {
      const schedule = generateLeagueSchedule(teamIds, 9000 + season);
      let standings = initTeamStandings(teamIds);
      const prior: ReturnType<typeof simulateWeek>[] = [];

      for (let week = 1; week <= REGULAR_SEASON_WEEKS; week += 1) {
        const first = schedule.regularSeasonWeeks[week - 1].matchups[0];
        const result = simulateWeek({
          schedule,
          gameType: "REGULAR_SEASON",
          week,
          userHomeTeamId: first.homeTeamId,
          userAwayTeamId: first.awayTeamId,
          seed: 10101 + season,
          previousStandings: standings,
          priorWeekResults: prior,
        });
        standings = result.updatedStandings;
        prior.push(result);
        lastWeek = result;
      }

      expect(lastWeek?.powerRankings?.length).toBe(32);
      expect(lastWeek?.awardsWinners?.MVP).toBeTruthy();
      const totalRecordGames = standings.reduce((sum, team) => sum + team.wins + team.losses, 0);
      expect(totalRecordGames).toBeLessThanOrEqual(32 * REGULAR_SEASON_WEEKS);
      expect(totalRecordGames).toBeGreaterThan(500);
    }
  });
});
