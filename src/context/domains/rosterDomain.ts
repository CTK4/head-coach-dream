import type { GameAction, GameState } from "@/context/GameContext";
import type { DomainReducerCompatDeps } from "@/context/domains/compatibilityWrappers";

export function reduceRosterDomain(state: GameState, action: GameAction, deps: Pick<DomainReducerCompatDeps, "reduceOffseason">): GameState | null {
  if (action.type === "CUT_TOGGLE") {
    return deps.reduceOffseason(state, action);
  }
  return null;
}
