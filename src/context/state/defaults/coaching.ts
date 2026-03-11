import type { GameState, WeekKey } from "@/context/GameContext";

export function createInitialCoachingState(weekKey: WeekKey): GameState["coaching"] {
  return {
    coachesById: {},
    staffByTeamId: {},
    market: { weekKey, candidates: [], pendingOffers: [], poaching: [] },
  };
}
