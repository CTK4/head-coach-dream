import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay } from "@/engine/gameSim";
import { clampFatigue, getRecoveryRate, pushLast3SnapLoad, recoverFatigue } from "@/engine/fatigue";
import { migrateSave } from "@/context/GameContext";

describe("fatigue utilities", () => {
  it("clamps fatigue into [0,100]", () => {
    expect(clampFatigue(-25)).toBe(0);
    expect(clampFatigue(250)).toBe(100);
  });

  it("maintains true rolling 3-game snap load window", () => {
    let window: number[] = [];
    window = pushLast3SnapLoad(window, 20);
    window = pushLast3SnapLoad(window, 30);
    window = pushLast3SnapLoad(window, 40);
    window = pushLast3SnapLoad(window, 50);
    expect(window).toEqual([30, 40, 50]);
  });

  it("applies recovery rate by position", () => {
    const rbRecovered = recoverFatigue(90, getRecoveryRate("RB"));
    const qbRecovered = recoverFatigue(90, getRecoveryRate("QB"));
    expect(rbRecovered).toBe(76);
    expect(qbRecovered).toBe(72);
  });
});

describe("fatigue in simulation", () => {
  it("high-usage RB YPC declines over sustained workload", () => {
    let sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 77,
      trackedPlayers: { HOME: { RB: "RB1", QB: "QB1", OL: "OL1", WR: "WR1", TE: "TE1", DL: "DL1", LB: "LB1", DB: "DB1" }, AWAY: { RB: "RB2", QB: "QB2", OL: "OL2", WR: "WR2", TE: "TE2", DL: "DL2", LB: "LB2", DB: "DB2" } },
      playerFatigue: { RB1: 45, QB1: 45, OL1: 45, WR1: 45, TE1: 45, DL1: 45, LB1: 45, DB1: 45 },
    });

    const homeRushYards: number[] = [];
    for (let i = 0; i < 80; i++) {
      sim = stepPlay(sim, "INSIDE_ZONE").sim;
      const entry = sim.driveLog[0];
      if (entry?.possession !== "HOME") continue;
      const m = entry?.result.match(/for (-?\d+)y/);
      if (!m) continue;
      homeRushYards.push(Number(m[1]));
    }

    const first = homeRushYards.slice(0, 10).reduce((s, n) => s + n, 0) / Math.max(1, homeRushYards.slice(0, 10).length);
    const last = homeRushYards.slice(-10).reduce((s, n) => s + n, 0) / Math.max(1, homeRushYards.slice(-10).length);
    expect(last).toBeLessThan(first);
  });
});

describe("migration defaults", () => {
  it("defaults missing fatigue fields correctly", () => {
    const migrated = migrateSave({ season: 2026, saveSeed: 1, saveVersion: 1 });
    const values = Object.values(migrated.playerFatigueById ?? {});
    expect(values.length).toBeGreaterThan(0);
    expect(values[0]?.fatigue).toBe(50);
    expect(values[0]?.last3SnapLoads).toEqual([]);
  });
});
