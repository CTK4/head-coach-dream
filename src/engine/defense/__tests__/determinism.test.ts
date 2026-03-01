import { describe, expect, it } from "vitest";
import { hashSeed, rng } from "@/engine/rng";
import { aiSelectDefensiveCall } from "@/engine/defense/aiSelectDefensiveCall";

describe("defensive call determinism", () => {
  it("same seed and input returns identical call hash", () => {
    const seed = hashSeed(12345, "save-1", "game-2", 3, 8, "HOME", "AWAY");
    const callA = aiSelectDefensiveCall({
      rng: rng(seed, "def-call"),
      defenseScheme: { baseShell: "COVER_3", blitzRate: 55, manRate: 40, front: "MULTIPLE" },
      situation: { down: 3, distance: 9, yardLine: 42, quarter: 4, clockSec: 112 },
    });
    const callB = aiSelectDefensiveCall({
      rng: rng(seed, "def-call"),
      defenseScheme: { baseShell: "COVER_3", blitzRate: 55, manRate: 40, front: "MULTIPLE" },
      situation: { down: 3, distance: 9, yardLine: 42, quarter: 4, clockSec: 112 },
    });
    expect(JSON.stringify(callA)).toEqual(JSON.stringify(callB));
  });
});
