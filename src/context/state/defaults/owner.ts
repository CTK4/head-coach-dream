import type { OwnerGoalSet, OwnerState } from "@/context/state/types/defaultStateTypes";

export function defaultOwnerGoals(): OwnerGoalSet {
  return { minWins: 9, playoffRoundTarget: "WILD_CARD", topUnitTarget: { unit: "OFFENSE", rankMax: 16 } };
}

export function defaultOwnerState(): OwnerState {
  return { approval: 60, pressure: 40, trust: 55, ultimatums: [], currentGoals: defaultOwnerGoals() };
}
