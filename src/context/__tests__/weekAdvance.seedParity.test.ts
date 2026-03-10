import { describe, expect, it } from "vitest";
import { deriveWeeklySeed } from "@/engine/determinism/seedDerivation";

describe("deriveWeeklySeed", () => {
  it("matches the legacy weekly seed mixer", () => {
    const leagueSeed = 123456789;
    const season = 2027;
    const week = 14;
    const salt = 202;

    const expected = (leagueSeed ^ season ^ (week << 8) ^ (salt << 16)) >>> 0;
    expect(deriveWeeklySeed(leagueSeed, season, week, salt)).toBe(expected);
  });
});
