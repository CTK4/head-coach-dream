import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolveCatchPoint, type CatchInput } from "@/engine/physics/catchPointResolver";

const baseInput: CatchInput = {
  qb: { accuracy: 78, arm: 80, decision: 76, pressure01: 0.3, fatigue01: 0.2 },
  wr: { heightIn: 73, weightLb: 198, speed: 85, hands: 80, jump: 82, strength: 70, balance: 78, fatigue01: 0.18 },
  cb: { heightIn: 71, speed: 83, coverage: 79, ballSkills: 76, strength: 71, fatigue01: 0.2 },
  context: {
    targetDepth: "DEEP",
    separationYds: 1.1,
    routeBreakSeverity01: 0.65,
    highPoint: true,
    contactAtCatch: "LIGHT",
    surface: "DRY",
  },
};

describe("resolveCatchPoint", () => {
  it("is deterministic for fixed seed", () => {
    const out = resolveCatchPoint(baseInput, rng(2222, "catch-fixed"));
    expect(out).toMatchInlineSnapshot(`
      {
        "catchType": "THROUGH_CONTACT",
        "completed": true,
        "debug": {
          "completionProb": 0.9,
          "completionRoll": 0.10419875523075461,
          "effSeparation": 0.8387919039874279,
          "reachAdvIn": 6.733333333333334,
          "sepDelta": -0.26120809601257217,
          "throwQ": 1.1686666666666665,
        },
        "intercepted": false,
        "pbu": false,
        "resultTags": [
          {
            "kind": "EXECUTION",
            "text": "HIGH_POINT_ADV:6.73",
          },
        ],
        "yacYards": 5,
      }
    `);
  });

  it("high-point WR height boost increases completion rate", () => {
    const contestedHighPoint: CatchInput = {
      ...baseInput,
      qb: { ...baseInput.qb, pressure01: 0.6, accuracy: 70 },
      wr: { ...baseInput.wr, hands: 72 },
      cb: { ...baseInput.cb, coverage: 84, ballSkills: 82 },
      context: { ...baseInput.context, separationYds: 0.3, contactAtCatch: "HEAVY", highPoint: true },
    };
    let baseCompleted = 0;
    let tallCompleted = 0;
    for (let i = 0; i < 500; i += 1) {
      const a = resolveCatchPoint(contestedHighPoint, rng(44100 + i, "catch-comp"));
      const b = resolveCatchPoint({ ...contestedHighPoint, wr: { ...contestedHighPoint.wr, heightIn: contestedHighPoint.wr.heightIn + 8 } }, rng(44100 + i, "catch-comp"));
      if (a.completed) baseCompleted += 1;
      if (b.completed) tallCompleted += 1;
    }
    expect(tallCompleted).toBeGreaterThan(baseCompleted);
  });

  it("route-break severity with WR COD edge shifts separation positively", () => {
    const advantageous: CatchInput = {
      ...baseInput,
      wr: { ...baseInput.wr, speed: 88, balance: 82 },
      cb: { ...baseInput.cb, speed: 79, coverage: 74 },
    };
    let low = 0;
    let high = 0;
    for (let i = 0; i < 500; i += 1) {
      low += resolveCatchPoint({ ...advantageous, context: { ...advantageous.context, routeBreakSeverity01: 0.15 } }, rng(99100 + i, `sep-low-${i}`)).debug.sepDelta;
      high += resolveCatchPoint({ ...advantageous, context: { ...advantageous.context, routeBreakSeverity01: 0.9 } }, rng(99100 + i, `sep-high-${i}`)).debug.sepDelta;
    }
    expect(high / 500).toBeGreaterThan(low / 500);
  });
});
