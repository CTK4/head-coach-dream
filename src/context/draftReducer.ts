import { gameReducerMonolith, type GameAction, type GameState } from "@/context/GameContext";

export function draftReducer(state: GameState, action: GameAction): GameState {
  return gameReducerMonolith(state, action);
}
