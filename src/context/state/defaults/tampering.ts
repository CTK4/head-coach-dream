import type { GameState } from "@/context/GameContext";

export function createInitialTamperingState(): GameState["tampering"] {
  return { interestByPlayerId: {}, nameByPlayerId: {}, shortlistPlayerIds: [], softOffersByPlayerId: {}, ui: { mode: "NONE" } };
}
