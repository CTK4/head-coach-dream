import { clampFatigue } from "@/engine/fatigue";
import { rng } from "@/engine/rng";

export type PracticeCategory = "fundamentals" | "schemeInstall" | "conditioning";
export type PracticeAllocation = Record<PracticeCategory, number>;
export type PracticeNeglectTracker = Record<PracticeCategory, number>;

export type LegacyFocusType = "Install" | "Conditioning" | "Fundamentals" | "Recovery";
export type LegacyIntensity = "Low" | "Normal" | "High";

export type PracticePlan = {
  weeklyBudget: number;
  allocation: PracticeAllocation;
  neglectWeeks: PracticeNeglectTracker;
};

export type PracticeEffect = {
  fatigueBase: number;
  familiarityGain: number;
  injuryRiskMod: number;
  devXP: number;
  mentalErrorMod: number;
  schemeConceptBonus: number;
  lateGameRetentionBonus: number;
  cumulativeNeglectPenalty: number;
};

export type EffectPreview = {
  fatigueRange: [min: number, max: number];
  familiarityRange: [min: number, max: number];
  injuryRiskMod: number;
  devXP: number;
  mentalErrorMod: number;
  schemeConceptBonus: number;
  lateGameRetentionBonus: number;
  cumulativeNeglectPenalty: number;
};

export const PRACTICE_POINTS_MIN = 5;
export const PRACTICE_POINTS_MAX = 8;
export const PRACTICE_POINTS_BUDGET = 6;
export const FAMILIARITY_VARIANCE_BAND = 1;

export const DEFAULT_PRACTICE_PLAN: PracticePlan = {
  weeklyBudget: PRACTICE_POINTS_BUDGET,
  allocation: { fundamentals: 2, schemeInstall: 2, conditioning: 2 },
  neglectWeeks: { fundamentals: 0, schemeInstall: 0, conditioning: 0 },
};

export function normalizePracticeAllocation(allocation: Partial<PracticeAllocation> | undefined, budget = PRACTICE_POINTS_BUDGET): PracticeAllocation {
  const initial: PracticeAllocation = {
    fundamentals: Math.max(0, Math.round(Number(allocation?.fundamentals ?? 0))),
    schemeInstall: Math.max(0, Math.round(Number(allocation?.schemeInstall ?? 0))),
    conditioning: Math.max(0, Math.round(Number(allocation?.conditioning ?? 0))),
  };
  const boundedBudget = Math.max(PRACTICE_POINTS_MIN, Math.min(PRACTICE_POINTS_MAX, Math.round(budget)));
  let total = initial.fundamentals + initial.schemeInstall + initial.conditioning;
  if (total === boundedBudget) return initial;
  const order: PracticeCategory[] = ["fundamentals", "schemeInstall", "conditioning"];
  const out = { ...initial };

  if (total < boundedBudget) {
    let idx = 0;
    while (total < boundedBudget) {
      const cat = order[idx % order.length];
      out[cat] += 1;
      total += 1;
      idx += 1;
    }
    return out;
  }

  let idx = 0;
  while (total > boundedBudget) {
    const cat = order[idx % order.length];
    if (out[cat] > 0) {
      out[cat] -= 1;
      total -= 1;
    }
    idx += 1;
  }
  return out;
}

export function migratePracticePlan(input: unknown): PracticePlan {
  if (input == null) return { ...DEFAULT_PRACTICE_PLAN };
  const raw = input as any;
  if (raw && typeof raw === "object" && raw.allocation) {
    const budget = Number(raw.weeklyBudget ?? PRACTICE_POINTS_BUDGET);
    return {
      weeklyBudget: Math.max(PRACTICE_POINTS_MIN, Math.min(PRACTICE_POINTS_MAX, Math.round(budget))),
      allocation: normalizePracticeAllocation(raw.allocation, budget),
      neglectWeeks: {
        fundamentals: Math.max(0, Math.round(Number(raw.neglectWeeks?.fundamentals ?? 0))),
        schemeInstall: Math.max(0, Math.round(Number(raw.neglectWeeks?.schemeInstall ?? 0))),
        conditioning: Math.max(0, Math.round(Number(raw.neglectWeeks?.conditioning ?? 0))),
      },
    };
  }

  const legacyFocus = String(raw?.primaryFocus ?? "Fundamentals") as LegacyFocusType;
  const legacyIntensity = String(raw?.intensity ?? "Normal") as LegacyIntensity;
  const base = { fundamentals: 2, schemeInstall: 2, conditioning: 2 } as PracticeAllocation;
  const shift = legacyIntensity === "High" ? 2 : legacyIntensity === "Low" ? 1 : 1;

  if (legacyFocus === "Fundamentals") {
    base.fundamentals += shift;
    base.schemeInstall -= 1;
    base.conditioning -= 1;
  } else if (legacyFocus === "Install") {
    base.schemeInstall += shift;
    base.fundamentals -= 1;
    base.conditioning -= 1;
  } else if (legacyFocus === "Conditioning" || legacyFocus === "Recovery") {
    base.conditioning += shift;
    base.fundamentals -= 1;
    base.schemeInstall -= 1;
  }

  return {
    weeklyBudget: PRACTICE_POINTS_BUDGET,
    allocation: normalizePracticeAllocation(base, PRACTICE_POINTS_BUDGET),
    neglectWeeks: { fundamentals: 0, schemeInstall: 0, conditioning: 0 },
  };
}

