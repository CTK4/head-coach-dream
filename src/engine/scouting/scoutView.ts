import type { GameState } from "@/context/GameContext";
import { SCOUTING_FEATURES } from "@/engine/scouting/config";
import { getCanonicalCombineResult, getCanonicalProspectById } from "@/engine/scouting/selectors";

export type ScoutViewProspect = {
  id: string;
  name: string;
  pos: string;
  measurables: { forty?: number; shuttle?: number; vert?: number; bench?: number; ras?: number };
  estOverallRange: [number, number];
  confidence: number;
  knownTraits: string[];
  medicalFlags: string[];
  characterPct?: number;
  intelligencePct?: number;
};

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getScoutViewProspect(state: GameState, prospectId: string): ScoutViewProspect | null {
  const scouting = state.scoutingState;
  if (!scouting) return null;

  const profile = scouting.scoutProfiles[prospectId];
  if (!profile) return null;

  const draft = getCanonicalProspectById(state, prospectId);
  const combine = getCanonicalCombineResult(state, prospectId);
  const interview = scouting.combine.interviewResultsByProspectId?.[prospectId] ?? {};

  return {
    id: prospectId,
    name: draft?.name ?? prospectId,
    pos: draft?.pos ?? "UNK",
    measurables: {
      forty: asNumber(combine.forty),
      shuttle: asNumber(combine.shuttle),
      vert: asNumber(combine.vert),
      bench: asNumber(combine.bench),
      ...(SCOUTING_FEATURES.showRAS ? { ras: asNumber(combine.ras) } : {}),
    },
    estOverallRange: [Math.round(profile.estLow), Math.round(profile.estHigh)],
    confidence: Math.round(profile.confidence),
    knownTraits: profile.revealed?.leadershipTag ? [`Leadership: ${profile.revealed.leadershipTag}`] : [],
    medicalFlags: profile.revealed?.medicalTier ? [profile.revealed.medicalTier] : [],
    characterPct: interview.characterPct,
    intelligencePct: interview.intelligencePct,
  };
}
