import { describe, expect, it } from "vitest";
import { deriveCareerSeed, deriveScoutingBoardSeed } from "@/engine/determinism/seedDerivation";

describe("seed derivation parity", () => {
  it("deriveCareerSeed matches legacy XOR formula", () => {
    const saveSeed = 987654321;
    expect(deriveCareerSeed(saveSeed)).toBe((saveSeed ^ 0x85ebca6b) >>> 0);
  });

  it("deriveScoutingBoardSeed matches legacy XOR formula", () => {
    const saveSeed = 123456789;
    expect(deriveScoutingBoardSeed(saveSeed)).toBe((saveSeed ^ 0x9e3779b9) >>> 0);
  });
});
