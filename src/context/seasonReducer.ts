import { gameReducerMonolith, type GameAction, type GameState } from "@/context/GameContext";

export function seasonReducer(state: GameState, action: GameAction): GameState {
  return gameReducerMonolith(state, action);
}
