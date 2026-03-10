import { describe, expect, it } from "vitest";
import { applyDefensiveCallMultipliers } from "@/engine/defense/defensiveCalls";

describe("defensive call impact", () => {
  it("BLITZ bumps sack probability vs NONE", () => {
    const none = applyDefensiveCallMultipliers({ kind: "PRESSURE", pressure: "NONE", blitzRate: 0 });
    const blitz = applyDefensiveCallMultipliers({ kind: "PRESSURE", pressure: "BLITZ", blitzRate: 2 });
    expect(blitz.sackProb).toBeGreaterThan(none.sackProb);
  });

  it("QUARTERS lowers explosive probability vs MAN", () => {
    const man = applyDefensiveCallMultipliers({ kind: "SHELL", shell: "MAN", press: false });
    const quarters = applyDefensiveCallMultipliers({ kind: "SHELL", shell: "QUARTERS", press: false });
    expect(quarters.pExpl).toBeLessThan(man.pExpl);
  });
});
