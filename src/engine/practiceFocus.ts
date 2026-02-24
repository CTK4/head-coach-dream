import { clampFatigue } from "@/engine/fatigue";
import { rng } from "@/engine/rng";

export type FocusType = "Install" | "Conditioning" | "Fundamentals" | "Recovery";
export type Intensity = "Low" | "Normal" | "High";

export type PracticePlan = { primaryFocus: FocusType; intensity: Intensity };

export type PracticeEffect = {
  fatigueBase: number;
  familiarityGain: number;
  injuryRiskMod: number;
  devXP: number;
};

export type EffectPreview = {
  fatigueRange: [min: number, max: number];
  familiarityRange: [min: number, max: number];
  injuryRiskMod: number;
  devXP: number;
  note?: string;
};

export const FAMILIARITY_VARIANCE_BAND = 1;

export const DEFAULT_PRACTICE_PLAN: PracticePlan = {
  primaryFocus: "Fundamentals",
  intensity: "Normal",
};

export const PRACTICE_FOCUS_EFFECTS: Record<FocusType, Record<Intensity, PracticeEffect>> = {
  Install: {
    Low: { fatigueBase: 2, familiarityGain: 2, injuryRiskMod: 0, devXP: 0 },
    Normal: { fatigueBase: 5, familiarityGain: 3, injuryRiskMod: 0, devXP: 0 },
    High: { fatigueBase: 8, familiarityGain: 4, injuryRiskMod: 0, devXP: 0 },
  },
  Conditioning: {
    Low: { fatigueBase: -3, familiarityGain: 0, injuryRiskMod: 0, devXP: 0 },
    Normal: { fatigueBase: -6, familiarityGain: 0, injuryRiskMod: 0, devXP: 0 },
    High: { fatigueBase: -10, familiarityGain: 0, injuryRiskMod: -0.05, devXP: 0 },
  },
  Fundamentals: {
    Low: { fatigueBase: 0, familiarityGain: 0, injuryRiskMod: 0, devXP: 1 },
    Normal: { fatigueBase: 1, familiarityGain: 0, injuryRiskMod: 0, devXP: 1 },
    High: { fatigueBase: 3, familiarityGain: 0, injuryRiskMod: 0, devXP: 1 },
  },
  Recovery: {
    Low: { fatigueBase: -5, familiarityGain: 0, injuryRiskMod: 0, devXP: 0 },
    Normal: { fatigueBase: -10, familiarityGain: 0, injuryRiskMod: 0, devXP: 0 },
    High: { fatigueBase: -15, familiarityGain: 0, injuryRiskMod: 0, devXP: 0 },
  },
};

export function getPracticeEffect(plan: PracticePlan): PracticeEffect {
  return PRACTICE_FOCUS_EFFECTS[plan.primaryFocus]?.[plan.intensity] ?? PRACTICE_FOCUS_EFFECTS[DEFAULT_PRACTICE_PLAN.primaryFocus][DEFAULT_PRACTICE_PLAN.intensity];
}

export function getEffectPreview(plan: PracticePlan): EffectPreview {
  const effect = getPracticeEffect(plan);
  return {
    fatigueRange: [effect.fatigueBase, effect.fatigueBase],
    familiarityRange:
      effect.familiarityGain > 0
        ? [effect.familiarityGain - FAMILIARITY_VARIANCE_BAND, effect.familiarityGain + FAMILIARITY_VARIANCE_BAND]
        : [0, 0],
    injuryRiskMod: effect.injuryRiskMod,
    devXP: effect.devXP,
    note: plan.primaryFocus === "Recovery" ? "Recovery intentionally grants no development XP." : undefined,
  };
}

export function resolveInstallFamiliarity(seed: number, week: number, playerId: string, base: number): number {
  if (base <= 0) return 0;
  const roll = rng(seed, `practice-fam-${week}-${playerId}`)();
  const variance = Math.round((roll * 2 - 1) * FAMILIARITY_VARIANCE_BAND);
  return Math.max(0, base + variance);
}

export function applyPracticeFatigue(currentFatigue: number, fatigueDelta: number): number {
  return clampFatigue(currentFatigue + fatigueDelta);
}
