import { describe, expect, it } from "vitest";
import { initLeagueState, simulateLeagueWeek } from "@/engine/leagueSim";
import { simulatePlayoffs } from "@/engine/playoffsSim";
import { generateLeagueSchedule, REGULAR_SEASON_WEEKS } from "@/engine/schedule";

describe("full season integrity", () => {
  it("regular season -> playoffs -> champion, deterministic replay", () => {
    const teams = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seed = 424242;
    const schedule = generateLeagueSchedule(teams, seed);

    const run = () => {
      let league = initLeagueState(teams, 2026);
      for (let week = 1; week <= REGULAR_SEASON_WEEKS; week += 1) {
        const ws = schedule.regularSeasonWeeks.find((w) => w.week === week)!;
        const userMatch = ws.matchups[0];
        league = simulateLeagueWeek({
          schedule,
          gameType: "REGULAR_SEASON",
          week,
          userHomeTeamId: userMatch.homeTeamId,
          userAwayTeamId: userMatch.awayTeamId,
          userScore: { homeScore: 21, awayScore: 17 },
          seed: seed + week * 1013,
          league,
        });
      }
      return simulatePlayoffs({ league, season: 2026, seed });
    };

    const a = run();
    const b = run();
    expect(a.championTeamId).toBe(b.championTeamId);
    expect(Object.values(a.postseason.resultsByTeamId).some((x) => x.isChampion)).toBe(true);
  });
});
