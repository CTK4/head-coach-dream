import { QB_BALLISTICS_BASE_DEEP_VARIANCE, QB_WOBBLE_BASE } from "@/engine/physics/constants";
import { ratingZ } from "@/engine/physics/ratingsToKinematics";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type QbBallisticsInput = {
  qb: { arm: number; accuracy: number; release: number; spin: number; fatigue01: number };
  context: { targetDepth: number; windTier: "LOW" | "MED" | "HIGH"; precipTier: "NONE" | "LIGHT" | "HEAVY"; throwOnRun: boolean };
};

/** roll order: wobbleRoll */
export function resolveQbBallistics(input: QbBallisticsInput, rng: () => number): { throwQualityAdj: number; deepVarianceMult: number; wobbleChance: number; tags: string[]; debug: Record<string, number> } {
  const spinZ = ratingZ(input.qb.spin);
  const releaseZ = ratingZ(input.qb.release);
  const armZ = ratingZ(input.qb.arm);
  const accuracyZ = ratingZ(input.qb.accuracy);
  const windPenalty = input.context.windTier === "HIGH" ? 0.3 : input.context.windTier === "MED" ? 0.16 : 0.07;
  const precipPenalty = input.context.precipTier === "HEAVY" ? 0.22 : input.context.precipTier === "LIGHT" ? 0.12 : 0;
  const dragProxy = (windPenalty + precipPenalty) * (1 - spinZ * 0.35);
  const deepWeight = clamp((input.context.targetDepth - 12) / 25, 0, 1);
  const throwQualityAdj = releaseZ * 0.15 + spinZ * 0.1 + armZ * 0.08 + accuracyZ * 0.12 - dragProxy - (input.context.throwOnRun ? 0.12 : 0) - input.qb.fatigue01 * 0.16;
  const deepVarianceMult = clamp(QB_BALLISTICS_BASE_DEEP_VARIANCE + deepWeight * (dragProxy * 1.6 + 0.35) - spinZ * 0.28, 0.6, 1.9);
  const wobbleChance = clamp(QB_WOBBLE_BASE + dragProxy * 0.2 + (input.context.throwOnRun ? 0.03 : 0) - spinZ * 0.05 - releaseZ * 0.03, 0.005, 0.25);
  const wobbleRoll = rng();
  const wobble = wobbleRoll < wobbleChance;
  const tags = wobble ? ["WOBBLE"] : [];
  return { throwQualityAdj: wobble ? throwQualityAdj - 0.18 : throwQualityAdj, deepVarianceMult: wobble ? deepVarianceMult + 0.12 : deepVarianceMult, wobbleChance, tags, debug: { dragProxy, deepWeight, throwQualityAdj, deepVarianceMult, wobbleChance, wobbleRoll } };
}
