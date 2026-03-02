import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolveQbBallistics, type QbBallisticsInput } from "@/engine/physics/qbBallistics";

const baseInput: QbBallisticsInput = {
  qb: { arm: 82, accuracy: 80, release: 78, spin: 77, fatigue01: 0.18 },
  context: { targetDepth: 24, windTier: "HIGH", precipTier: "LIGHT", throwOnRun: false },
};

describe("resolveQbBallistics", () => {
  it("is deterministic", () => {
    expect(resolveQbBallistics(baseInput, rng(900, "qb"))).toEqual(resolveQbBallistics(baseInput, rng(900, "qb")));
  });

  it("spin stability reduces deep variance in wind", () => {
    let lowSpin = 0;
    let highSpin = 0;
    for (let i = 0; i < 400; i += 1) {
      lowSpin += resolveQbBallistics({ ...baseInput, qb: { ...baseInput.qb, spin: 60 } }, rng(7000 + i, "spin")).deepVarianceMult;
      highSpin += resolveQbBallistics({ ...baseInput, qb: { ...baseInput.qb, spin: 95 } }, rng(7000 + i, "spin")).deepVarianceMult;
    }
    expect(highSpin / 400).toBeLessThan(lowSpin / 400);
  });
});
