import type { OffenseEligibleRole } from "@/engine/assignments/types";

export type TargetSelectionInput = {
  reads: { primary: OffenseEligibleRole; progression: OffenseEligibleRole[] };
  qb: { footballIq: number; vision: number; awareness: number; focus: number; poise: number; pocketPresence: number; release: number };
  openScoreByRole: Partial<Record<OffenseEligibleRole, number>>;
  timeToPressureMs: number;
};

export type TargetSelectionResult = {
  chosenRole: OffenseEligibleRole;
  /** Read index in flattened order including primary (0=primary, 1=first progression). */
  progressionIndexUsed: number;
  timeToThrowMs: number;
};

export function chooseTargetRole(input: TargetSelectionInput): TargetSelectionResult {
  const order: OffenseEligibleRole[] = [input.reads.primary, ...input.reads.progression.filter((r) => r !== input.reads.primary)];
  const qbProcess = (input.qb.footballIq + input.qb.vision + input.qb.awareness + input.qb.focus + input.qb.poise + input.qb.pocketPresence + input.qb.release) / 7;
  const stepCostMs = Math.max(120, 290 - qbProcess * 1.1);
  const threshold = 0.1 + (80 - qbProcess) / 220;

  for (let i = 0; i < order.length; i += 1) {
    const role = order[i];
    const open = input.openScoreByRole[role] ?? -1;
    const elapsed = stepCostMs * (i + 1);
    if (elapsed >= input.timeToPressureMs) {
      return { chosenRole: i > 0 ? order[i - 1] : role, progressionIndexUsed: Math.max(0, i - 1), timeToThrowMs: Math.round(Math.min(input.timeToPressureMs, elapsed)) };
    }
    if (open >= threshold || i === order.length - 1) {
      return { chosenRole: role, progressionIndexUsed: i, timeToThrowMs: Math.round(elapsed) };
    }
  }

  return { chosenRole: order[0] ?? "RB", progressionIndexUsed: 0, timeToThrowMs: Math.round(stepCostMs) };
}
