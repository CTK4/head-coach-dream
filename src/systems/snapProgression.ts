import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

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

function devMultiplier(devTrait?: string): number {
  const raw = String(devTrait ?? "").toUpperCase();
  if (raw.includes("SUPER") || raw.includes("X")) return 1.25;
  if (raw.includes("STAR")) return 1.12;
  if (raw.includes("NORMAL")) return 1;
  return 0.9;
}

export function computeDevelopmentScore(input: ProgressionInput): number {
  const totalSnaps = Number(input.snaps.offensiveSnaps ?? 0) + Number(input.snaps.defensiveSnaps ?? 0) + Number(input.snaps.specialTeamsSnaps ?? 0);
  const snapShare = clamp(totalSnaps / Math.max(1, input.maxTeamSnaps), 0, 1);
  const efficiency = clamp(input.efficiencyScore, 0, 1);
  const success = clamp(input.teamSuccess, 0, 1);

  const c = SIM_SYSTEMS_CONFIG.progression;
  const base = snapShare * c.snapShareWeight + efficiency * c.efficiencyWeight + success * c.teamSuccessWeight;
  const adjusted = base * devMultiplier(input.devTrait) - clamp(input.injurySetback ?? 0, 0, 1) * c.injurySetbackPenalty;
  return clamp(adjusted, 0, 1.4);
}

export function computeSnapBasedDevelopmentDelta(input: ProgressionInput): number {
  const c = SIM_SYSTEMS_CONFIG.progression;
  const score = computeDevelopmentScore(input);
  const ageRegression = input.age > c.regressionAgeStart ? (input.age - c.regressionAgeStart) * c.regressionPerYear : 0;

  const breakoutBoost = score >= c.breakoutThreshold ? 1 : 0;
  const raw = (score - 0.52) * 6 + breakoutBoost - ageRegression * 4;
  return Math.round(clamp(raw, -4, 5));
}
