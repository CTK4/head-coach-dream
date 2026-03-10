import { describe, expect, it } from "vitest";
import { applyGameAggToSeasonAgg } from "@/engine/telemetry/aggregateSeason";
import type { GameAggV1 } from "@/engine/telemetry/types";

function gameAgg(gameNumber: number): GameAggV1 {
  return {
    version: 1,
    season: 2026,
    weekType: "REGULAR_SEASON",
    weekNumber: gameNumber,
    homeTeamId: "A",
    awayTeamId: "B",
    byTeamId: {
      A: { passAttempts: 20 + gameNumber, completions: 10, passYards: 200, interceptions: 1, sacksTaken: 2, rushAttempts: 25, rushYards: 100 },
      B: { passAttempts: 30, completions: 18, passYards: 260, interceptions: 0, sacksTaken: 1, rushAttempts: 22, rushYards: 90 },
    },
  };
}

describe("applyGameAggToSeasonAgg", () => {
  it("accumulates totals with bounded rolling windows and dedupes by game key", () => {
    let seasonAgg = undefined;

    for (let week = 1; week <= 9; week += 1) {
      seasonAgg = applyGameAggToSeasonAgg({ seasonAgg, gameAgg: gameAgg(week), gameKey: `2026:REGULAR_SEASON:${week}:A:B` });
    }

    expect(seasonAgg.byTeamId.A.games).toBe(9);
    expect(seasonAgg.byTeamId.A.rollingLast4).toHaveLength(4);
    expect(seasonAgg.byTeamId.A.rollingLast8).toHaveLength(8);
    expect(seasonAgg.byTeamId.A.rollingLast4[0]?.gameKey).toContain(":6:");
    expect(seasonAgg.byTeamId.A.rollingLast8[0]?.gameKey).toContain(":2:");

    const deduped = applyGameAggToSeasonAgg({
      seasonAgg,
      gameAgg: gameAgg(9),
      gameKey: "2026:REGULAR_SEASON:9:A:B",
    });
    expect(deduped).toBe(seasonAgg);
  });
});
