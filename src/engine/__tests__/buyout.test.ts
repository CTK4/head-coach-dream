import { describe, expect, it } from "vitest";
import { buyoutTotal, splitBuyout } from "@/engine/buyout";

describe("buyoutTotal", () => {
  it("computes standard buyout at default 60% rate", () => {
    expect(buyoutTotal(10_000_000, 3)).toBe(18_000_000);
  });

  it("respects a custom buyout percentage", () => {
    expect(buyoutTotal(10_000_000, 2, 0.5)).toBe(10_000_000);
  });

  it("clamps buyoutPct to [0, 1]", () => {
    // pct > 1 should be treated as 1
    expect(buyoutTotal(10_000_000, 2, 1.5)).toBe(20_000_000);
    // pct < 0 should be treated as 0
    expect(buyoutTotal(10_000_000, 2, -0.5)).toBe(0);
  });

  it("returns 0 when remainingYears is 0", () => {
    expect(buyoutTotal(10_000_000, 0)).toBe(0);
  });

  it("returns 0 when remainingYears is negative (clamped)", () => {
    expect(buyoutTotal(10_000_000, -3)).toBe(0);
  });

  it("returns 0 when salary is 0", () => {
    expect(buyoutTotal(0, 5)).toBe(0);
  });

  it("rounds to nearest integer (no rounding guarantee on arbitrary values)", () => {
    // salary=1, years=3, pct=0.6 → 1.8 → Math.round → 2
    expect(buyoutTotal(1, 3, 0.6)).toBe(2);
  });
});

describe("splitBuyout", () => {
  it("splits evenly when divisible", () => {
    expect(splitBuyout(120_000, 3)).toEqual([40_000, 40_000, 40_000]);
  });

  it("distributes remainder 1 by 1 across leading slots", () => {
    // 100 / 3 = 33 remainder 1 → [34, 33, 33]
    expect(splitBuyout(100, 3)).toEqual([34, 33, 33]);
  });

  it("uses 1 season when seasons is 0 or negative", () => {
    expect(splitBuyout(50, 0)).toEqual([50]);
    expect(splitBuyout(50, -2)).toEqual([50]);
  });

  it("caps at 4 seasons regardless of input", () => {
    const result = splitBuyout(400, 10);
    expect(result).toHaveLength(4);
    expect(result.reduce((a, b) => a + b, 0)).toBe(400);
  });

  it("handles 1 season", () => {
    expect(splitBuyout(1_000_000, 1)).toEqual([1_000_000]);
  });

  it("handles 4 seasons evenly", () => {
    expect(splitBuyout(400, 4)).toEqual([100, 100, 100, 100]);
  });

  it("sum of split always equals total", () => {
    for (const total of [0, 1, 99, 1_000_000, 13_333_333]) {
      for (const seasons of [1, 2, 3, 4]) {
        const parts = splitBuyout(total, seasons);
        expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      }
    }
  });
});
