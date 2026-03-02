import { describe, expect, it } from "vitest";
import { buildRookieContract } from "@/engine/contracts/rookieContract";

describe("buildRookieContract", () => {
  it("curves total value by pick", () => {
    const p1 = buildRookieContract({ overallPick: 1, round: 1, pickInRound: 1, year: 2026 });
    const p32 = buildRookieContract({ overallPick: 32, round: 1, pickInRound: 32, year: 2026 });
    const p224 = buildRookieContract({ overallPick: 224, round: 7, pickInRound: 32, year: 2026 });
    expect(p1.totalValue).toBeGreaterThan(p32.totalValue);
    expect(p32.totalValue).toBeGreaterThan(p224.totalValue);
  });

  it("returns four cap hits and fifth-year option by round", () => {
    const r1 = buildRookieContract({ overallPick: 1, round: 1, pickInRound: 1, year: 2026 });
    const r2 = buildRookieContract({ overallPick: 40, round: 2, pickInRound: 8, year: 2026 });
    expect(r1.capHitsByYear).toHaveLength(4);
    expect(r1.hasFifthYearOption).toBe(true);
    expect(r2.hasFifthYearOption).toBe(false);
  });
});
