import { describe, expect, it } from "vitest";
import {
  BASE_DEV_WEIGHTS,
  CLASS_QUALITY_TABLE,
  POSITION_OVR_WEIGHTS,
  type Position,
} from "@/data/playerGeneratorConfig";
import { generateDraftClass, generatePlayer } from "@/engine/playerGenerator";

describe("playerGenerator", () => {
  it("generatePlayer is deterministic for identical options", () => {
    const opts = { classYear: 2029, position: "QB" as Position, seed: 12345, draftRound: 2 };
    expect(generatePlayer(opts)).toEqual(generatePlayer(opts));
  });

  it("all attrs are integers in [0,99]", () => {
    const p = generatePlayer({ classYear: 2029, position: "WR", seed: 22 });
    for (const value of Object.values(p.attrs)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(99);
    }
  });

  it("potential attrs are always >= current attrs", () => {
    const p = generatePlayer({ classYear: 2029, position: "EDGE", seed: 8, draftRound: 5 });
    for (const attr of Object.keys(p.attrs)) {
      expect(p.potential[attr]).toBeGreaterThanOrEqual(p.attrs[attr]);
    }
  });

  it("potentialOvr >= ovr", () => {
    const p = generatePlayer({ classYear: 2028, position: "OT", seed: 444 });
    expect(p.potentialOvr).toBeGreaterThanOrEqual(p.ovr);
  });

  it("ovr is in [40,99]", () => {
    const p = generatePlayer({ classYear: 2028, position: "LB", seed: 789 });
    expect(p.ovr).toBeGreaterThanOrEqual(40);
    expect(p.ovr).toBeLessThanOrEqual(99);
  });

  it("round 1 players have higher average potential OVR than round 7 players", () => {
    const r1 = Array.from({ length: 50 }, (_, i) => generatePlayer({ classYear: 2029, position: "QB", seed: 1000 + i, draftRound: 1 }));
    const r7 = Array.from({ length: 50 }, (_, i) => generatePlayer({ classYear: 2029, position: "QB", seed: 2000 + i, draftRound: 7 }));
    const mean = (arr: { potentialOvr: number }[]) => arr.reduce((sum, p) => sum + p.potentialOvr, 0) / arr.length;
    expect(mean(r1)).toBeGreaterThan(mean(r7));
  });

  it("higher class quality yields higher mean OVR", () => {
    CLASS_QUALITY_TABLE[2040] = 1.15;
    CLASS_QUALITY_TABLE[2041] = 0.85;
    const hi = Array.from({ length: 100 }, (_, i) => generatePlayer({ classYear: 2040, position: "WR", seed: 3000 + i }));
    const lo = Array.from({ length: 100 }, (_, i) => generatePlayer({ classYear: 2041, position: "WR", seed: 4000 + i }));
    const mean = (arr: { ovr: number }[]) => arr.reduce((sum, p) => sum + p.ovr, 0) / arr.length;
    expect(mean(hi)).toBeGreaterThan(mean(lo));
  });

  it("overrides force attr values", () => {
    const p = generatePlayer({ classYear: 2028, position: "QB", seed: 7, overrides: { speed: 99, accuracy: 10 } });
    expect(p.attrs.speed).toBe(99);
    expect(p.attrs.accuracy).toBe(10);
  });

  it("scrambler QBs have higher mean speed than pocket passers", () => {
    const scramblers = Array.from({ length: 50 }, (_, i) => generatePlayer({ classYear: 2029, position: "QB", seed: 5000 + i, archetype: "scrambler" }));
    const pocket = Array.from({ length: 50 }, (_, i) => generatePlayer({ classYear: 2029, position: "QB", seed: 6000 + i, archetype: "pocket_passer" }));
    const meanSpeed = (arr: ReturnType<typeof generatePlayer>[]) => arr.reduce((sum, p) => sum + p.attrs.speed, 0) / arr.length;
    expect(meanSpeed(scramblers)).toBeGreaterThan(meanSpeed(pocket));
  });

  it("generateDraftClass returns requested total players", () => {
    expect(generateDraftClass(2030, 99).length).toBe(256);
    expect(generateDraftClass(2030, 99, { totalPlayers: 180 }).length).toBe(180);
  });

  it("generateDraftClass output is sorted descending by OVR", () => {
    const cls = generateDraftClass(2031, 123, { totalPlayers: 120 });
    for (let i = 1; i < cls.length; i += 1) {
      expect(cls[i - 1].ovr).toBeGreaterThanOrEqual(cls[i].ovr);
    }
  });

  it("dev trait distribution is statistically plausible", () => {
    const n = 10_000;
    const counts = { generational: 0, elite: 0, impact: 0, normal: 0 };
    for (let i = 0; i < n; i += 1) {
      const p = generatePlayer({ classYear: 2030, position: "RB", seed: 7000 + i });
      counts[p.devTrait] += 1;
    }

    for (const [trait, base] of Object.entries(BASE_DEV_WEIGHTS) as Array<[keyof typeof BASE_DEV_WEIGHTS, number]>) {
      const observed = counts[trait] / n;
      const min = base * 0.8;
      const max = base * 1.2;
      expect(observed).toBeGreaterThanOrEqual(min);
      expect(observed).toBeLessThanOrEqual(max);
    }
  });

  it("player name is non-empty", () => {
    const p = generatePlayer({ classYear: 2031, position: "TE", seed: 42 });
    expect(p.name.trim().length).toBeGreaterThan(0);
  });

  it("playerId follows expected pattern", () => {
    const p = generatePlayer({ classYear: 2031, position: "TE", seed: 42 });
    expect(p.playerId).toBe("GEN_2031_TE_42");
  });

  it("all position OVR weights sum to 1.0", () => {
    for (const [position, weights] of Object.entries(POSITION_OVR_WEIGHTS) as Array<[Position, Record<string, number>]>) {
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1)).toBeLessThanOrEqual(0.001);
      expect(position).toBeTruthy();
    }
  });
});
