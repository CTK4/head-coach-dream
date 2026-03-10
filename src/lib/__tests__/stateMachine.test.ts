import { describe, expect, it } from "vitest";
import { OffseasonStepEnum, PhaseKeyEnum, StateMachine } from "@/lib/stateMachine";

describe("StateMachine.getPhaseKey", () => {
  it("maps known retention/combine/free agency/draft/regular values", () => {
    expect(StateMachine.getPhaseKey({ phase: "resign" })).toBe(PhaseKeyEnum.PHASE_2_RETENTION);
    expect(StateMachine.getPhaseKey({ careerStage: "combine" })).toBe(PhaseKeyEnum.PHASE_3_COMBINE);
    expect(StateMachine.getPhaseKey({ seasonPhase: "free_agency" })).toBe(PhaseKeyEnum.PHASE_4_FREE_AGENCY);
    expect(StateMachine.getPhaseKey({ hubPhase: "draft" })).toBe(PhaseKeyEnum.DRAFT);
    expect(StateMachine.getPhaseKey({ phase: "regular_season_week_4" })).toBe(PhaseKeyEnum.REGULAR_SEASON_WEEK);
  });

  it("returns UNKNOWN when no phase marker can be derived", () => {
    expect(StateMachine.getPhaseKey({ phase: "offseason_hub" })).toBe(PhaseKeyEnum.UNKNOWN);
    expect(StateMachine.getPhaseKey({})).toBe(PhaseKeyEnum.UNKNOWN);
  });
});

describe("StateMachine offseason transitions", () => {
  it("skips tampering when disabled", () => {
    expect(StateMachine.nextOffseasonStepId(OffseasonStepEnum.COMBINE, { enableTamperingStep: false })).toBe(OffseasonStepEnum.FREE_AGENCY);
    expect(StateMachine.nextOffseasonStepId(OffseasonStepEnum.TAMPERING, { enableTamperingStep: false })).toBe(OffseasonStepEnum.FREE_AGENCY);
  });

  it("includes tampering when enabled", () => {
    expect(StateMachine.nextOffseasonStepId(OffseasonStepEnum.COMBINE, { enableTamperingStep: true })).toBe(OffseasonStepEnum.TAMPERING);
    expect(StateMachine.nextOffseasonStepId(OffseasonStepEnum.TAMPERING, { enableTamperingStep: true })).toBe(OffseasonStepEnum.FREE_AGENCY);
  });

  it("advances through valid transitions and throws on terminal advance", () => {
    expect(StateMachine.advanceOffseasonStep(OffseasonStepEnum.PRE_DRAFT, { enableTamperingStep: false })).toBe(OffseasonStepEnum.DRAFT);
    expect(() => StateMachine.advanceOffseasonStep(OffseasonStepEnum.CUT_DOWNS, { enableTamperingStep: false })).toThrow(
      "Cannot advance offseason step from 'CUT_DOWNS' because it is terminal.",
    );
  });

  it("throws descriptive errors on invalid transitions", () => {
    expect(() =>
      StateMachine.assertValidOffseasonTransition(OffseasonStepEnum.RESIGNING, OffseasonStepEnum.PRE_DRAFT, {
        enableTamperingStep: false,
      }),
    ).toThrow("Invalid offseason transition from 'RESIGNING' to 'PRE_DRAFT'. Expected 'COMBINE'.");

    expect(() =>
      StateMachine.assertValidOffseasonTransition(OffseasonStepEnum.CUT_DOWNS, OffseasonStepEnum.RESIGNING, {
        enableTamperingStep: false,
      }),
    ).toThrow("No valid offseason transition exists after 'CUT_DOWNS'.");
  });

  it("maps offseason step to career stage", () => {
    expect(StateMachine.careerStageForOffseasonStep(OffseasonStepEnum.FREE_AGENCY, "OFFSEASON_HUB")).toBe("FREE_AGENCY");
    expect(StateMachine.careerStageForOffseasonStep(OffseasonStepEnum.TRAINING_CAMP, "OFFSEASON_HUB")).toBe("TRAINING_CAMP");
    expect(StateMachine.careerStageForOffseasonStep(OffseasonStepEnum.PRESEASON, "OFFSEASON_HUB")).toBe("PRESEASON");
    expect(StateMachine.careerStageForOffseasonStep(OffseasonStepEnum.CUT_DOWNS, "PRESEASON")).toBe("OFFSEASON_HUB");
    expect(StateMachine.careerStageForOffseasonStep(OffseasonStepEnum.RESIGNING, "RESIGN")).toBe("RESIGN");
  });
});
