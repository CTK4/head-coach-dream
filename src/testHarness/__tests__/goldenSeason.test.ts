import { describe, expect, it } from "vitest";
import { runGoldenSeason } from "@/testHarness/goldenSeasonRunner";

describe("golden season determinism", () => {
  it("produces identical hash and summary for the same seed", () => {
    const a = runGoldenSeason({ careerSeed: 424242, userTeamId: "MILWAUKEE_NORTHSHORE" });
    const b = runGoldenSeason({ careerSeed: 424242, userTeamId: "MILWAUKEE_NORTHSHORE" });

    expect(a.determinismHash).toBe(b.determinismHash);
    expect(a.integrityHash).toBe(b.integrityHash);
    expect(a.summary).toEqual(b.summary);
    expect(a.visitedSteps.length).toBeGreaterThan(3);
    expect(a.summary.standingsCount).toBeGreaterThan(0);
    expect(a.summary.record.wins).toBeGreaterThanOrEqual(0);
    expect(a.summary.record.losses).toBeGreaterThanOrEqual(0);
  });

  it("changes hash for a different seed while preserving invariants", () => {
    const a = runGoldenSeason({ careerSeed: 424242, userTeamId: "MILWAUKEE_NORTHSHORE" });
    const b = runGoldenSeason({ careerSeed: 424243, userTeamId: "MILWAUKEE_NORTHSHORE" });

    expect(a.determinismHash).not.toBe(b.determinismHash);
    expect(a.summary.standingsCount).toBe(b.summary.standingsCount);
    expect(b.summary.record.wins).toBeGreaterThanOrEqual(0);
    expect(b.summary.record.losses).toBeGreaterThanOrEqual(0);
  });
});
