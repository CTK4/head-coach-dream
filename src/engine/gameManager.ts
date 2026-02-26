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
import { logError, logInfo } from '@/lib/logger';

export function advanceWeek(state: GameState): GameState {
  logInfo('engine.advance_week.start', { phase: state.phase, season: state.season, week: state.week });
  try {
    let next = resolveGame(state);
    next = finalizeStats(next);
    next = updateSelfScout(next);
    next = resolveInjuries(next);
    next = updateMorale(next);
    next = updateChemistry(next);
    next = updateStaffTrust(next);
    next = updateMedia(next);
    next = updateOwner(next);
    const out = { ...next, week: (next.week ?? 0) + 1 };
    logInfo('engine.advance_week.end', { phase: out.phase, season: out.season, week: out.week, meta: { injuries: out.injuries?.length ?? 0 } });
    return out;
  } catch (error) {
    logError('engine.advance_week.failure', { phase: state.phase, season: state.season, week: state.week, meta: { message: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
}
