import { describe, expect, it } from "vitest";
import { loadConfigRegistry } from "@/engine/config/loadConfig";

describe("loadConfigRegistry sim tuning", () => {
  it("resolves tuned tunables from preset settings", () => {
    const loaded = loadConfigRegistry({ simTuning: { difficultyPreset: "ROOKIE", realismPreset: "ARCADE" } });
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(loaded.registry.calibrationPack.tunables.fatigueRecoveryRate).toBeCloseTo(1.134);
    expect(loaded.registry.calibrationPack.tunables.injuryDurationMultiplier).toBeCloseTo(0.92);
    expect(loaded.registry.calibrationPack.tunables.contractDemandMultiplier).toBeCloseTo(0.95);
  });
});
