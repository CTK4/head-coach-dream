import type { GameState } from '../context/GameContext';

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function updateStaffTrust(state: GameState): GameState {
  const teamId = String(state.acceptedOffer?.teamId ?? state.teamId ?? '');
  const standing = state.league?.standings?.[teamId] ?? { w: 0, l: 0 };
  const wins = Number(standing.w ?? 0);
  const losses = Number(standing.l ?? 0);
  const streakPenalty = losses >= wins + 3 ? -4 : 0;
  const winBoost = wins > losses ? 3 : -2;
  const deference = Number(state.coach.coordDeferenceLevel ?? 50);
  const deferenceImpact = deference >= 60 ? 2 : -3;
  const volatilityEvents = (state.memoryLog ?? []).filter((e) => String(e.type ?? '').toLowerCase().includes('volatility') && Number(e.season) === Number(state.season)).length;
  const volatilityImpact = Math.max(-4, -volatilityEvents);

  const currentRelationship = Number(state.coach.gmRelationship ?? 50);
  const nextRelationship = clamp(currentRelationship + winBoost + deferenceImpact + streakPenalty + volatilityImpact, 0, 100);

  return {
    ...state,
    coach: {
      ...state.coach,
      gmRelationship: nextRelationship,
    },
  };
}
