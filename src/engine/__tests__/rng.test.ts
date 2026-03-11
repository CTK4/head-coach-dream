import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/engine/rng";

describe("mulberry32 determinism", () => {
  it("returns the same sequence for seed 12345 across 1000 calls", () => {
    const expected = mulberry32(12345);
    const actual = mulberry32(12345);

    for (let i = 0; i < 1000; i += 1) {
      expect(actual()).toBe(expected());
    }
  });
});
