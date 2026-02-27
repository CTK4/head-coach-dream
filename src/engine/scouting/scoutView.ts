import type { GameState } from "@/context/GameContext";

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

export function getScoutViewProspect(state: GameState, prospectId: string): ScoutViewProspect | null {
  const scouting = state.scoutingState;
  if (!scouting) return null;

  const profile = scouting.scoutProfiles[prospectId];
  if (!profile) return null;

  const draft = state.upcomingDraftClass.find((p) => String(p.prospectId) === prospectId);
  const combine = scouting.combine.resultsByProspectId?.[prospectId] ?? {};
  const interview = scouting.combine.interviewResultsByProspectId?.[prospectId] ?? {};

  return {
    id: prospectId,
    name: draft?.name ?? prospectId,
    pos: draft?.pos ?? "UNK",
    measurables: {
      forty: combine.forty,
      shuttle: combine.shuttle,
      vert: combine.vert,
      bench: combine.bench,
      ras: combine.ras,
    },
    estOverallRange: [Math.round(profile.estLow), Math.round(profile.estHigh)],
    confidence: Math.round(profile.confidence),
    knownTraits: profile.revealed?.leadershipTag ? [`Leadership: ${profile.revealed.leadershipTag}`] : [],
    medicalFlags: profile.revealed?.medicalTier ? [profile.revealed.medicalTier] : [],
    characterPct: interview.characterPct,
    intelligencePct: interview.intelligencePct,
  };
}
