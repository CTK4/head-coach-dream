import { advanceToDraft, advanceToFreeAgency, advanceToRegularSeason } from "@/engine/phaseTransitions";
import type { GameState } from "@/context/GameContext";

export type SupportedPhaseTransition = "FREE_AGENCY" | "DRAFT" | "REGULAR_SEASON";

export function transitionToCareerPhase(state: GameState, transition: SupportedPhaseTransition): GameState {
  switch (transition) {
    case "FREE_AGENCY":
      return advanceToFreeAgency(state);
    case "DRAFT":
      return advanceToDraft(state);
    case "REGULAR_SEASON":
      return advanceToRegularSeason(state);
    default: {
      const exhaustive: never = transition;
      return exhaustive;
    }
  }
}
