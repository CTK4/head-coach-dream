import type { GameState } from '../context/GameContext';

export { updateMorale as updatePlayerMorale } from './moraleEngine';
export { moraleChipColor } from './moraleEngine';

export function updateMorale(state: GameState): GameState {
  return state;
}

