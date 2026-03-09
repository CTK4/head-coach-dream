import type { GameState } from "@/context/GameContext";
import { DEFAULT_PRACTICE_PLAN } from "@/engine/practiceFocus";

export type InitialPracticeState = Pick<
  GameState,
  | "playerFatigueById"
  | "practicePlan"
  | "practicePlanConfirmed"
  | "practiceNeglectCounters"
  | "cumulativeNeglectPenalty"
  | "weeklyFamiliarityBonus"
  | "weeklyMentalErrorMod"
  | "weeklySchemeConceptBonus"
  | "weeklyLateGameRetentionBonus"
  | "nextGameInjuryRiskMod"
  | "lastPracticeOutcomeSummary"
  | "playerDevXpById"
>;

export function createInitialPracticeState(): InitialPracticeState {
  return {
    playerFatigueById: {},
    practicePlan: {
      ...DEFAULT_PRACTICE_PLAN,
      allocation: { ...DEFAULT_PRACTICE_PLAN.allocation },
      neglectWeeks: { ...DEFAULT_PRACTICE_PLAN.neglectWeeks },
    },
    practicePlanConfirmed: false,
    practiceNeglectCounters: { ...DEFAULT_PRACTICE_PLAN.neglectWeeks },
    cumulativeNeglectPenalty: 0,
    weeklyFamiliarityBonus: 0,
    weeklyMentalErrorMod: 0,
    weeklySchemeConceptBonus: 0,
    weeklyLateGameRetentionBonus: 0,
    nextGameInjuryRiskMod: 0,
    lastPracticeOutcomeSummary: undefined,
    playerDevXpById: {},
  };
}
