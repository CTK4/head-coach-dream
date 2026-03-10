import { describe, expect, it } from "vitest";
import { allowedRangesByGroup, ELIGIBLE_RECEIVER_RANGES, preferredOrderByGroup } from "@/engine/jerseyNumbers/rules";
import { validateEligibilityRanges, validatePreferredOrder } from "@/engine/jerseyNumbers/validateRules";

describe("jersey number rule validation", () => {
  it("validates all configured groups", () => {
    for (const group of Object.keys(allowedRangesByGroup) as Array<keyof typeof allowedRangesByGroup>) {
      expect(() => validatePreferredOrder(group, preferredOrderByGroup[group], allowedRangesByGroup[group])).not.toThrow();
    }
    expect(() => validateEligibilityRanges(ELIGIBLE_RECEIVER_RANGES)).not.toThrow();
  });

  it("throws on a broken preferred order", () => {
    expect(() => validatePreferredOrder("QB", [10, 12, 11], [[1, 19]])).toThrow(/missing numbers/i);
  });
});
