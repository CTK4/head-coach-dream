import { OffseasonStepEnum, StateMachine, type OffseasonStepId } from "@/lib/stateMachine";

export type { OffseasonStepId };
export type OffseasonStep = { id: OffseasonStepId; title: string; desc: string };

// Keep this flag for future reintroduction without removing tampering logic elsewhere.
export const ENABLE_TAMPERING_STEP = false;

export const OFFSEASON_STEPS: OffseasonStep[] = [
  { id: OffseasonStepEnum.RESIGNING, title: "Re-signing / Tags", desc: "Re-signing + Franchise/Transition tags." },
  { id: OffseasonStepEnum.COMBINE, title: "Scouting Combine", desc: "Athletic testing + initial evals." },
  ...(ENABLE_TAMPERING_STEP
    ? ([{ id: OffseasonStepEnum.TAMPERING, title: "Legal Negotiating", desc: "UFA negotiating window (tampering)." }] as OffseasonStep[])
    : []),
  { id: OffseasonStepEnum.FREE_AGENCY, title: "New League Year / FA / Trades", desc: "Free agency opens + trades begin." },
  { id: OffseasonStepEnum.PRE_DRAFT, title: "Pre-Draft", desc: "Top 30 visits, pro days, private workouts." },
  { id: OffseasonStepEnum.DRAFT, title: "Draft", desc: "Draft selections + rookie onboarding." },
  { id: OffseasonStepEnum.TRAINING_CAMP, title: "Training Camp", desc: "Install, intensity, depth chart prep." },
  { id: OffseasonStepEnum.PRESEASON, title: "Preseason", desc: "3 games." },
  { id: OffseasonStepEnum.CUT_DOWNS, title: "Final Cut Downs", desc: "Finalize roster + enter Week 1." },
];

export function nextOffseasonStepId(current: OffseasonStepId): OffseasonStepId | null {
  return StateMachine.nextOffseasonStepId(current, { enableTamperingStep: ENABLE_TAMPERING_STEP });
}
