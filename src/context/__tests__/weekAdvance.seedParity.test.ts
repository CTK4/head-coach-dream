import { describe, expect, it } from "vitest";
import { seedForWeeklyFinalization } from "@/context/controllers/weekAdvance";

describe("seedForWeeklyFinalization", () => {
  it("matches the legacy GameContext seed mixer", () => {
    const leagueSeed = 123456789;
    const season = 2027;
    const week = 14;
    const salt = 202;

    const expected = (leagueSeed ^ season ^ (week << 8) ^ (salt << 16)) >>> 0;
    expect(seedForWeeklyFinalization(leagueSeed, season, week, salt)).toBe(expected);
  });
});
