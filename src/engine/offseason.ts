export type OffseasonStepId =
  | "RESIGNING"
  | "COMBINE"
  | "TAMPERING"
  | "FREE_AGENCY"
  | "PRE_DRAFT"
  | "DRAFT"
  | "TRAINING_CAMP"
  | "PRESEASON"
  | "CUT_DOWNS";

export type OffseasonStep = { id: OffseasonStepId; title: string; desc: string };

export const OFFSEASON_STEPS: OffseasonStep[] = [
  { id: "RESIGNING", title: "Re-signing / Tags", desc: "Re-signing + Franchise/Transition tags." },
  { id: "COMBINE", title: "Scouting Combine", desc: "Athletic testing + initial evals." },
  { id: "TAMPERING", title: "Legal Negotiating", desc: "UFA negotiating window (tampering)." },
  { id: "FREE_AGENCY", title: "New League Year / FA / Trades", desc: "Free agency opens + trades begin." },
  { id: "PRE_DRAFT", title: "Pre-Draft", desc: "Top 30 visits, pro days, private workouts." },
  { id: "DRAFT", title: "Draft", desc: "Draft selections + rookie onboarding." },
  { id: "TRAINING_CAMP", title: "Training Camp", desc: "Install, intensity, depth chart prep." },
  { id: "PRESEASON", title: "Preseason", desc: "3 games." },
  { id: "CUT_DOWNS", title: "Final Cut Downs", desc: "Finalize roster + enter Week 1." },
];

export function nextOffseasonStepId(current: OffseasonStepId): OffseasonStepId | null {
  const idx = OFFSEASON_STEPS.findIndex((s) => s.id === current);
  if (idx < 0) return OFFSEASON_STEPS[0].id;
  return OFFSEASON_STEPS[idx + 1]?.id ?? null;
}
