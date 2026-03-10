import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolvePassRush, type PassRushInput } from "@/engine/physics/passRushResolver";

const baseInput: PassRushInput = {
  rusher: { speed: 82, accel: 80, strength: 76, technique: 79, bend: 78, fatigue01: 0.2 },
  blocker: { passPro: 75, footwork: 74, anchor: 77, fatigue01: 0.2 },
  context: { rushAngleDeg: 34, depthYds: 8, chipHelp: false, quickGame: false },
};

describe("resolvePassRush", () => {
  it("is deterministic", () => {
    expect(resolvePassRush(baseInput, rng(1001, "rush"))).toEqual(resolvePassRush(baseInput, rng(1001, "rush")));
  });

  it("higher bend increases pressure rate", () => {
    let low = 0;
    let high = 0;
    for (let i = 0; i < 500; i += 1) {
      if (resolvePassRush({ ...baseInput, rusher: { ...baseInput.rusher, bend: 62 } }, rng(4000 + i, "b")).pressured) low += 1;
      if (resolvePassRush({ ...baseInput, rusher: { ...baseInput.rusher, bend: 92 } }, rng(4000 + i, "b")).pressured) high += 1;
    }
    expect(high).toBeGreaterThan(low);
  });
});
