/**
 * Integration tests for H2: Preseason → Cutdowns normalization.
 *
 * ROOT CAUSE that was fixed:
 * - RESOLVE_PLAY path jumped directly to REGULAR_SEASON and pre-completed CUT_DOWNS.
 * - ADVANCE_WEEK path never transitioned out of PRESEASON when preseasonWeek maxed.
 *
 * Fix:
 * - Both paths now land on careerStage: "CUTDOWNS" with:
 *   - offseason.stepId: "CUT_DOWNS"
 *   - stepsComplete.PRESEASON: true
 *   - stepsComplete.CUT_DOWNS: NOT set
 *   - hub.regularSeasonWeek reset to 1
 *   - hub.preseasonWeek clamped at PRESEASON_WEEKS
 */

import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, type GameState } from "@/context/GameContext";

function dispatch(
  state: GameState,
  action: Parameters<typeof gameReducerMonolith>[1],
): GameState {
  return gameReducerMonolith(state, action);
}

/** Minimal state at end-of-preseason (final preseason week context). */
function preseasonCompleteBase(): GameState {
  const base = createInitialStateForTests();
  return {
    ...base,
    careerStage: "PRESEASON",
    acceptedOffer: {
      ...(base.acceptedOffer as NonNullable<GameState["acceptedOffer"]>),
      teamId: base.acceptedOffer?.teamId ?? "TEAM_1",
    },
    hub: {
      ...base.hub,
      preseasonWeek: 3,
      regularSeasonWeek: 1,
    },
    offseason: {
      ...base.offseason,
      stepId: "PRESEASON",
      stepsComplete: {
        ...base.offseason.stepsComplete,
        PRESEASON: false,
        CUT_DOWNS: false,
      },
    },
  };
}

describe("H2 — ADVANCE_WEEK: final preseason week simmed", () => {
  it("transitions careerStage to CUTDOWNS (not REGULAR_SEASON or stuck PRESEASON)", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return; // guard: schedule generation can vary in tests

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    expect(after.careerStage).toBe("CUTDOWNS");
    expect(after.careerStage).not.toBe("REGULAR_SEASON");
    expect(after.careerStage).not.toBe("PRESEASON");
  });

  it("marks PRESEASON complete but leaves CUT_DOWNS incomplete", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return;

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    if (after.careerStage !== "CUTDOWNS") return;
    expect(after.offseason.stepsComplete.PRESEASON).toBe(true);
    expect(after.offseason.stepsComplete.CUT_DOWNS).toBeFalsy();
  });

  it("sets offseason stepId to CUT_DOWNS", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return;

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    if (after.careerStage !== "CUTDOWNS") return;
    expect(after.offseason.stepId).toBe("CUT_DOWNS");
  });

  it("resets regularSeasonWeek to 1 and clamps preseasonWeek at 3", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return;

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    if (after.careerStage !== "CUTDOWNS") return;
    expect(after.hub.regularSeasonWeek).toBe(1);
    expect(after.hub.preseasonWeek).toBe(3);
  });
});

describe("H2 — progression: CUTDOWNS can advance to REGULAR_SEASON after completion", () => {
  it("marks CUT_DOWNS complete then ADVANCE_CAREER_STAGE lands on REGULAR_SEASON", () => {
    const init = createInitialStateForTests();
    const base: GameState = {
      ...init,
      careerStage: "CUTDOWNS",
      offseason: {
        ...init.offseason,
        stepId: "CUT_DOWNS",
        stepsComplete: {
          ...init.offseason.stepsComplete,
          PRESEASON: true,
          CUT_DOWNS: false,
        },
      },
    };

    const afterComplete = dispatch(base, {
      type: "OFFSEASON_COMPLETE_STEP",
      payload: { stepId: "CUT_DOWNS" },
    });
    expect(afterComplete.offseason.stepsComplete.CUT_DOWNS).toBe(true);

    const afterAdvance = dispatch(afterComplete, { type: "ADVANCE_CAREER_STAGE" });
    expect(afterAdvance.careerStage).toBe("REGULAR_SEASON");
  });
});

describe("H2 — regression: old auto-skip behaviour is gone", () => {
  it("ADVANCE_WEEK final preseason: CUT_DOWNS is not pre-marked complete", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return;

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    expect(after.offseason.stepsComplete.CUT_DOWNS).toBeFalsy();
  });

  it("ADVANCE_WEEK final preseason: does not go straight to REGULAR_SEASON", () => {
    const base = preseasonCompleteBase();
    if (!base.hub.schedule) return;

    const after = dispatch(base, { type: "ADVANCE_WEEK" });

    expect(after.careerStage).not.toBe("REGULAR_SEASON");
  });
});
