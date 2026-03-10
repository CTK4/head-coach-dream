import { describe, expect, it, vi } from "vitest";
import { DEFENSIVE_REACTION_TABLE, DISTANCE_BUCKETS, DOWNS, MATCHUP_MODIFIER_MATRIX, PERSONNEL_PACKAGES, getDefensiveReaction, getMatchupModifier, selectDefensivePackageFromRoll } from "@/engine/personnel";
import { composeExecutionModifiers } from "@/engine/gameSim";
import { computeFatigueEffects } from "@/engine/fatigue";

describe("personnel table coverage", () => {
  it("has full down-distance-personnel coverage", () => {
    for (const down of DOWNS) {
      for (const bucket of DISTANCE_BUCKETS) {
        for (const off of PERSONNEL_PACKAGES) {
          expect(DEFENSIVE_REACTION_TABLE[down][bucket][off]).toBeDefined();
        }
      }
    }
  });

  it("reaction probabilities sum to 100", () => {
    for (const down of DOWNS) {
      for (const bucket of DISTANCE_BUCKETS) {
        for (const off of PERSONNEL_PACKAGES) {
          const sum = DEFENSIVE_REACTION_TABLE[down][bucket][off].reduce((s, r) => s + r.probability, 0);
          expect(sum).toBe(100);
        }
      }
    }
  });

  it("has full modifier matrix", () => {
    for (const off of PERSONNEL_PACKAGES) {
      expect(Object.keys(MATCHUP_MODIFIER_MATRIX[off]).length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("matchup behavior", () => {
  it("12 vs Nickel gives higher run efficiency than 11 vs Nickel", () => {
    expect(getMatchupModifier("12", "Nickel").runEfficiency).toBeGreaterThan(getMatchupModifier("11", "Nickel").runEfficiency);
  });

  it("fallback returns neutral modifiers and warns", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mod = getMatchupModifier("11", "Nickel");
    expect(mod.passEfficiency).toBeGreaterThan(0);
    const fallback = getMatchupModifier("11", "Imaginary" as never);
    expect(fallback).toEqual({ runEfficiency: 1, passEfficiency: 1, pressureRisk: 1 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("deterministic package selection works from probability roll", () => {
    const reactions = getDefensiveReaction(1, 10, "11");
    const pick = selectDefensivePackageFromRoll(reactions, 0.2);
    expect(typeof pick).toBe("string");
  });

  it("personnel and fatigue modifiers compose multiplicatively", () => {
    const fatigue = computeFatigueEffects(85);
    const composed = composeExecutionModifiers({
      fatigueMod: fatigue.accuracy,
      matchupMod: getMatchupModifier("10", "Base").passEfficiency,
      pressureRisk: getMatchupModifier("10", "Base").pressureRisk,
      isRun: false,
    });
    expect(composed).toBeLessThan(getMatchupModifier("10", "Base").passEfficiency);
    expect(composed).not.toBe(fatigue.accuracy);
  });
});
