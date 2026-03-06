import type { GameState } from "@/context/GameContext";

function withPhase(state: GameState, careerStage: GameState["careerStage"], leaguePhase: GameState["league"]["phase"], week?: number): GameState {
  const nextWeek = typeof week === "number" ? week : state.league.week;
  return {
    ...state,
    careerStage,
    week: nextWeek,
    hub: { ...state.hub, regularSeasonWeek: nextWeek },
    league: { ...state.league, phase: leaguePhase, week: nextWeek },
  };
}

export function advanceToFreeAgency(state: GameState): GameState {
  return withPhase(state, "FREE_AGENCY", "FREE_AGENCY");
}

export function advanceToDraft(state: GameState): GameState {
  return withPhase(state, "DRAFT", "DRAFT");
}

export function advanceToRegularSeason(state: GameState): GameState {
  const week = Math.max(1, Math.min(18, Number(state.hub.regularSeasonWeek ?? state.league.week ?? state.week ?? 1)));
  return withPhase(state, "REGULAR_SEASON", "REGULAR_SEASON", week);
}
