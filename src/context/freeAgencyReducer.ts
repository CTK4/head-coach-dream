import { gameReducerMonolith, type GameAction, type GameState } from "@/context/GameContext";

export function freeAgencyReducer(state: GameState, action: GameAction): GameState {
  return gameReducerMonolith(state, action);
}
