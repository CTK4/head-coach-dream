import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolveFieldGoal, resolvePunt } from "@/engine/physics/kickResolver";

describe("kickResolver", () => {
  it("is deterministic", () => {
    const fg = resolveFieldGoal({ power: 80, accuracy: 80, spin: 74 }, { distanceYds: 47, windTier: "MED", precipTier: "NONE", surface: "DRY" }, rng(10, "fg"));
    expect(fg).toEqual(resolveFieldGoal({ power: 80, accuracy: 80, spin: 74 }, { distanceYds: 47, windTier: "MED", precipTier: "NONE", surface: "DRY" }, rng(10, "fg")));
    const punt = resolvePunt({ power: 80, accuracy: 74, hang: 76, spin: 73 }, { distanceYds: 68, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(11, "punt"));
    expect(punt).toEqual(resolvePunt({ power: 80, accuracy: 74, hang: 76, spin: 73 }, { distanceYds: 68, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(11, "punt")));
  });

  it("power and accuracy are monotonic in expected outcomes", () => {
    let lowPower = 0;
    let highPower = 0;
    let lowAccMakes = 0;
    let highAccMakes = 0;
    for (let i = 0; i < 500; i += 1) {
      lowPower += resolvePunt({ power: 65, accuracy: 75, hang: 75, spin: 74 }, { distanceYds: 70, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(2000 + i, "p")).grossYds;
      highPower += resolvePunt({ power: 92, accuracy: 75, hang: 75, spin: 74 }, { distanceYds: 70, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(2000 + i, "p")).grossYds;
      if (resolveFieldGoal({ power: 80, accuracy: 64, spin: 72 }, { distanceYds: 46, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(9000 + i, "a")).made) lowAccMakes += 1;
      if (resolveFieldGoal({ power: 80, accuracy: 92, spin: 72 }, { distanceYds: 46, windTier: "LOW", precipTier: "NONE", surface: "DRY" }, rng(9000 + i, "a")).made) highAccMakes += 1;
    }
    expect(highPower / 500).toBeGreaterThan(lowPower / 500);
    expect(highAccMakes).toBeGreaterThan(lowAccMakes);
  });
});
