import { PhaseKeyEnum, StateMachine, type PhaseKey } from "@/lib/stateMachine";

export type { PhaseKey };

export function getPhaseKey(state: any): PhaseKey {
  return StateMachine.getPhaseKey(state);
}

export function isTradesAllowed(state: any): boolean {
  const phase = getPhaseKey(state);
  return phase === PhaseKeyEnum.REGULAR_SEASON_WEEK || phase === PhaseKeyEnum.PHASE_4_FREE_AGENCY;
}

export function isReSignAllowed(state: any): boolean {
  return getPhaseKey(state) === PhaseKeyEnum.PHASE_2_RETENTION;
}

export function selectCurrentPhase(state: any): PhaseKey {
  return getPhaseKey(state);
}
