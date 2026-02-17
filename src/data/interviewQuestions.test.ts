import { describe, expect, it } from "vitest";
import { computeOwnerInterviewScore, premiumGatesPassed, type InterviewQuestion } from "@/data/interviewQuestions";

function q(id: string, delta: Record<string, number>): InterviewQuestion {
  return {
    id,
    type: "HC_INTERVIEW",
    cluster: "CORE",
    prompt: "P",
    answers: [
      { key: "A", text: "A", delta },
      { key: "B", text: "B", delta: {} },
    ],
  };
}

describe("computeOwnerInterviewScore", () => {
  it("matches expected normalized scoring + quality weighting", () => {
    const questions = [q("q1", { ADAPT: 2 }), q("q2", { AGGR: -2 })];
    const answersByQuestionId = { q1: 0, q2: 0 };
    const ownerAxisWeights = { stability: 1, aggression: 1 };

    const score = computeOwnerInterviewScore({ ownerAxisWeights, questions, answersByQuestionId });

    expect(score).toBeCloseTo(0.5, 8);
  });

  it("is higher for aligned deltas", () => {
    const questions = [q("q1", { ADAPT: 2 }), q("q2", { ADAPT: 2 })];
    const answersByQuestionId = { q1: 0, q2: 0 };
    const ownerAxisWeights = { stability: 1 };

    const score = computeOwnerInterviewScore({ ownerAxisWeights, questions, answersByQuestionId });

    expect(score).toBeCloseTo(0.75, 8);
  });

  it("returns 0.5 if no axis weights", () => {
    const questions = [q("q1", { ADAPT: 2 })];
    const answersByQuestionId = { q1: 0 };

    const score = computeOwnerInterviewScore({ ownerAxisWeights: {}, questions, answersByQuestionId });

    expect(score).toBe(0.5);
  });
});

describe("premiumGatesPassed", () => {
  it("fails if ego_compatibility is too low (all owners)", () => {
    expect(premiumGatesPassed("MILWAUKEE_NORTHSHORE", { ego_compatibility: -3, accountability: 999 })).toBe(false);
    expect(premiumGatesPassed("ATLANTA_APEX", { ego_compatibility: -3, media_sensitivity: 999 })).toBe(false);
  });

  it("Elaine requires accountability >= 10", () => {
    expect(premiumGatesPassed("MILWAUKEE_NORTHSHORE", { ego_compatibility: -2, accountability: 10 })).toBe(true);
    expect(premiumGatesPassed("MILWAUKEE_NORTHSHORE", { ego_compatibility: 0, accountability: 9 })).toBe(false);
  });

  it("Marcus requires media_sensitivity >= 6", () => {
    expect(premiumGatesPassed("ATLANTA_APEX", { ego_compatibility: -2, media_sensitivity: 6 })).toBe(true);
    expect(premiumGatesPassed("ATLANTA_APEX", { ego_compatibility: 0, media_sensitivity: 5 })).toBe(false);
  });

  it("others only require ego gate", () => {
    expect(premiumGatesPassed("BIRMINGHAM_VULCANS", { ego_compatibility: -2 })).toBe(true);
    expect(premiumGatesPassed("BIRMINGHAM_VULCANS", { ego_compatibility: -1 })).toBe(true);
  });
});
