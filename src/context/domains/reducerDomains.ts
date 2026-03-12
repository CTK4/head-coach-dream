import type { GameAction, GameState } from "@/context/GameContext";

export type DomainReducer = (state: GameState, action: GameAction) => GameState | null;

export function composeDomainReducers(state: GameState, action: GameAction, reducers: readonly DomainReducer[]): GameState | null {
  for (const reducer of reducers) {
    const next = reducer(state, action);
    if (next) return next;
  }
  return null;
}
