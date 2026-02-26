import { RATING_MIDPOINT, RATING_SPREAD, Z_CLAMP_MAX, Z_CLAMP_MIN } from "@/engine/physics/constants";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ratingZ(rating: number): number {
  return clamp((rating - RATING_MIDPOINT) / RATING_SPREAD, Z_CLAMP_MIN, Z_CLAMP_MAX);
}

export function effectiveMass(weightLb: number, strengthZ: number, padLevel01: number, fatigue01: number): number {
  const base = clamp(weightLb, 160, 420);
  const strengthFactor = 1 + strengthZ * 0.08;
  const leverageFactor = 0.88 + clamp(padLevel01, 0, 1) * 0.22;
  const fatigueFactor = 1 - clamp(fatigue01, 0, 1) * 0.2;
  return base * strengthFactor * leverageFactor * fatigueFactor;
}

export function reachIn(heightIn: number, jumpZ: number): number {
  const height = clamp(heightIn, 62, 86);
  return height * 1.02 + jumpZ * 3.2;
}

export function codSkill(agilityZ: number, accelZ: number): number {
  return agilityZ * 0.58 + accelZ * 0.42;
}

export function handStrength(strengthZ: number): number {
  return 1 + strengthZ * 0.12;
}
