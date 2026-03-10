import { describe, expect, it } from "vitest";
import { buildPercentiles, upsertSeasonPercentiles } from "@/engine/telemetry/percentiles";

describe("telemetry percentiles", () => {
  it("uses deterministic hash tie-breaker for equal metric values", () => {
    const players = [
      { playerId: "PLY_A", pos: "WR" },
      { playerId: "PLY_B", pos: "WR" },
    ];
    const playerSeasonStatsById = {
      PLY_A: [{ season: 2026, teamId: "A", gamesPlayed: 17, receivingYards: 900 }],
      PLY_B: [{ season: 2026, teamId: "A", gamesPlayed: 17, receivingYards: 900 }],
    };

    const first = buildPercentiles({
      season: 2026,
      players,
      playerSeasonStatsById,
      rules: [{ metric: "receivingYards", sampleField: "gamesPlayed", minSamples: 1 }],
    });
    const second = buildPercentiles({
      season: 2026,
      players: [...players].reverse(),
      playerSeasonStatsById,
      rules: [{ metric: "receivingYards", sampleField: "gamesPlayed", minSamples: 1 }],
    });

    expect(first).toEqual(second);
    const table = Object.values(first)[0]!;
    expect(Object.values(table.valuesByPlayerId).sort((a, b) => b - a)).toEqual([100, 0]);
  });

  it("omits players that do not pass metric sample threshold", () => {
    const out = buildPercentiles({
      season: 2026,
      players: [
        { playerId: "QB_OK", pos: "QB" },
        { playerId: "QB_LOW", pos: "QB" },
      ],
      playerSeasonStatsById: {
        QB_OK: [{ season: 2026, teamId: "T1", gamesPlayed: 10, passingYards: 3000 }],
        QB_LOW: [{ season: 2026, teamId: "T1", gamesPlayed: 3, passingYards: 3500 }],
      },
      rules: [{ metric: "passingYards", sampleField: "gamesPlayed", minSamples: 4 }],
    });

    const table = Object.values(out)[0]!;
    expect(table.sampleSize).toBe(1);
    expect(table.valuesByPlayerId.QB_OK).toBe(100);
    expect(table.valuesByPlayerId.QB_LOW).toBeUndefined();
  });

  it("bounds persisted percentile tables to active season window", () => {
    const with2024 = upsertSeasonPercentiles({
      existing: {},
      season: 2024,
      tables: { "2024:QB:passingYards:4": { season: 2024, posGroup: "QB", metric: "passingYards", sampleField: "gamesPlayed", minSamples: 4, sampleSize: 1, valuesByPlayerId: { A: 100 } } },
      activeSeason: 2024,
      windowSeasons: 2,
    });
    const with2025 = upsertSeasonPercentiles({
      existing: with2024,
      season: 2025,
      tables: { "2025:QB:passingYards:4": { season: 2025, posGroup: "QB", metric: "passingYards", sampleField: "gamesPlayed", minSamples: 4, sampleSize: 1, valuesByPlayerId: { B: 100 } } },
      activeSeason: 2025,
      windowSeasons: 2,
    });
    const with2026 = upsertSeasonPercentiles({
      existing: with2025,
      season: 2026,
      tables: { "2026:QB:passingYards:4": { season: 2026, posGroup: "QB", metric: "passingYards", sampleField: "gamesPlayed", minSamples: 4, sampleSize: 1, valuesByPlayerId: { C: 100 } } },
      activeSeason: 2026,
      windowSeasons: 2,
    });

    expect(Object.keys(with2026).map(Number).sort((a, b) => a - b)).toEqual([2025, 2026]);
  });
});
