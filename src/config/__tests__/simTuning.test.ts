import { describe, expect, it } from "vitest";
import { DEFAULT_SIM_TUNING, applyCalibrationTuning, resolveSimTuning } from "@/config/simTuning";

describe("sim tuning presets", () => {
  it("keeps defaults unchanged for the baseline presets", () => {
    const base = { fatigueRecoveryRate: 1, injuryDurationMultiplier: 1, contractDemandMultiplier: 1 };
    const tuned = applyCalibrationTuning(base, DEFAULT_SIM_TUNING);
    expect(tuned).toEqual(base);
  });

  it("applies preset multipliers deterministically", () => {
    const base = { fatigueRecoveryRate: 1, injuryDurationMultiplier: 1, contractDemandMultiplier: 1 };
    const tuned = applyCalibrationTuning(base, { difficultyPreset: "CHALLENGING", realismPreset: "SIM" });

    expect(tuned.fatigueRecoveryRate).toBeCloseTo(0.893);
    expect(tuned.injuryDurationMultiplier).toBeCloseTo(1.1);
    expect(tuned.contractDemandMultiplier).toBeCloseTo(1.06);
  });

  it("falls back to defaults when invalid values are provided", () => {
    const resolved = resolveSimTuning({ difficultyPreset: "NOPE" as any, realismPreset: "UNKNOWN" as any });
    expect(resolved).toEqual(DEFAULT_SIM_TUNING);
  });
});
