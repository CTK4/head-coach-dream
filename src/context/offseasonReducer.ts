import { freeAgencyReducer } from "@/context/freeAgencyReducer";
import { gameReducerMonolith, type GameAction, type GameState } from "@/context/GameContext";
import { StateMachine } from "@/lib/stateMachine";

function alignsToStep(state: GameState, stepId: string): GameState {
  const target = StateMachine.careerStageForOffseasonStep(stepId as any, state.careerStage);
  if (target === state.careerStage) return state;
  return { ...state, careerStage: target };
}

export function offseasonReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "OFFSEASON_SET_STEP": {
      const next0 = gameReducerMonolith(state, action);
      let next = alignsToStep(next0, action.payload.stepId);
      if (action.payload.stepId === "FREE_AGENCY") {
        next = freeAgencyReducer(next, { type: "FA_ENTER_MARKET" } as GameAction);
      }
      return next;
    }
    case "OFFSEASON_ADVANCE_STEP": {
      if (state.offseason.stepId === "FREE_AGENCY") {
        const hasPending = Object.values(state.freeAgency.offersByPlayerId ?? {}).some((offers: any) => (offers ?? []).some((o: any) => o.status === "PENDING" || o.status === "COUNTERED"));
        if (hasPending || !state.offseason.stepsComplete?.FREE_AGENCY) return state;
      }
      const next0 = gameReducerMonolith(state, action);
      let next = alignsToStep(next0, next0.offseason.stepId);
      if (next.offseason.stepId === "FREE_AGENCY" && next.freeAgency.initializedForSeason !== next.season) {
        next = freeAgencyReducer(next, { type: "FA_ENTER_MARKET" } as GameAction);
      }
      return next;
    }
    default:
      return gameReducerMonolith(state, action);
  }
}
