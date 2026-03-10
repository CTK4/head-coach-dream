import { describe, expect, it } from "vitest";
import { buildCareerLeaderboards } from "@/engine/telemetry/analytics";

describe("buildCareerLeaderboards", () => {
  it("reads historical and current telemetry together", () => {
    const rows = buildCareerLeaderboards({
      currentSeason: 2030,
      historicalBySeason: {
        2028: {
          byTeamId: {
            AAA: { games: 17, totals: { passAttempts: 0, completions: 0, passYards: 4100, interceptions: 0, sacksTaken: 0, rushAttempts: 0, rushYards: 1300 }, rollingLast4: [], rollingLast8: [] },
          },
        },
      },
      currentSeasonAgg: {
        version: 1,
        appliedGameKeys: {},
        byTeamId: {
          AAA: { games: 4, totals: { passAttempts: 0, completions: 0, passYards: 1200, interceptions: 0, sacksTaken: 0, rushAttempts: 0, rushYards: 400 }, rollingLast4: [], rollingLast8: [] },
          BBB: { games: 4, totals: { passAttempts: 0, completions: 0, passYards: 1400, interceptions: 0, sacksTaken: 0, rushAttempts: 0, rushYards: 500 }, rollingLast4: [], rollingLast8: [] },
        },
      },
    });

    expect(rows[0]?.teamId).toBe("AAA");
    expect(rows[0]?.passYards).toBe(5300);
    expect(rows.find((r) => r.teamId === "BBB")?.passYards).toBe(1400);
  });
});
