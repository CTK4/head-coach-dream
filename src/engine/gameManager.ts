import type { GameState } from '../context/GameContext';
import { resolveGame } from './game/resolveGame';
import { finalizeStats } from './stats/finalizeStats';
import { updateSelfScout } from './selfScout';
import { resolveInjuries } from './injuries';
import { updateMorale } from './morale';
import { updateChemistry } from './chemistry';
import { updateStaffTrust } from './staffTrust';
import { updateMedia } from './media';
import { updateOwner } from './owner';

export function advanceWeek(state: GameState): GameState {
  let next = resolveGame(state);
  next = finalizeStats(next);
  next = updateSelfScout(next);
  next = resolveInjuries(next);
  next = updateMorale(next);
  next = updateChemistry(next);
  next = updateStaffTrust(next);
  next = updateMedia(next);
  next = updateOwner(next);
  return { ...next, week: (next.week ?? 0) + 1 };
}
