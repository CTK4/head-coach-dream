import type { GameState } from "@/context/GameContext";
import { normalizeDraftProspect, type NormalizedDraftProspect } from "@/engine/scouting/normalizeProspect";
import { getCanonicalDraftProspects } from "@/engine/scouting/selectors";
import { SCOUTING_FEATURES } from "@/engine/scouting/config";

function normalizeList(rows: unknown[]): NormalizedDraftProspect[] {
  return rows.map((row, index) => normalizeDraftProspect((row ?? {}) as Record<string, unknown>, index));
}

export function getLegacyCombineProspectsView(state: GameState): NormalizedDraftProspect[] {
  const canonical = SCOUTING_FEATURES.useCanonicalScoutingState ? getCanonicalDraftProspects(state) : [];
  if (canonical.length) return canonical;

  const combineProspects = state.offseasonData.combine.prospects as unknown[];
  if (combineProspects.length) return normalizeList(combineProspects);

  const preDraftBoard = state.offseasonData.preDraft.board as unknown[];
  if (preDraftBoard.length) return normalizeList(preDraftBoard);

  const draftBoard = state.offseasonData.draft.board as unknown[];
  if (draftBoard.length) return normalizeList(draftBoard);

  return [];
}

export function getLegacyPreDraftBoardView(state: GameState): NormalizedDraftProspect[] {
  const canonical = SCOUTING_FEATURES.useCanonicalScoutingState ? getCanonicalDraftProspects(state) : [];
  if (canonical.length) return canonical;

  const preDraftBoard = state.offseasonData.preDraft.board as unknown[];
  if (preDraftBoard.length) return normalizeList(preDraftBoard);

  const draftBoard = state.offseasonData.draft.board as unknown[];
  if (draftBoard.length) return normalizeList(draftBoard);

  return [];
}

export function getLegacyProspectById(state: GameState, prospectId: string): NormalizedDraftProspect | null {
  const canonical = SCOUTING_FEATURES.useCanonicalScoutingState ? getCanonicalDraftProspects(state) : [];
  const canonicalMatch = canonical.find((p) => p.id === prospectId);
  if (canonicalMatch) return canonicalMatch;

  const preDraftBoard = state.offseasonData.preDraft.board as unknown[];
  if (preDraftBoard.length) {
    const normalized = normalizeList(preDraftBoard);
    const match = normalized.find((p) => p.id === prospectId);
    if (match) return match;
  }

  const combineProspects = state.offseasonData.combine.prospects as unknown[];
  if (combineProspects.length) {
    const normalized = normalizeList(combineProspects);
    const match = normalized.find((p) => p.id === prospectId);
    if (match) return match;
  }

  const draftBoard = state.offseasonData.draft.board as unknown[];
  if (draftBoard.length) {
    const normalized = normalizeList(draftBoard);
    const match = normalized.find((p) => p.id === prospectId);
    if (match) return match;
  }

  return null;
}
