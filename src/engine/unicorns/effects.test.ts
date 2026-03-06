import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay } from "@/engine/gameSim";
import type { GameWeather } from "@/engine/weather/generateGameWeather";

const RAIN_WEATHER: GameWeather = {
  isDome: false,
  condition: "RAIN",
  temperatureF: 42,
  windMph: 14,
  windTier: "MED",
  precipTier: "HEAVY",
  surface: "WET",
};

describe("unicorn sim effects", () => {
  it("unicorn QB in rain has reduced weather penalty vs non-unicorn", () => {
    const base = {
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 9102,
      weather: RAIN_WEATHER,
      trackedPlayers: {
        HOME: { QB: "QB1", RB: "RB1", WR: "WR1", TE: "TE1", OL: "OL1", DL: "DL1", LB: "LB1", DB: "DB1" },
        AWAY: { QB: "QB2", RB: "RB2", WR: "WR2", TE: "TE2", OL: "OL2", DL: "EDGE1", LB: "LB2", DB: "DB2" },
      } as any,
    };

    const withUnicorn = stepPlay(
      initGameSim({
        ...base,
        playerUnicorns: { QB1: { archetypeId: "QB_UNICORN_ARM_POWER", discoveredSeason: 2030, confidence: 0.95 } },
      }),
      "DROPBACK",
    ).sim;
    const withoutUnicorn = stepPlay(initGameSim(base), "DROPBACK").sim;

    expect(withUnicorn.lastResult?.includes("🦄")).toBe(true);
    const withYards = Number((withUnicorn.lastResult ?? "").match(/for (-?\d+)y/)?.[1] ?? "0");
    const withoutYards = Number((withoutUnicorn.lastResult ?? "").match(/for (-?\d+)y/)?.[1] ?? "0");
    expect(withYards).toBeGreaterThanOrEqual(withoutYards);
  });

  it("unicorn EDGE on blitz increases sack outcomes", () => {
    const sacks = (withEdgeUnicorn: boolean) => {
      let total = 0;
      for (let i = 0; i < 180; i += 1) {
        const sim = initGameSim({
          homeTeamId: "A",
          awayTeamId: "B",
          seed: 12000 + i,
          trackedPlayers: {
            HOME: { QB: "QB1", RB: "RB1", WR: "WR1", TE: "TE1", OL: "OL1", DL: "DL1", LB: "LB1", DB: "DB1" },
            AWAY: { QB: "QB2", RB: "RB2", WR: "WR2", TE: "TE2", OL: "OL2", DL: "EDGE1", LB: "LB2", DB: "DB2" },
          } as any,
          playerUnicorns: withEdgeUnicorn ? { EDGE1: { archetypeId: "EDGE_UNICORN_BURST", discoveredSeason: 2030, confidence: 0.91 } } : {},
        });
        const out = stepPlay(sim, "DROPBACK").sim;
        if ((out.lastResult ?? "").includes("Sack")) total += 1;
      }
      return total;
    };

    expect(sacks(true)).toBeGreaterThan(sacks(false));
  });

  it("does not apply effect when archetype has no configured modifiers", () => {
    const base = {
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 4411,
      trackedPlayers: {
        HOME: { QB: "QB1", RB: "RB1", WR: "WR1", TE: "TE1", OL: "OL1", DL: "DL1", LB: "LB1", DB: "DB1" },
        AWAY: { QB: "QB2", RB: "RB2", WR: "WR2", TE: "TE2", OL: "OL2", DL: "EDGE1", LB: "LB2", DB: "DB2" },
      } as any,
    };

    const withMissing = stepPlay(
      initGameSim({
        ...base,
        playerUnicorns: { QB1: { archetypeId: "QB_UNICORN_RAW_SUPERATH", discoveredSeason: 2030, confidence: 0.9 } },
      }),
      "QUICK_GAME",
    ).sim;
    const baseline = stepPlay(initGameSim(base), "QUICK_GAME").sim;

    expect(withMissing.lastResult).toBe(baseline.lastResult);
    expect((withMissing.unicornImpactLog ?? []).length).toBe(0);
  });
});
