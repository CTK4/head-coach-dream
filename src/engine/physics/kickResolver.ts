import { resolveBounce, type BounceSurface } from "@/engine/physics/bounce";
import { FG_BASE_MAKE, FG_LONG_DISTANCE_PENALTY, PUNT_BASE_GROSS } from "@/engine/physics/constants";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type WeatherContext = { windTier: "LOW" | "MED" | "HIGH"; precipTier: "NONE" | "LIGHT" | "HEAVY"; surface: BounceSurface; direction?: "LEFT" | "MIDDLE" | "RIGHT" };

export type FgResult = { made: boolean; missDir: "L" | "R" | "S"; resultTags: Array<{ kind: "EXECUTION" | "MISTAKE"; text: string }>; debug: Record<string, number> };
export type PuntResult = {
  grossYds: number;
  netYds: number;
  hangTimeSec: number;
  inside20: boolean;
  touchback: boolean;
  returnable: boolean;
  rollYds: number;
  weirdBounce: boolean;
  resultTags: Array<{ kind: "EXECUTION" | "MISTAKE"; text: string }>;
  debug: Record<string, number>;
};

/** FG roll order: madeRoll, missDirRoll */
export function resolveFieldGoal(
  kicker: { power: number; accuracy: number; spin: number },
  context: WeatherContext & { distanceYds: number },
  rng: () => number,
): FgResult {
  const windPenalty = context.windTier === "HIGH" ? 0.08 : context.windTier === "MED" ? 0.04 : 0.015;
  const precipPenalty = context.precipTier === "HEAVY" ? 0.05 : context.precipTier === "LIGHT" ? 0.02 : 0;
  const spinOffset = ((kicker.spin - 60) / 40) * 0.04;
  const makeProb = clamp(
    FG_BASE_MAKE - Math.max(0, context.distanceYds - (42 + (kicker.power - 60) * 0.22)) * FG_LONG_DISTANCE_PENALTY + ((kicker.accuracy - 60) / 40) * 0.16 - windPenalty - precipPenalty + spinOffset,
    0.03,
    0.98,
  );
  const madeRoll = rng();
  const made = madeRoll < makeProb;
  const missDirRoll = rng();
  const missDir: "L" | "R" | "S" = missDirRoll < 0.42 ? "L" : missDirRoll < 0.84 ? "R" : "S";
  return { made, missDir, resultTags: [{ kind: made ? "EXECUTION" : "MISTAKE", text: made ? "FG_GOOD" : `FG_MISS_${missDir}` }], debug: { makeProb, madeRoll, missDirRoll } };
}

/** Punt roll order: distanceRoll, hangRoll, landingSpotRoll, bounceRoll(s) */
export function resolvePunt(
  punter: { power: number; accuracy: number; hang: number; spin: number },
  context: WeatherContext & { distanceYds: number },
  rng: () => number,
): PuntResult {
  const distanceRoll = rng();
  const grossBase = PUNT_BASE_GROSS + (punter.power - 60) * 0.28 - (context.windTier === "HIGH" ? 4 : context.windTier === "MED" ? 2 : 0) - (context.precipTier === "HEAVY" ? 3 : 0);
  const grossYds = Math.max(22, Math.round(grossBase + (distanceRoll - 0.5) * 10));
  const hangRoll = rng();
  const hangTimeSec = clamp(3.45 + (punter.hang - 60) * 0.022 + (hangRoll - 0.5) * 0.5, 2.8, 5.4);
  const landingSpotRoll = rng();
  const directionalBonus = context.direction === "LEFT" || context.direction === "RIGHT" ? 0.08 : 0;
  const returnable = landingSpotRoll > clamp(0.52 + (punter.accuracy - 60) * 0.004 + (punter.spin - 60) * 0.003 + directionalBonus, 0.25, 0.9);
  const bounce = resolveBounce({ baseRecoveryBias01: 0.5, surface: context.surface, windTier: context.windTier }, rng);
  const rollYds = returnable ? Math.max(0, bounce.rollYds - 2) : bounce.rollYds;
  const netYds = Math.max(16, grossYds - (returnable ? Math.round(4 + (5.2 - hangTimeSec) * 4) : 0) + rollYds);
  const landedAt = context.distanceYds - netYds;
  const touchback = landedAt <= 0;
  const inside20 = !touchback && landedAt <= 20;
  return {
    grossYds,
    netYds,
    hangTimeSec,
    inside20,
    touchback,
    returnable,
    rollYds,
    weirdBounce: bounce.weird,
    resultTags: [{ kind: "EXECUTION", text: inside20 ? "PUNT_INSIDE20" : touchback ? "PUNT_TOUCHBACK" : "PUNT_FLIP" }, ...(bounce.weird ? [{ kind: "MISTAKE" as const, text: "PUNT_WEIRD_BOUNCE" }] : [])],
    debug: { distanceRoll, hangRoll, landingSpotRoll, landedAt },
  };
}
