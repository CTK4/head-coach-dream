import { QB_TUNING, type QBArchetypeTag } from "@/config/qbTuning";
import type { OffenseSchemeId } from "@/lib/schemeLabels";

export function getQbSchemeFitMultiplier(tag: QBArchetypeTag, schemeId?: OffenseSchemeId): number {
  if (!schemeId) return 1;
  return QB_TUNING.SCHEME_FIT_MULTIPLIERS[tag]?.[schemeId] ?? 1;
}

export function getQbSchemeFitSignal(mult: number): "STRONG" | "NEUTRAL" | "POOR" {
  if (mult >= 1.06) return "STRONG";
  if (mult <= 0.94) return "POOR";
  return "NEUTRAL";
}
