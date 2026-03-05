import { describe, expect, it } from "vitest";
import { assertTraitBalance, type CoachProfile, type CoachTrait } from "@/data/coachTraits";
import { applyStaffModifiers, coachAttrModifier, coachFitScore, netCoachImpact, tenureMultiplier } from "@/engine/coachImpact";

const eliteBoostTrait: CoachTrait = {
  id: "elite_boost",
  label: "Elite Boost",
  tier: "Elite",
  description: "",
  affinityMap: { accuracy: 1, one: -1, two: -1, three: -1, four: -1 },
};

const eliteDragTrait: CoachTrait = {
  id: "elite_drag",
  label: "Elite Drag",
  tier: "Elite",
  description: "",
  // 1 positive (six) and 6 negatives → net negative at base=50:
  // 1×(+5) + 6×(−2) = 5 − 12 = −7. BASE_BOOST(0.10) doubles BASE_DRAG(0.05)
  // so we need neg/pos > 2 to ensure overall negative impact.
  affinityMap: { awareness: -1, one: -1, two: -1, three: -1, four: -1, five: -1, six: 1 },
  affinityMap: { awareness: -1, one: 1, two: -1, three: -1, four: -1, five: -1, six: -1 },
};

function makeCoach(traits: CoachTrait[], tenureYears = 0): CoachProfile {
  return {
    coachId: "c1",
    name: "Coach",
    role: "OC",
    traits,
    tenureYears,
    salary: 1,
  };
}

describe("coach impact", () => {
  it("tenureMultiplier(0) === 1.00", () => {
    expect(tenureMultiplier(0)).toBe(1);
  });

  it("tenureMultiplier(5) === 1.25", () => {
    expect(tenureMultiplier(5)).toBe(1.25);
  });

  it("tenureMultiplier(10) === 1.25 (capped)", () => {
    expect(tenureMultiplier(10)).toBe(1.25);
  });

  it("coachAttrModifier +1 Elite 0 tenure returns 0.10", () => {
    const coach = makeCoach([eliteBoostTrait], 0);
    expect(coachAttrModifier(coach, "accuracy")).toBe(0.1);
  });

  it("coachAttrModifier -1 Elite any tenure returns -0.05", () => {
    const coach = makeCoach([eliteDragTrait], 8);
    expect(coachAttrModifier(coach, "awareness")).toBe(-0.05);
  });

  it("applyStaffModifiers stacks multiplicatively", () => {
    const c1 = makeCoach([eliteBoostTrait], 0);
    const c2 = makeCoach([eliteBoostTrait], 0);
    const base = 50;
    const single = applyStaffModifiers(base, "accuracy", [c1]);
    const stacked = applyStaffModifiers(base, "accuracy", [c1, c2]);
    expect(stacked).toBeGreaterThan(single);
    expect(stacked).toBeLessThan(single * 2);
  });

  it("applyStaffModifiers clamps to [0, 99]", () => {
    const c1 = makeCoach([eliteBoostTrait], 10);
    const high = applyStaffModifiers(99, "accuracy", [c1, c1, c1]);
    const low = applyStaffModifiers(0, "awareness", [makeCoach([eliteDragTrait], 0)]);
    expect(high).toBeLessThanOrEqual(99);
    expect(low).toBeGreaterThanOrEqual(0);
  });

  it("assertTraitBalance throws for malformed trait", () => {
    const bad: CoachTrait = {
      id: "bad",
      label: "bad",
      tier: "Basic",
      description: "",
      affinityMap: { a: 1, b: 1, c: 1 },
    };
    expect(() => assertTraitBalance([bad])).toThrow();
  });

  it("coachFitScore returns a value in [0, 100]", () => {
    const fit = coachFitScore(makeCoach([eliteBoostTrait], 0), { accuracy: 75, awareness: 60, speed: 88 });
    expect(fit).toBeGreaterThanOrEqual(0);
    expect(fit).toBeLessThanOrEqual(100);
  });

  it("netCoachImpact is negative for negative-leaning coach", () => {
    const coach = makeCoach([eliteDragTrait], 0);
    const impact = netCoachImpact(coach, { awareness: 50, one: 50, two: 50, three: 50, four: 50, five: 50, six: 50 });
    expect(impact).toBeLessThan(0);
  });
});
