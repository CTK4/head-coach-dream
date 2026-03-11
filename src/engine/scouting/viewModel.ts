import type { GameState } from "@/context/GameContext";
import { getAthleticSummary } from "@/engine/scouting/athleticSummary";
import { getLegacyCombineProspectsView, getLegacyProspectById } from "@/engine/scouting/legacyBridge";
import { getCanonicalCombineResult, getCanonicalInterviewResult, getCanonicalMedicalResult, getCanonicalScoutProfile, getCanonicalWorkoutResult } from "@/engine/scouting/selectors";
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

function toText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const out = String(value).trim();
  return out.length ? out : undefined;
}

function buildProspectScoutingViewFromProspect(state: GameState, prospect: NormalizedDraftProspect): ProspectScoutingView {
  const combine = getCanonicalCombineResult(state, prospect.id);
  const profile = getCanonicalScoutProfile(state, prospect.id);
  const medical = getCanonicalMedicalResult(state, prospect.id) as { riskTier?: ProspectScoutingView["medicalRiskTier"] } | null;
  const interview = getCanonicalInterviewResult(state, prospect.id) as Array<{ score?: number }> | null;
  const workout = getCanonicalWorkoutResult(state, prospect.id);

  const athleticSummary = getAthleticSummary({
    forty: Number(combine.forty),
    vert: Number(combine.vert),
    shuttle: Number(combine.shuttle),
    threeCone: Number(combine.threeCone),
    bench: Number(combine.bench),
  });

  return {
    id: prospect.id,
    name: prospect.name,
    pos: prospect.pos,
    school: prospect.school,
    estLow: Math.round(profile?.estLow ?? 65),
    estHigh: Math.round(profile?.estHigh ?? 85),
    confidence: Math.round(profile?.confidence ?? 0),
    height: toText(prospect.height),
    weight: toText(prospect.weight),
    forty: toText(combine.forty),
    vert: toText(combine.vert),
    shuttle: toText(combine.shuttle),
    bench: toText(combine.bench),
    athleticLabel: athleticSummary.overallLabel,
    interviewScore: typeof interview?.slice(-1)?.[0]?.score === "number" ? interview.slice(-1)[0].score : undefined,
    medicalRiskTier: medical?.riskTier,
    workoutDone: Boolean(workout),
  };
}

export function buildProspectScoutingView(state: GameState, prospectId: string): ProspectScoutingView | null {
  const prospect = getLegacyProspectById(state, prospectId);
  if (!prospect) return null;
  return buildProspectScoutingViewFromProspect(state, prospect);
}

export function buildProspectScoutingViews(state: GameState): ProspectScoutingView[] {
  return getLegacyCombineProspectsView(state).map((p) => buildProspectScoutingViewFromProspect(state, p));
}
