import type { GameState } from '../context/GameContext';
import { getEffectivePlayersByTeam } from '@/engine/rosterOverlay';
import { updateMorale as computeMorale } from './moraleEngine';

export { updateMorale as updatePlayerMorale } from './moraleEngine';
export { moraleChipColor } from './moraleEngine';

const SINGLETON_STARTER_SLOTS = new Set(['LT', 'LG', 'C', 'RG', 'RT', 'FS', 'SS', 'K', 'P']);

function deriveRoleExpectation(slot: string | undefined): 'STARTER' | 'ROTATIONAL' | 'DEPTH' {
  if (!slot) return 'DEPTH';
  if (SINGLETON_STARTER_SLOTS.has(slot) || /1$/.test(slot)) return 'STARTER';
  if (/2$/.test(slot)) return 'ROTATIONAL';
  return 'DEPTH';
}

export function updateMorale(state: GameState): GameState {
  const teamId = String(state.acceptedOffer?.teamId ?? state.teamId ?? '');
  if (!teamId) return state;

  const standing = state.league?.standings?.[teamId] ?? { w: 0, l: 0 };
  const rep = state.coach.reputation;
  const players = getEffectivePlayersByTeam(state, teamId);
  const nextMorale = { ...(state.playerMorale ?? {}) };
  const playerIdToSlot = new Map<string, string>();
  for (const [slot, starterId] of Object.entries(state.depthChart?.startersByPos ?? {})) {
    if (!starterId) continue;
    playerIdToSlot.set(String(starterId), slot);
  }

  for (const p of players) {
    const playerId = String((p as any).playerId ?? '');
    if (!playerId) continue;
    const current = Number(nextMorale[playerId] ?? 65);
    const roleExpectation = deriveRoleExpectation(playerIdToSlot.get(playerId));
    const isContractYear = state.playerContractOverrides?.[playerId]?.endSeason === state.season;
    const result = computeMorale(
      { morale: current, roleExpectation, playingTimeSatisfaction: 0 },
      {
        teamWins: Number(standing.w ?? 0),
        teamLosses: Number(standing.l ?? 0),
        isContractYear,
        strategyModeFit: 55,
        playerRespect: Number(rep?.playerRespect ?? 50),
        lockerRoomCred: Number(state.coach.lockerRoomCred ?? 50),
        seed: Number(state.saveSeed ?? 1) + Number(state.week ?? 0),
      },
      { snapsPlayed: 50, snapsExpected: 50 },
    );
    nextMorale[playerId] = result.morale;
  }

  return { ...state, playerMorale: nextMorale };
}
