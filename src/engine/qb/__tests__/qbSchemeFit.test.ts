import { describe, expect, it } from "vitest";
import { getQbSchemeFitMultiplier } from "@/engine/qb/qbSchemeFit";

describe("qb scheme fit", () => {
  it("dual threat spread rpo", () => {
    expect(getQbSchemeFitMultiplier("DUAL_THREAT", "SPREAD_RPO")).toBe(1.15);
  });

  it("dual threat pro style balanced", () => {
    expect(getQbSchemeFitMultiplier("DUAL_THREAT", "PRO_STYLE_BALANCED")).toBe(0.88);
  });
});
