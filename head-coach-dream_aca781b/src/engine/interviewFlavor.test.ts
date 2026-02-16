import { describe, expect, it } from "vitest";
import { getFlavorLine } from "@/engine/interviewFlavor";

describe("getFlavorLine", () => {
  it("uses urgency phrasing for impatient timeline owners", () => {
    const line = getFlavorLine({
      ownerTags: ["impatient", "short-term results driven"],
      theme: "TIMELINE",
      phase: "DURING",
    });

    expect(line.toLowerCase()).toContain("immediate");
  });

  it("returns different sentiment across premium and reject tiers", () => {
    const premium = getFlavorLine({
      ownerTags: ["disciplined"],
      theme: "END",
      phase: "END",
      tier: "PREMIUM",
    });
    const reject = getFlavorLine({
      ownerTags: ["disciplined"],
      theme: "END",
      phase: "END",
      tier: "REJECT",
    });

    expect(premium).not.toEqual(reject);
    expect(premium.toLowerCase()).toContain("sold");
    expect(reject.toLowerCase()).toContain("other candidates");
  });

  it("does not include digits or scoring vocabulary", () => {
    const disallowedSubstrings = ["score", "threshold", "0."];
    const lines = [
      getFlavorLine({ ownerTags: ["impatient"], theme: "TIMELINE", phase: "DURING" }),
      getFlavorLine({ ownerTags: ["impatient"], theme: "END", phase: "END", tier: "STANDARD" }),
    ];

    for (const line of lines) {
      expect(line).not.toMatch(/\d/);
      for (const disallowed of disallowedSubstrings) {
        expect(line.toLowerCase()).not.toContain(disallowed);
      }
    }
  });
});

