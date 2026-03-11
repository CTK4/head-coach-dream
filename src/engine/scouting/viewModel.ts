import type { GameState } from "@/context/GameContext";
import { getAthleticSummary } from "@/engine/scouting/athleticSummary";
import { getCanonicalCombineResult, getCanonicalDraftProspects, getCanonicalInterviewResult, getCanonicalMedicalResult, getCanonicalProspectById, getCanonicalScoutProfile, getCanonicalWorkoutResult, hasEnoughAthleticDataForSummary, parseCanonicalMetric } from "@/engine/scouting/selectors";
import type { NormalizedDraftProspect } from "@/engine/scouting/normalizeProspect";

export type ProspectScoutingView = {
  id: string;
  name: string;
  pos: string;
  school: string;
  estLow: number;
  estHigh: number;
  confidence: number;
  height?: string;
  weight?: string;
  forty?: string;
  vert?: string;
  shuttle?: string;
  bench?: string;
  athleticLabel?: "EXPLOSIVE" | "FLUID" | "POWER" | "BALANCED" | "LIMITED";
  interviewScore?: number;
  medicalRiskTier?: "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";
  workoutDone?: boolean;
};

export type ProspectScoutingViewSet = {
  views: ProspectScoutingView[];
  totalCanonicalProspects: number;
  missingScoutProfileCount: number;
  missingScoutProfileIds: string[];
};

function toText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const out = String(value).trim();
  return out.length ? out : undefined;
}

function buildProspectScoutingViewFromProspect(state: GameState, prospect: NormalizedDraftProspect): ProspectScoutingView | null {
  const combine = getCanonicalCombineResult(state, prospect.id);
  const profile = getCanonicalScoutProfile(state, prospect.id);
  if (!profile) return null;

  const medical = getCanonicalMedicalResult(state, prospect.id) as { riskTier?: ProspectScoutingView["medicalRiskTier"] } | null;
  const interview = getCanonicalInterviewResult(state, prospect.id);
  const workout = getCanonicalWorkoutResult(state, prospect.id);

  const athleticSummary = hasEnoughAthleticDataForSummary(combine)
    ? getAthleticSummary({
        forty: parseCanonicalMetric(combine.forty) ?? undefined,
        vert: parseCanonicalMetric(combine.vert) ?? undefined,
        shuttle: parseCanonicalMetric(combine.shuttle) ?? undefined,
        threeCone: parseCanonicalMetric(combine.threeCone) ?? undefined,
        bench: parseCanonicalMetric(combine.bench) ?? undefined,
      })
    : null;

  return {
    id: prospect.id,
    name: prospect.name,
    pos: prospect.pos,
    school: prospect.school,
    estLow: Math.round(profile.estLow),
    estHigh: Math.round(profile.estHigh),
    confidence: Math.round(profile.confidence),
    height: toText(prospect.height),
    weight: toText(prospect.weight),
    forty: toText(combine.forty),
    vert: toText(combine.vert),
    shuttle: toText(combine.shuttle),
    bench: toText(combine.bench),
    athleticLabel: athleticSummary?.overallLabel,
    interviewScore: typeof interview?.slice(-1)?.[0]?.score === "number" ? interview.slice(-1)[0].score : undefined,
    medicalRiskTier: medical?.riskTier,
    workoutDone: Boolean(workout),
  };
}

export function buildProspectScoutingView(state: GameState, prospectId: string): ProspectScoutingView | null {
  const prospect = getCanonicalProspectById(state, prospectId);
  if (!prospect) return null;
  return buildProspectScoutingViewFromProspect(state, prospect);
}

export function buildProspectScoutingViewSet(state: GameState): ProspectScoutingViewSet {
  const prospects = getCanonicalDraftProspects(state);
  const views: ProspectScoutingView[] = [];
  const missingScoutProfileIds: string[] = [];

  for (const prospect of prospects) {
    const view = buildProspectScoutingViewFromProspect(state, prospect);
    if (view) {
      views.push(view);
    } else {
      missingScoutProfileIds.push(prospect.id);
    }
  }

  return {
    views,
    totalCanonicalProspects: prospects.length,
    missingScoutProfileCount: missingScoutProfileIds.length,
    missingScoutProfileIds,
  };
}

export function buildProspectScoutingViews(state: GameState): ProspectScoutingView[] {
  return buildProspectScoutingViewSet(state).views;
}
