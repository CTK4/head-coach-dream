import type { GameState } from '../context/GameContext';

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function updateChemistry(state: GameState): GameState {
  const moraleVals = Object.values(state.playerMorale ?? {});
  const avgMorale = moraleVals.length ? moraleVals.reduce((a, b) => a + Number(b ?? 0), 0) / moraleVals.length : 60;
  const lockerRoomCred = Number(state.coach.lockerRoomCred ?? 50);
  const playerRespect = Number(state.coach.reputation?.playerRespect ?? 50);

  const chemistryScore = clamp((avgMorale - 50) * 0.08 + (lockerRoomCred - 50) * 0.06 + (playerRespect - 50) * 0.06, -5, 5);
  const scoreDiff = Math.abs(Number(state.game.homeScore ?? 0) - Number(state.game.awayScore ?? 0));
  const closeGameMultiplier = scoreDiff <= 8 ? 1 : 0.5;
  const executionMod = Number((chemistryScore * closeGameMultiplier).toFixed(2));

  return {
    ...state,
    game: {
      ...state.game,
      practiceExecutionBonus: executionMod,
    },
  };
}
