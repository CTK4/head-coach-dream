import type { GameState } from "@/context/GameContext";
import type { ProspectScoutProfile } from "@/engine/scouting/types";
import { hasEnoughDrillDataForPercentile } from "@/engine/scouting/drillComposite";
import { normalizeDraftProspect, type NormalizedDraftProspect } from "@/engine/scouting/normalizeProspect";
import { getDeterministicRevealRange } from "@/engine/scouting/revealRange";

export type CanonicalCombineResult = {
  forty?: number | string;
  vert?: number | string;
  shuttle?: number | string;
  threeCone?: number | string;
  bench?: number | string;
  ras?: number;
};

export type CanonicalInterviewEntry = { score?: number };
export type CanonicalInterviewReveal = { characterRevealPct?: number; intelligenceRevealPct?: number };
export type CanonicalInterviewRevealRanges = { characterRange?: [number, number]; intelligenceRange?: [number, number] };

export type CanonicalCombineCoverage = {
  totalCanonicalProspects: number;
  prospectsWithAnyCombineMetrics: number;
  prospectsWithAthleticSummaryMetrics: number;
  prospectsWithPercentileMetrics: number;
};

export type CanonicalCombineStatusKind =
  | "NO_PROSPECTS"
  | "NOT_GENERATED"
  | "GENERATED_NO_USABLE_DATA"
  | "GENERATED_PARTIAL"
  | "GENERATED_FULL";

export type CanonicalCombineStatus = {
  kind: CanonicalCombineStatusKind;
  combineGenerated: boolean;
  coverage: CanonicalCombineCoverage;
  hasAnyAthleticSummaryCoverage: boolean;
  hasAnyPercentileCoverage: boolean;
  hasAnyMetricsCoverage: boolean;
  hasFullAthleticSummaryCoverage: boolean;
  hasFullPercentileCoverage: boolean;
};

