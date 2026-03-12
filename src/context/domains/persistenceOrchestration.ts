import type { GameAction, GameState } from "@/context/GameContext";
import type { DomainReducer } from "@/context/domains/reducerDomains";
import { composeDomainReducers } from "@/context/domains/reducerDomains";

export type PersistenceOrchestrationDeps = {
  applyPhaseGuard: (state: GameState, action: GameAction) => GameState | null;
  reduceDomainActions: DomainReducer[];
  reduceMonolith: (state: GameState, action: GameAction) => GameState;
};

export function reduceWithPersistenceOrchestration(state: GameState, action: GameAction, deps: PersistenceOrchestrationDeps): GameState {
  const blocked = deps.applyPhaseGuard(state, action);
  if (blocked) return blocked;

  const reduced = composeDomainReducers(state, action, deps.reduceDomainActions);
  if (reduced) return reduced;

  return deps.reduceMonolith(state, action);
}
