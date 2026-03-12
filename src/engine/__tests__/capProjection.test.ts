import { describe, expect, it } from "vitest";
import { projectLeagueCap, CAP_GROWTH_RATE } from "@/engine/capProjection";

const BASE_CAP = 200_000_000;
const round50k = (n: number) => Math.round(n / 50_000) * 50_000;

describe("projectLeagueCap", () => {
  it("returns baseCap (rounded to 50k) when targetYear equals baseSeason", () => {
    expect(projectLeagueCap(BASE_CAP, 2026, 2026)).toBe(round50k(BASE_CAP));
  });

  it("returns baseCap (rounded to 50k) when targetYear is in the past", () => {
    expect(projectLeagueCap(BASE_CAP, 2024, 2026)).toBe(round50k(BASE_CAP));
    expect(projectLeagueCap(BASE_CAP, 2020, 2026)).toBe(round50k(BASE_CAP));
  });

  it("applies one year of growth for delta=1", () => {
    const expected = round50k(BASE_CAP * (1 + CAP_GROWTH_RATE));
    expect(projectLeagueCap(BASE_CAP, 2027, 2026)).toBe(expected);
  });

  it("applies compound growth correctly for delta=2", () => {
    const expected = round50k(BASE_CAP * Math.pow(1 + CAP_GROWTH_RATE, 2));
    expect(projectLeagueCap(BASE_CAP, 2028, 2026)).toBe(expected);
  });

  it("applies compound growth correctly for delta=3", () => {
    const expected = round50k(BASE_CAP * Math.pow(1 + CAP_GROWTH_RATE, 3));
    expect(projectLeagueCap(BASE_CAP, 2029, 2026)).toBe(expected);
  });

  it("is strictly increasing year over year", () => {
    const cap2026 = projectLeagueCap(BASE_CAP, 2026, 2026);
    const cap2027 = projectLeagueCap(BASE_CAP, 2027, 2026);
    const cap2028 = projectLeagueCap(BASE_CAP, 2028, 2026);
    expect(cap2027).toBeGreaterThan(cap2026);
    expect(cap2028).toBeGreaterThan(cap2027);
  });

  it("is deterministic — same inputs always produce same output", () => {
    const a = projectLeagueCap(250_000_000, 2030, 2026);
    const b = projectLeagueCap(250_000_000, 2030, 2026);
    expect(a).toBe(b);
  });

  it("rounds output to the nearest 50,000", () => {
    // Any output should be divisible by 50,000
    for (const delta of [0, 1, 2, 3, 5, 10]) {
      const result = projectLeagueCap(BASE_CAP, 2026 + delta, 2026);
      expect(result % 50_000).toBe(0);
    }
  });

  it("handles a very large base cap without overflowing", () => {
    const largeCap = 1_000_000_000;
    const result = projectLeagueCap(largeCap, 2036, 2026);
    expect(result).toBeGreaterThan(largeCap);
    expect(Number.isFinite(result)).toBe(true);
  });
});
