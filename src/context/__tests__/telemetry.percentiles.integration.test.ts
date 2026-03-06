import { describe, expect, it } from "vitest";
import { createInitialStateForTests, migrateSave } from "@/context/GameContext";

describe("telemetry percentile persistence integration", () => {
  it("provides telemetry percentile defaults in fresh state", () => {
    const state = createInitialStateForTests();
    expect(state.telemetry?.playLogsByGameKey).toEqual({});
    expect(state.telemetry?.percentiles).toEqual({});
  });

  it("adds telemetry percentile defaults during migration and preserves existing entries", () => {
    const withoutTelemetry = migrateSave({ season: 2027, week: 3, saveVersion: 5 } as any);
    expect(withoutTelemetry.telemetry?.playLogsByGameKey).toEqual({});
    expect(withoutTelemetry.telemetry?.percentiles).toEqual({});

    const withTelemetry = migrateSave({
      season: 2027,
      week: 3,
      saveVersion: 5,
      telemetry: {
        playLogsByGameKey: { k1: [] },
        percentiles: {
          2027: {
            "2027:QB:passingYards:4": {
              season: 2027,
              posGroup: "QB",
              metric: "passingYards",
              sampleField: "gamesPlayed",
              minSamples: 4,
              sampleSize: 1,
              valuesByPlayerId: { PLY_1: 100 },
            },
          },
        },
      },
    } as any);

    expect(withTelemetry.telemetry?.playLogsByGameKey).toEqual({ k1: [] });
    expect(withTelemetry.telemetry?.percentiles?.[2027]?.["2027:QB:passingYards:4"]?.valuesByPlayerId?.PLY_1).toBe(100);
  });
});
