import type { GameState } from '../context/GameContext';

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Syncs ownerState.approval (updated weekly by OWNER_WEEKLY_EVALUATE) into
 * owner.approval so that computeHotSeatScore() and computeTerminationRisk()
 * pick up live values rather than the stale initial hire value.
 *
 * Also recalculates jobSecurity as a blend of approval and financial rating
 * so the firing meter reflects current relationship with the owner.
 */
export function updateOwner(state: GameState): GameState {
  const currentApproval = Number(state.ownerState?.approval ?? state.owner?.approval ?? 60);
  const newApproval = clamp(Math.round(currentApproval), 0, 100);

  if (newApproval === state.owner?.approval) return state;

  const financialRating = Number(state.owner?.financialRating ?? 50);
  const newJobSecurity = clamp(
    Math.round(newApproval * 0.6 + financialRating * 0.4),
    0,
    100,
  );

  return {
    ...state,
    owner: {
      ...state.owner,
      approval: newApproval,
      jobSecurity: newJobSecurity,
    },
  };
}

/**
 * Updates coach.autonomy based on recent win/loss patterns and hot seat level.
 * Called weekly after updateOwner. Autonomy drifts toward constraints when
 * the owner's patience runs out and expands when results are strong.
 */
export function updateAutonomy(state: GameState): GameState {
  const currentAutonomy = Number(state.coach?.autonomy ?? 60);
  const baseline = Number(state.autonomyRating ?? currentAutonomy);

  const teamId = String(state.acceptedOffer?.teamId ?? state.teamId ?? '');
  const standing = state.league?.standings?.[teamId] ?? { w: 0, l: 0 };
  const wins = Number(standing.w ?? 0);
  const losses = Number(standing.l ?? 0);
  const recentResults = state.weeklyResults?.slice(-4) ?? [];

  // Count wins/losses from the last 4 game weeks
  const recentWins = recentResults.filter((wr: any) => {
    const userResult = (wr as any).userResult;
    return userResult?.didWin === true;
  }).length;
  const recentLosses = recentResults.filter((wr: any) => {
    const userResult = (wr as any).userResult;
    return userResult?.didWin === false;
  }).length;

  const hotSeatLevel = state.hotSeatStatus?.level ?? 'SECURE';

  let delta = 0;
  let reason = '';

  if (recentWins >= 3) {
    delta = 2;
    reason = 'Strong recent performance';
  } else if (recentLosses >= 3) {
    delta = -3;
    reason = 'Poor recent performance';
  }

  if (hotSeatLevel === 'WARM') {
    delta -= 2;
    reason = reason ? `${reason}; owner pressure increasing` : 'Owner pressure increasing';
  } else if (hotSeatLevel === 'HOT') {
    delta -= 5;
    reason = 'Owner has tightened control';
  } else if (hotSeatLevel === 'CRITICAL') {
    delta -= 8;
    reason = 'Owner has severely restricted operational freedom';
  }

  if (delta === 0) return state;

  const cap = baseline + 20;
  const floor = Math.max(0, baseline - 30);
  const newAutonomy = clamp(currentAutonomy + delta, floor, cap);

  if (newAutonomy === currentAutonomy) return state;

  const history = state.coach?.autonomyHistory ?? [];
  const week = Number(state.hub?.regularSeasonWeek ?? state.week ?? 0);
  const updatedHistory = [...history, { week, value: newAutonomy, reason }].slice(-20);

  return {
    ...state,
    coach: {
      ...state.coach,
      autonomy: newAutonomy,
      autonomyLastChangeReason: reason,
      autonomyHistory: updatedHistory,
    },
  };
}
