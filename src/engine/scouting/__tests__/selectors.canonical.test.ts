import { describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { getCanonicalCombineCoverage, getCanonicalCombineStatus, getCanonicalInterviewRevealRanges } from "@/engine/scouting/selectors";

function buildState(): GameState {
  return {
    upcomingDraftClass: [
      { id: "P1", pos: "WR" },
      { id: "P2", pos: "WR" },
    ],
    scoutingState: {
      combine: { resultsByProspectId: {}, generated: false },
      interviews: { modelARevealByProspectId: {}, resultsByProspectId: {}, history: {}, interviewsRemaining: 0 },
      trueProfiles: {
        P1: { trueAttributes: { character: 70, intelligence: 72 } },
      },
    },
  } as unknown as GameState;
}

describe("canonical combine coverage", () => {
  it("does not count any-metric-only results as summary-ready", () => {
    const state = buildState();
    state.scoutingState!.combine.resultsByProspectId = {
      P1: { forty: "4.55" },
    };

    const coverage = getCanonicalCombineCoverage(state);
    expect(coverage.prospectsWithAnyCombineMetrics).toBe(1);
    expect(coverage.prospectsWithAthleticSummaryMetrics).toBe(0);
    expect(coverage.prospectsWithPercentileMetrics).toBe(0);
  });

  it("requires all four drills for percentile-ready coverage", () => {
    const state = buildState();
    state.scoutingState!.combine.resultsByProspectId = {
      P1: { forty: "4.55", vert: "35", shuttle: "4.1", bench: "22" },
    };

    const coverage = getCanonicalCombineCoverage(state);
    expect(coverage.prospectsWithPercentileMetrics).toBe(1);
  });
});

describe("canonical interview reveal ranges", () => {
  it("returns ranges when reveal percentages and hidden truth exist", () => {
    const state = buildState();
    state.scoutingState!.interviews.modelARevealByProspectId = {
      P1: { characterRevealPct: 60, intelligenceRevealPct: 60 },
    };

    const ranges = getCanonicalInterviewRevealRanges(state, "P1");
    expect(ranges?.characterRange).toBeTruthy();
    expect(ranges?.intelligenceRange).toBeTruthy();
  });

  it("returns null safely when hidden truth is missing", () => {
    const state = buildState();
    state.scoutingState!.interviews.modelARevealByProspectId = {
      P2: { characterRevealPct: 60, intelligenceRevealPct: 60 },
    };
    expect(getCanonicalInterviewRevealRanges(state, "P2")).toBeNull();
  });
});


describe("canonical combine status", () => {
  it("distinguishes generated partial coverage from full coverage", () => {
    const state = buildState();
    state.scoutingState!.combine.generated = true;
    state.scoutingState!.combine.resultsByProspectId = {
      P1: { forty: "4.55", vert: "35", shuttle: "4.1", bench: "22" },
      P2: { forty: "4.60" },
    };

    const status = getCanonicalCombineStatus(state);
    expect(status.kind).toBe("GENERATED_PARTIAL");
    expect(status.combineGenerated).toBe(true);
    expect(status.hasAnyAthleticSummaryCoverage).toBe(true);
    expect(status.hasFullAthleticSummaryCoverage).toBe(false);
    expect(status.hasAnyPercentileCoverage).toBe(true);
    expect(status.hasFullPercentileCoverage).toBe(false);
  });

  it("reports full coverage when all canonical prospects are summary and percentile ready", () => {
    const state = buildState();
    state.scoutingState!.combine.generated = true;
    state.scoutingState!.combine.resultsByProspectId = {
      P1: { forty: "4.55", vert: "35", shuttle: "4.1", bench: "22" },
      P2: { forty: "4.65", vert: "33", shuttle: "4.2", bench: "20" },
    };

    const status = getCanonicalCombineStatus(state);
    expect(status.kind).toBe("GENERATED_FULL");
    expect(status.hasFullAthleticSummaryCoverage).toBe(true);
    expect(status.hasFullPercentileCoverage).toBe(true);
  });

  it("reports generated state with no usable data separately", () => {
    const state = buildState();
    state.scoutingState!.combine.generated = true;
    state.scoutingState!.combine.resultsByProspectId = {
      P1: { forty: "4.6" },
    };
    const status = getCanonicalCombineStatus(state);
    expect(status.kind).toBe("GENERATED_NO_USABLE_DATA");
    expect(status.combineGenerated).toBe(true);
    expect(status.hasAnyMetricsCoverage).toBe(true);
    expect(status.hasAnyAthleticSummaryCoverage).toBe(false);
    expect(status.hasAnyPercentileCoverage).toBe(false);
  });

  it("handles no canonical prospects", () => {
    const state = buildState();
    (state as any).upcomingDraftClass = [];
    const status = getCanonicalCombineStatus(state);
    expect(status.kind).toBe("NO_PROSPECTS");
    expect(status.coverage.totalCanonicalProspects).toBe(0);
    expect(status.hasFullAthleticSummaryCoverage).toBe(false);
    expect(status.hasFullPercentileCoverage).toBe(false);
  });

  it("handles not generated status", () => {
    const state = buildState();
    state.scoutingState!.combine.generated = false;
    const status = getCanonicalCombineStatus(state);
    expect(status.kind).toBe("NOT_GENERATED");
  });
});
