import { describe, expect, it } from "vitest";
import { computeTerminationRisk, deterministicRoll, shouldFireDeterministic } from "@/engine/termination";

describe("termination risk", () => {
  it("produces stable deterministic rolls", () => {
    const a = deterministicRoll(123, "FIRE|S2026|Y2|W10|WEEKLY");
    const b = deterministicRoll(123, "FIRE|S2026|Y2|W10|WEEKLY");
    expect(a).toBe(b);
  });

  it("increases season-end risk in unsafe conditions", () => {
    const safe = computeTerminationRisk({
      saveSeed: 1,
      seasonYear: 2,
      seasonNumber: 2026,
      week: 10,
      checkpoint: "SEASON_END",
      jobSecurity: 90,
      ownerApproval: 90,
      financialRating: 90,
      cash: 20_000_000,
      deadMoneyThisSeason: 0,
      budgetBreaches: 0,
      goalsDelta: 10,
      winPct: 0.65,
    });

    const unsafe = computeTerminationRisk({
      saveSeed: 1,
      seasonYear: 2,
      seasonNumber: 2026,
      week: 10,
      checkpoint: "SEASON_END",
      jobSecurity: 20,
      ownerApproval: 30,
      financialRating: 25,
      cash: -20_000_000,
      deadMoneyThisSeason: 20_000_000,
      budgetBreaches: 4,
      goalsDelta: -80,
      winPct: 0.2,
    });

    expect(unsafe.p).toBeGreaterThan(safe.p);
  });

  it("respects probability in deterministic fire check", () => {
    expect(shouldFireDeterministic({ saveSeed: 9, key: "k", p: 0 })).toBe(false);
    expect(shouldFireDeterministic({ saveSeed: 9, key: "k", p: 1 })).toBe(true);
  });
});
