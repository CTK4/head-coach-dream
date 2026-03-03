import type { GameState } from "@/context/GameContext";

export function getUserTeamId(state: GameState): string | null {
  return state.userTeamId ?? state.acceptedOffer?.teamId ?? state.teamId ?? state.staffRoster?.teamId ?? null;
}

