import type { GameAction, GameState } from "@/context/GameContext";
import type { DomainReducerCompatDeps } from "@/context/domains/compatibilityWrappers";

export function reduceOffseasonDomain(state: GameState, action: GameAction, deps: DomainReducerCompatDeps): GameState | null {
  const t = action.type;
  if (t.startsWith("OFFSEASON_")) {
    return deps.reduceOffseason(state, action);
  }
  if (t.startsWith("DRAFT_")) {
    return deps.reduceDraft(state, action);
  }
  return null;
}
