import { describe, expect, it } from "vitest";
import { topPercentDisplay, topPercentileFromAscendingRank } from "@/engine/scouting/percentiles";

describe("topPercentileFromAscendingRank", () => {
  it("returns 100 for a single prospect", () => {
    expect(topPercentileFromAscendingRank(0, 1)).toBe(100);
  });

  it("returns 100 for best rank and 0 for worst rank", () => {
    expect(topPercentileFromAscendingRank(0, 5)).toBe(100);
    expect(topPercentileFromAscendingRank(4, 5)).toBe(0);
  });

  it("is monotonic across middle ranks", () => {
    const values = [0, 1, 2, 3, 4].map((rank) => topPercentileFromAscendingRank(rank, 5));
    expect(values).toEqual([100, 75, 50, 25, 0]);
  });
});


describe("topPercentDisplay", () => {
  it("renders truthful percentile labels", () => {
    expect(topPercentDisplay(100)).toBe("100th percentile");
    expect(topPercentDisplay(88)).toBe("88th percentile");
    expect(topPercentDisplay(0)).toBe("0th percentile");
  });

  it("handles ordinal suffix edge cases", () => {
    expect(topPercentDisplay(1)).toBe("1st percentile");
    expect(topPercentDisplay(2)).toBe("2nd percentile");
    expect(topPercentDisplay(3)).toBe("3rd percentile");
    expect(topPercentDisplay(4)).toBe("4th percentile");
    expect(topPercentDisplay(11)).toBe("11th percentile");
    expect(topPercentDisplay(12)).toBe("12th percentile");
    expect(topPercentDisplay(13)).toBe("13th percentile");
    expect(topPercentDisplay(21)).toBe("21st percentile");
    expect(topPercentDisplay(22)).toBe("22nd percentile");
    expect(topPercentDisplay(23)).toBe("23rd percentile");
  });

  it("clamps out-of-range values", () => {
    expect(topPercentDisplay(-5)).toBe("0th percentile");
    expect(topPercentDisplay(120)).toBe("100th percentile");
  });
});


describe("topPercentile ranking flow", () => {
  it("assigns highest percentile to highest drill score in descending score ranking", () => {
    const scores = [80, 50, 30];
    const ranked = scores.slice().sort((a, b) => b - a);
    const topPercentiles = ranked.map((_, rank) => topPercentileFromAscendingRank(rank, ranked.length));
    expect(topPercentiles[0]).toBe(100);
    expect(topPercentiles[topPercentiles.length - 1]).toBe(0);
  });
});
