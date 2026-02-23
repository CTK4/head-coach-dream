import type { GameState } from '../../context/GameContext';
import { resolvePerkModifiers } from '@/engine/perkWiring';

export function resolveGame(state: GameState): GameState {
  // Keep game-level perk modifiers warm for systems that resolve whole-game outcomes.
  resolvePerkModifiers(state.coach, {
    quarter: Number(state.game?.clock?.quarter ?? 1),
    timeRemainingSec: Number(state.game?.clock?.timeRemainingSec ?? 900),
  });
  return state;
}
