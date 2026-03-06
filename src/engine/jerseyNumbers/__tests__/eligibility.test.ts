import { describe, expect, it } from "vitest";
import { isEligibleReceiverNumber } from "@/engine/jerseyNumbers/eligibility";

describe("isEligibleReceiverNumber", () => {
  it("matches simplified receiver eligibility bands", () => {
    expect(isEligibleReceiverNumber(50)).toBe(false);
    expect(isEligibleReceiverNumber(22)).toBe(true);
    expect(isEligibleReceiverNumber(84)).toBe(true);
  });
});
