import { describe, expect, it } from "vitest";
import { computeRecurrenceMultiplier, getRecurrenceRiskLevel, SOFT_TISSUE_TYPES } from "@/engine/injuryTypes";
import type { Injury } from "@/engine/injuryTypes";

function mkInjury(overrides: Partial<Injury>): Injury {
  return {
    id: "INJ_1",
    playerId: "P1",
    teamId: "T1",
    injuryType: "Hamstring",
    bodyArea: "UPPER_LEG",
    severity: "MINOR",
    status: "DAY_TO_DAY",
    startWeek: 5,
    isSeasonEnding: false,
    occurredWeek: 5,
    recurrenceWindow: 8,
    recurrenceMultiplier: 1.3,
    ...overrides,
  };
}

describe("injuryTypes recurrence", () => {
  it("returns 1.0 multiplier with no prior injuries", () => {
    const mult = computeRecurrenceMultiplier("P1", "Hamstring", 10, []);
    expect(mult).toBe(1.0);
  });

  it("applies recurrence multiplier for same injury type within window", () => {
    const prior = mkInjury({ playerId: "P1", occurredWeek: 6, recurrenceWindow: 8 });
    const mult = computeRecurrenceMultiplier("P1", "Hamstring", 10, [prior]);
    expect(mult).toBeGreaterThan(1.0);
  });

  it("does not apply multiplier for injury outside recurrence window", () => {
    const prior = mkInjury({ playerId: "P1", occurredWeek: 1, recurrenceWindow: 4 });
    const mult = computeRecurrenceMultiplier("P1", "Hamstring", 10, [prior]);
    // currentWeek - occurredWeek = 9 > recurrenceWindow 4
    expect(mult).toBe(1.0);
  });

  it("applies chronic soft tissue boost with 2+ prior injuries", () => {
    const prior1 = mkInjury({ id: "I1", playerId: "P1", injuryType: "Hamstring", occurredWeek: 1, recurrenceWindow: 2 });
    const prior2 = mkInjury({ id: "I2", playerId: "P1", injuryType: "Back", occurredWeek: 3, recurrenceWindow: 2 });
    const mult = computeRecurrenceMultiplier("P1", "Calf", 10, [prior1, prior2]);
    expect(mult).toBeGreaterThan(1.0);
  });

  it("getRecurrenceRiskLevel returns correct labels", () => {
    expect(getRecurrenceRiskLevel(1.6)).toBe("High");
    expect(getRecurrenceRiskLevel(1.3)).toBe("Medium");
    expect(getRecurrenceRiskLevel(1.1)).toBe("Low");
  });

  it("SOFT_TISSUE_TYPES includes Hamstring", () => {
    expect(SOFT_TISSUE_TYPES.has("Hamstring")).toBe(true);
  });
});
