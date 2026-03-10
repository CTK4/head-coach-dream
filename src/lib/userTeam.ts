import type { GameState } from "@/context/GameContext";

export type UserTeamStateLike = {
  acceptedOffer?: { teamId?: string | null } | null;
  userTeamId?: string | null;
  teamId?: string | null;
  staffRoster?: { teamId?: string | null } | null;
};

export function resolveCurrentUserTeamId(state: UserTeamStateLike): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.staffRoster?.teamId ?? undefined;
}

export function getUserTeamId(state: GameState): string | null {
  return resolveCurrentUserTeamId(state) ?? null;
}
