import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";
import { getDevTraitProgressionMultiplier } from "@/lib/devTrait";

export type SnapCounts = {
  offensiveSnaps?: number;
  defensiveSnaps?: number;
  specialTeamsSnaps?: number;
};

export type ProgressionInput = {
  age: number;
  devTrait?: string;
  overall: number;
  snaps: SnapCounts;
  maxTeamSnaps: number;
  efficiencyScore: number;
  teamSuccess: number;
  injurySetback?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// devMultiplier is provided by @/lib/devTrait (getDevTraitProgressionMultiplier).

export function computeDevelopmentScore(input: ProgressionInput): number {
  const totalSnaps = Number(input.snaps.offensiveSnaps ?? 0) + Number(input.snaps.defensiveSnaps ?? 0) + Number(input.snaps.specialTeamsSnaps ?? 0);
  const snapShare = clamp(totalSnaps / Math.max(1, input.maxTeamSnaps), 0, 1);
  const efficiency = clamp(input.efficiencyScore, 0, 1);
  const success = clamp(input.teamSuccess, 0, 1);

  const c = SIM_SYSTEMS_CONFIG.progression;
  const base = snapShare * c.snapShareWeight + efficiency * c.efficiencyWeight + success * c.teamSuccessWeight;
  const adjusted = base * getDevTraitProgressionMultiplier(input.devTrait) - clamp(input.injurySetback ?? 0, 0, 1) * c.injurySetbackPenalty;
  return clamp(adjusted, 0, 1.4);
}

export function computeSnapBasedDevelopmentDelta(input: ProgressionInput): number {
  const c = SIM_SYSTEMS_CONFIG.progression;
  const score = computeDevelopmentScore(input);
  const ageRegression = input.age > c.regressionAgeStart ? (input.age - c.regressionAgeStart) * c.regressionPerYear : 0;

  const breakoutBoost = score >= c.breakoutThreshold ? 1 : 0;

  // Formula breakdown:
  //   (score - 0.52): 0.52 is the "neutral" development score — a starter
  //     logging average efficiency on a .500 team. Scores above this produce
  //     positive OVR gains; below this produce stagnation or regression.
  //   * 6: scale factor that maps the [-0.52, +0.88] score range to roughly
  //     [-3, +5] OVR before clamping — matching empirical NFL year-over-year
  //     improvement distributions for starters.
  //   + breakoutBoost: flat +1 OVR for elite development seasons (score ≥ 0.78).
  //   - ageRegression * 4: accelerated decline post-regressionAgeStart;
  //     the *4 multiplier ensures veteran decline is felt immediately.
  const raw = (score - 0.52) * 6 + breakoutBoost - ageRegression * 4;
  return Math.round(clamp(raw, -4, 5));
}
