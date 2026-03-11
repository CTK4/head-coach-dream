import { describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { buildProspectForGmEval } from "@/engine/scouting/gmEvalAdapter";

function baseState(): GameState {
  return {
    upcomingDraftClass: [{ id: "P1", name: "Prospect", pos: "QB", grade: 78 }],
    scoutingState: {
      combine: { resultsByProspectId: {}, generated: false },
      interviews: { resultsByProspectId: {}, history: {}, modelARevealByProspectId: {}, interviewsRemaining: 0 },
    },
  } as unknown as GameState;
}

describe("buildProspectForGmEval", () => {
  it("returns partial eval when combine exists but interview is missing", () => {
    const state = baseState();
    state.scoutingState!.combine.resultsByProspectId = { P1: { forty: 4.55, vert: 35, shuttle: 4.2, bench: 20 } };
    const out = buildProspectForGmEval(state, "P1");
    expect(out?.completeness).toBe("PARTIAL");
    expect(out?.prospect.ras).not.toBe(50);
    expect(out?.prospect.interview).toBe(50);
    expect(out?.bandPenalty).toBeGreaterThan(0);
    expect(out?.confidencePenalty).toBeGreaterThan(0);
  });

  it("returns partial eval when interview exists but combine is missing", () => {
    const state = baseState();
    state.scoutingState!.interviews.resultsByProspectId = { P1: [{ score: 72 }] };
    const out = buildProspectForGmEval(state, "P1");
    expect(out?.completeness).toBe("PARTIAL");
    expect(out?.prospect.ras).toBe(50);
    expect(out?.prospect.interview).toBe(72);
    expect(out?.bandPenalty).toBe(2);
  });

  it("uses incomplete combine drills as partial athletic signal", () => {
    const state = baseState();
    state.scoutingState!.combine.resultsByProspectId = { P1: { forty: 4.58, vert: 34 } };
    const out = buildProspectForGmEval(state, "P1");
    expect(out?.completeness).toBe("PARTIAL");
    expect(out?.prospect.ras).not.toBe(50);
  });

  it("returns full eval when both combine and interview exist", () => {
    const state = baseState();
    state.scoutingState!.combine.resultsByProspectId = { P1: { forty: 4.55, vert: 35, shuttle: 4.2, bench: 20 } };
    state.scoutingState!.interviews.resultsByProspectId = { P1: [{ score: 72 }] };
    const out = buildProspectForGmEval(state, "P1");
    expect(out?.completeness).toBe("FULL");
    expect(out?.bandPenalty).toBe(0);
    expect(out?.confidencePenalty).toBe(0);
  });

  it("returns null when neither combine nor interview is available", () => {
    const out = buildProspectForGmEval(baseState(), "P1");
    expect(out).toBeNull();
  });
});
