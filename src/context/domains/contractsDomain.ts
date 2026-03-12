import type { GameAction, GameState } from "@/context/GameContext";
import type { DomainReducerCompatDeps } from "@/context/domains/compatibilityWrappers";

export function reduceContractsDomain(state: GameState, action: GameAction, deps: DomainReducerCompatDeps): GameState | null {
  const t = action.type;
  if (t === "EXPIRE_EXPIRING_CONTRACTS_TO_FA") {
    return deps.reduceOffseason(state, action);
  }
  if (t.startsWith("FA_") || t.startsWith("FREE_AGENCY_")) {
    return deps.reduceContracts(state, action);
  }
  return null;
}
