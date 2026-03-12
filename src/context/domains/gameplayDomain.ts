import type { GameAction, GameState } from "@/context/GameContext";
import type { DomainReducerCompatDeps } from "@/context/domains/compatibilityWrappers";

export function reduceGameplayDomain(state: GameState, action: GameAction, deps: Pick<DomainReducerCompatDeps, "reduceSeasonGameplay">): GameState | null {
  const t = action.type;
  if (t.startsWith("SEASON_") || t.startsWith("PLAYOFFS_")) {
    return deps.reduceSeasonGameplay(state, action);
  }
  return null;
}
