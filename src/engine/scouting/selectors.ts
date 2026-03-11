import type { GameState } from "@/context/GameContext";
import type { ProspectScoutProfile } from "@/engine/scouting/types";
import { normalizeDraftProspect, type NormalizedDraftProspect } from "@/engine/scouting/normalizeProspect";

export type CanonicalCombineResult = {
  forty?: number | string;
  vert?: number | string;
  shuttle?: number | string;
  threeCone?: number | string;
  bench?: number | string;
  ras?: number;
};

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
  const scoutingCombine = (state.scoutingState?.combine.resultsByProspectId?.[prospectId] ?? {}) as Partial<CanonicalCombineResult>;
  const offseasonCombine = (state.offseasonData.combine.results?.[prospectId] ?? {}) as Partial<CanonicalCombineResult>;
  const prospect = getCanonicalProspectById(state, prospectId);

  return {
    forty: scoutingCombine.forty ?? offseasonCombine.forty ?? prospect?.forty,
    vert: scoutingCombine.vert ?? offseasonCombine.vert ?? prospect?.vert,
    shuttle: scoutingCombine.shuttle ?? offseasonCombine.shuttle ?? prospect?.shuttle,
    threeCone: scoutingCombine.threeCone ?? offseasonCombine.threeCone ?? prospect?.threeCone,
    bench: scoutingCombine.bench ?? offseasonCombine.bench ?? prospect?.bench,
    ras: scoutingCombine.ras ?? offseasonCombine.ras,
  };
}

export function getCanonicalMedicalResult(state: GameState, prospectId: string): Record<string, unknown> | null {
  return (state.scoutingState?.medical?.resultsByProspectId?.[prospectId] as unknown as Record<string, unknown>) ?? null;
}

export function getCanonicalInterviewResult(state: GameState, prospectId: string): unknown {
  return state.scoutingState?.interviews?.resultsByProspectId?.[prospectId] ?? null;
}

export function getCanonicalWorkoutResult(state: GameState, prospectId: string): unknown {
  return state.scoutingState?.workouts?.resultsByProspectId?.[prospectId] ?? null;
}

export function getCanonicalScoutProfile(state: GameState, prospectId: string): ProspectScoutProfile | null {
  return state.scoutingState?.scoutProfiles?.[prospectId] ?? null;
}
