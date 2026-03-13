import { describe, expect, it } from "vitest";
import { getCanonicalRating } from "@/engine/ratings/ratingAdapter";

describe("getCanonicalRating", () => {
  it("reads canonical snake_case keys", () => {
    const player = { Football_IQ: 88, Man_Coverage: 81 };
    expect(getCanonicalRating(player, "Football_IQ")).toBe(88);
    expect(getCanonicalRating(player, "Man_Coverage")).toBe(81);
  });

  it("falls back to alias keys and then fallback value", () => {
    const player = { awareness: 77, cod: 81, tackling: 74 };
    expect(getCanonicalRating(player, "Awareness")).toBe(77);
    expect(getCanonicalRating(player, "Agility")).toBe(81);
    expect(getCanonicalRating(player, "Tackling")).toBe(74);
    expect(getCanonicalRating(player, "Route_Running", 66)).toBe(66);
  });

  it("does not treat agility as a Body_Control alias", () => {
    const player = { agility: 92 };
    expect(getCanonicalRating(player, "Agility", 50)).toBe(92);
    expect(getCanonicalRating(player, "Body_Control", 63)).toBe(63);
  });
});