export function buildNextNeglectTracker(allocation: PracticeAllocation, current: PracticeNeglectTracker): PracticeNeglectTracker {
  return {
    fundamentals: allocation.fundamentals > 0 ? 0 : Math.max(0, current.fundamentals + 1),
    schemeInstall: allocation.schemeInstall > 0 ? 0 : Math.max(0, current.schemeInstall + 1),
    conditioning: allocation.conditioning > 0 ? 0 : Math.max(0, current.conditioning + 1),
  };
}

export function getPracticeEffect(plan: PracticePlan): PracticeEffect {
  const allocation = normalizePracticeAllocation(plan.allocation, plan.weeklyBudget);
  const neglect = plan.neglectWeeks ?? DEFAULT_PRACTICE_PLAN.neglectWeeks;
  const neglectPenalty =
    Math.max(0, neglect.fundamentals - 1) * 0.008 +
    Math.max(0, neglect.schemeInstall - 1) * 0.008 +
    Math.max(0, neglect.conditioning - 1) * 0.012;

  const fundamentals = allocation.fundamentals;
  const schemeInstall = allocation.schemeInstall;
  const conditioning = allocation.conditioning;

  return {
    fatigueBase: -(conditioning * 1.1 + fundamentals * 0.35),
    familiarityGain: schemeInstall * 1.2,
    injuryRiskMod: -(conditioning * 0.015) + neglectPenalty * 0.4,
    devXP: Math.max(0, Math.round(fundamentals * 0.8)),
    mentalErrorMod: -(fundamentals * 0.015) + neglectPenalty * 0.5,
    schemeConceptBonus: schemeInstall * 0.3 - neglectPenalty * 6,
    lateGameRetentionBonus: conditioning * 0.28 - neglectPenalty * 4,
    cumulativeNeglectPenalty: neglectPenalty,
  };
}

export function getEffectPreview(plan: PracticePlan): EffectPreview {
  const effect = getPracticeEffect(plan);
  return {
    fatigueRange: [Math.round(effect.fatigueBase * 10) / 10, Math.round(effect.fatigueBase * 10) / 10],
    familiarityRange:
      effect.familiarityGain > 0
        ? [Math.max(0, effect.familiarityGain - FAMILIARITY_VARIANCE_BAND), effect.familiarityGain + FAMILIARITY_VARIANCE_BAND]
        : [0, 0],
    injuryRiskMod: effect.injuryRiskMod,
    devXP: effect.devXP,
    mentalErrorMod: effect.mentalErrorMod,
    schemeConceptBonus: effect.schemeConceptBonus,
    lateGameRetentionBonus: effect.lateGameRetentionBonus,
    cumulativeNeglectPenalty: effect.cumulativeNeglectPenalty,
  };
}

export function resolveInstallFamiliarity(seed: number, week: number, playerId: string, base: number): number {
  if (base <= 0) return 0;
  const roll = rng(seed, `practice-fam-${week}-${playerId}`)();
  const variance = Math.round((roll * 2 - 1) * FAMILIARITY_VARIANCE_BAND);
  return Math.max(0, Math.round(base + variance));
}

export function applyPracticeFatigue(currentFatigue: number, fatigueDelta: number): number {
  return clampFatigue(currentFatigue + fatigueDelta);
}
