import { describe, expect, it } from "vitest";
import { isKeyDefenseSituation } from "@/engine/defense/isKeyDefenseSituation";

describe("isKeyDefenseSituation", () => {
  it("flags 3rd down", () => {
    expect(isKeyDefenseSituation({ down: 3, distance: 7, yardLine: 45, quarter: 2, clockSec: 500 })).toBe(true);
  });

  it("flags red zone", () => {
    expect(isKeyDefenseSituation({ down: 1, distance: 10, yardLine: 20, quarter: 1, clockSec: 700 })).toBe(true);
  });

  it("flags final 2 minutes in Q4", () => {
    expect(isKeyDefenseSituation({ down: 1, distance: 10, yardLine: 60, quarter: 4, clockSec: 120 })).toBe(true);
  });

  it("flags goal line", () => {
    expect(isKeyDefenseSituation({ down: 2, distance: 2, yardLine: 4, quarter: 3, clockSec: 400 })).toBe(true);
  });

  it("does not flag non-key", () => {
    expect(isKeyDefenseSituation({ down: 2, distance: 6, yardLine: 55, quarter: 2, clockSec: 420 })).toBe(false);
  });
});