// Canonical scouting invariant: combine metrics are stored as numbers or plain numeric strings only.
// Formatted values like `4.52s`, `35"`, or `22 reps` are treated as invalid canonical data.
export function parseCanonicalMetric(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

export function hasCanonicalCombineMetrics(result: CanonicalCombineResult): boolean {
  return [result.forty, result.vert, result.shuttle, result.bench].some((value) => parseCanonicalMetric(value) != null);
}

export function hasEnoughAthleticDataForSummary(result: CanonicalCombineResult): boolean {
  return [result.forty, result.vert, result.shuttle, result.bench].filter((value) => parseCanonicalMetric(value) != null).length >= 2;
}

export function getCanonicalDraftProspects(state: GameState): NormalizedDraftProspect[] {
  return (state.upcomingDraftClass ?? []).map((raw, index) => normalizeDraftProspect(raw as unknown as Record<string, unknown>, index));
}

export function getCanonicalProspectById(state: GameState, prospectId: string): NormalizedDraftProspect | null {
  const draftClass = state.upcomingDraftClass ?? [];
  for (let index = 0; index < draftClass.length; index += 1) {
    const normalized = normalizeDraftProspect(draftClass[index] as unknown as Record<string, unknown>, index);
    if (normalized.id === prospectId) return normalized;
  }
  return null;
}

export function getCanonicalCombineResult(state: GameState, prospectId: string): CanonicalCombineResult {
  return (
    state.scoutingState?.combine.resultsByProspectId?.[prospectId]
    ?? state.offseasonData.combine.resultsByProspectId?.[prospectId]
    ?? state.offseasonData.combine.results?.[prospectId]
    ?? {}
  ) as Partial<CanonicalCombineResult>;
}

export function getCanonicalCombineCoverage(state: GameState): CanonicalCombineCoverage {
  const prospects = getCanonicalDraftProspects(state);
  let prospectsWithAnyCombineMetrics = 0;
  let prospectsWithAthleticSummaryMetrics = 0;
  let prospectsWithPercentileMetrics = 0;

  for (const prospect of prospects) {
    const combine = getCanonicalCombineResult(state, prospect.id);
    const forty = parseCanonicalMetric(combine.forty);
    const vert = parseCanonicalMetric(combine.vert);
    const shuttle = parseCanonicalMetric(combine.shuttle);
    const bench = parseCanonicalMetric(combine.bench);

    if (hasCanonicalCombineMetrics(combine)) prospectsWithAnyCombineMetrics += 1;
    if (hasEnoughAthleticDataForSummary(combine)) prospectsWithAthleticSummaryMetrics += 1;
    if (hasEnoughDrillDataForPercentile({ forty, vert, shuttle, bench })) prospectsWithPercentileMetrics += 1;
  }

  return {
    totalCanonicalProspects: prospects.length,
    prospectsWithAnyCombineMetrics,
    prospectsWithAthleticSummaryMetrics,
    prospectsWithPercentileMetrics,
  };
}

export function getCanonicalMedicalResult(state: GameState, prospectId: string): Record<string, unknown> | null {
  return (state.scoutingState?.medical?.resultsByProspectId?.[prospectId] as unknown as Record<string, unknown>) ?? null;
}

export function getCanonicalInterviewResult(state: GameState, prospectId: string): CanonicalInterviewEntry[] | null {
  return state.scoutingState?.interviews?.resultsByProspectId?.[prospectId] ?? null;
}

export function getCanonicalInterviewReveal(state: GameState, prospectId: string): CanonicalInterviewReveal | null {
  return state.scoutingState?.interviews?.modelARevealByProspectId?.[prospectId] ?? null;
}

export function getCanonicalInterviewRevealRanges(state: GameState, prospectId: string): CanonicalInterviewRevealRanges | null {
  const reveal = getCanonicalInterviewReveal(state, prospectId);
  const trueAttributes = state.scoutingState?.trueProfiles?.[prospectId]?.trueAttributes;
  if (!reveal || !trueAttributes) return null;

  const characterRange = typeof trueAttributes.character === "number"
    ? getDeterministicRevealRange({ trueScore: trueAttributes.character, revealPct: reveal.characterRevealPct })
    : null;
  const intelligenceRange = typeof trueAttributes.intelligence === "number"
    ? getDeterministicRevealRange({ trueScore: trueAttributes.intelligence, revealPct: reveal.intelligenceRevealPct })
    : null;

  return {
    ...(characterRange ? { characterRange } : {}),
    ...(intelligenceRange ? { intelligenceRange } : {}),
  };
}

export function getCanonicalWorkoutResult(state: GameState, prospectId: string): unknown {
  return state.scoutingState?.workouts?.resultsByProspectId?.[prospectId] ?? null;
}

export function getCanonicalScoutProfile(state: GameState, prospectId: string): ProspectScoutProfile | null {
  return state.scoutingState?.scoutProfiles?.[prospectId] ?? null;
}

export function getCanonicalCombineStatus(state: GameState): CanonicalCombineStatus {
  const coverage = getCanonicalCombineCoverage(state);
  const total = coverage.totalCanonicalProspects;
  const combineGenerated = Boolean(state.scoutingState?.combine?.generated || state.offseasonData.combine.generated);
  const hasAnyAthleticSummaryCoverage = coverage.prospectsWithAthleticSummaryMetrics > 0;
  const hasAnyPercentileCoverage = coverage.prospectsWithPercentileMetrics > 0;
  const hasAnyMetricsCoverage = coverage.prospectsWithAnyCombineMetrics > 0;
  const hasFullAthleticSummaryCoverage = total > 0 && coverage.prospectsWithAthleticSummaryMetrics === total;
  const hasFullPercentileCoverage = total > 0 && coverage.prospectsWithPercentileMetrics === total;
  const hasUsable = hasAnyAthleticSummaryCoverage || hasAnyPercentileCoverage;

  const kind: CanonicalCombineStatusKind = total === 0
    ? "NO_PROSPECTS"
    : !combineGenerated
      ? "NOT_GENERATED"
      : !hasUsable
        ? "GENERATED_NO_USABLE_DATA"
        : hasFullAthleticSummaryCoverage && hasFullPercentileCoverage
          ? "GENERATED_FULL"
          : "GENERATED_PARTIAL";

  return {
    kind,
    combineGenerated,
    coverage,
    hasAnyAthleticSummaryCoverage,
    hasAnyPercentileCoverage,
    hasAnyMetricsCoverage,
    hasFullAthleticSummaryCoverage,
    hasFullPercentileCoverage,
  };
}
