import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("telemetry rollover retention", () => {
  it("preserves current season seasonAgg into historical telemetry", () => {
    const base = createInitialStateForTests();
    const state = {
      ...base,
      season: 2030,
      telemetry: {
        ...(base.telemetry ?? { playLogsByGameKey: {}, gameAggsByGameKey: {}, seasonAgg: { version: 1, byTeamId: {}, appliedGameKeys: {} }, percentiles: {} }),
        seasonAgg: {
          version: 1,
          appliedGameKeys: { "2030:REGULAR_SEASON:1:A:B": true },
          byTeamId: {
            A: { games: 1, totals: { passAttempts: 30, completions: 20, passYards: 250, interceptions: 1, sacksTaken: 2, rushAttempts: 20, rushYards: 90 }, rollingLast4: [], rollingLast8: [] },
          },
        },
      },
    };

    const next = gameReducer(state, { type: "ADVANCE_SEASON" });
    expect(next.historicalTelemetry.bySeason[2030]?.byTeamId?.A?.totals?.passYards).toBe(250);
  }, 20_000);

  it("compacts old season play logs beyond retention window", () => {
    const base = createInitialStateForTests();
    const state = {
      ...base,
      season: 2032,
      telemetry: {
        ...(base.telemetry ?? { playLogsByGameKey: {}, gameAggsByGameKey: {}, seasonAgg: { version: 1, byTeamId: {}, appliedGameKeys: {} }, percentiles: {} }),
        playLogsByGameKey: {
          "2026:REGULAR_SEASON:1:A:B": [{ version: 1, playIndex: 1, drive: 1, playInDrive: 1, quarter: 1, clockSec: 900, possession: "HOME", down: 1, distance: 10, ballOn: 25, playType: "RUN", result: "3 yards", homeScore: 0, awayScore: 0 }],
          "2032:REGULAR_SEASON:1:A:B": [{ version: 1, playIndex: 1, drive: 1, playInDrive: 1, quarter: 1, clockSec: 900, possession: "HOME", down: 1, distance: 10, ballOn: 25, playType: "RUN", result: "4 yards", homeScore: 0, awayScore: 0 }],
        },
      },
      historicalTelemetry: {
        bySeason: {
          2026: { version: 1, byTeamId: {}, appliedGameKeys: {} },
        },
      },
    };

    const next = gameReducer(state, { type: "ADVANCE_SEASON" });
    expect(next.telemetry?.playLogsByGameKey["2026:REGULAR_SEASON:1:A:B"]).toBeUndefined();
    expect(next.telemetry?.playLogsByGameKey["2032:REGULAR_SEASON:1:A:B"]).toBeDefined();
  }, 20_000);
});
