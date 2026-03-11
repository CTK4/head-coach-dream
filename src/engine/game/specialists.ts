import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";

export type SpecialistSlots = Partial<Record<"K" | "P", string>>;

function isValidForSlot(state: GameState, teamId: string, playerId: string | undefined, pos: "K" | "P", activePlayerIds?: Set<string>): boolean {
  const id = String(playerId ?? "");
  if (!id) return false;
  if (activePlayerIds?.size && !activePlayerIds.has(id)) return false;
  return getEffectivePlayersByTeam(state, teamId).some((p: any) => String(p.playerId) === id && String(p.pos ?? "").toUpperCase() === pos);
}

function bestAvailableForSlot(state: GameState, teamId: string, pos: "K" | "P", activePlayerIds?: Set<string>): string | undefined {
  const roster = getEffectivePlayersByTeam(state, teamId)
    .filter((p: any) => String(p.pos ?? "").toUpperCase() === pos)
    .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
  // Active-roster constraints are soft in fallback mode: if no active specialist exists
  // we still resolve a deterministic K/P from the effective team roster.
  const constrained = activePlayerIds?.size ? roster.filter((p: any) => activePlayerIds.has(String(p.playerId))) : roster;
  const top = (constrained[0] ?? roster[0]) as any;
  return top ? String(top.playerId) : undefined;
}

export function resolveSpecialistsForTeam(state: GameState, params: { teamId: string; existing?: SpecialistSlots; depthStarterIds?: SpecialistSlots; activePlayerIds?: Set<string> }): SpecialistSlots {
  const teamId = String(params.teamId ?? "");
  if (!teamId) return {};
  const out: SpecialistSlots = {};
  for (const pos of ["K", "P"] as const) {
    const existing = String(params.existing?.[pos] ?? "");
    const starter = String(params.depthStarterIds?.[pos] ?? "");
    if (isValidForSlot(state, teamId, existing, pos, params.activePlayerIds)) {
      out[pos] = existing;
      continue;
    }
    if (isValidForSlot(state, teamId, starter, pos, params.activePlayerIds)) {
      out[pos] = starter;
      continue;
    }
    const fallback = bestAvailableForSlot(state, teamId, pos, params.activePlayerIds);
    if (fallback) out[pos] = fallback;
  }
  return out;
}

export function resolveSpecialistsBySide(
  state: GameState,
  params: {
    homeTeamId: string;
    awayTeamId: string;
    existingBySide?: Record<"HOME" | "AWAY", SpecialistSlots>;
    homeDepthStarterIds?: SpecialistSlots;
    awayDepthStarterIds?: SpecialistSlots;
    homeActivePlayerIds?: Set<string>;
    awayActivePlayerIds?: Set<string>;
  }
): Record<"HOME" | "AWAY", SpecialistSlots> {
  return {
    HOME: resolveSpecialistsForTeam(state, {
      teamId: params.homeTeamId,
      existing: params.existingBySide?.HOME,
      depthStarterIds: params.homeDepthStarterIds,
      activePlayerIds: params.homeActivePlayerIds,
    }),
    AWAY: resolveSpecialistsForTeam(state, {
      teamId: params.awayTeamId,
      existing: params.existingBySide?.AWAY,
      depthStarterIds: params.awayDepthStarterIds,
      activePlayerIds: params.awayActivePlayerIds,
    }),
  };
}
