import type { PlayType } from "@/engine/gameSim";

export type FatigueTrackedPosition = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB";

export const FATIGUE_DEFAULT = 50;
export const FATIGUE_MIN = 0;
export const FATIGUE_MAX = 100;
export const HIGH_WORKLOAD_THRESHOLD = 75;

export const FATIGUE_THRESHOLDS = {
  ACCURACY: 60,
  SPEED: 70,
  INJURY: 80,
} as const;

export const FATIGUE_MODIFIERS = {
  ACCURACY: 0.92,
  SPEED: 0.9,
  INJURY: 1.2,
} as const;

export const FATIGUE_VARIANCE_BAND = 2;

export const POSITION_RECOVERY_RATES: Record<FatigueTrackedPosition, number> = {
  QB: 18,
  RB: 14,
  WR: 16,
  TE: 16,
  OL: 15,
  DL: 15,
  LB: 16,
  DB: 16,
};

export const BASE_SNAP_COSTS: Record<FatigueTrackedPosition, Record<PlayType, number>> = {
  QB: { INSIDE_ZONE: 1, OUTSIDE_ZONE: 1, POWER: 1, QUICK_GAME: 2, DROPBACK: 3, SCREEN: 2, RUN: 1, SHORT_PASS: 2, DEEP_PASS: 3, PLAY_ACTION: 2, SPIKE: 1, KNEEL: 1, PUNT: 0, FG: 0 },
  RB: { INSIDE_ZONE: 4, OUTSIDE_ZONE: 4, POWER: 5, QUICK_GAME: 2, DROPBACK: 1, SCREEN: 3, RUN: 4, SHORT_PASS: 1, DEEP_PASS: 1, PLAY_ACTION: 3, SPIKE: 0, KNEEL: 1, PUNT: 0, FG: 0 },
  WR: { INSIDE_ZONE: 2, OUTSIDE_ZONE: 2, POWER: 2, QUICK_GAME: 3, DROPBACK: 4, SCREEN: 3, RUN: 2, SHORT_PASS: 3, DEEP_PASS: 4, PLAY_ACTION: 4, SPIKE: 0, KNEEL: 0, PUNT: 0, FG: 0 },
  TE: { INSIDE_ZONE: 3, OUTSIDE_ZONE: 3, POWER: 3, QUICK_GAME: 2, DROPBACK: 3, SCREEN: 2, RUN: 3, SHORT_PASS: 2, DEEP_PASS: 3, PLAY_ACTION: 3, SPIKE: 0, KNEEL: 0, PUNT: 0, FG: 0 },
  OL: { INSIDE_ZONE: 3, OUTSIDE_ZONE: 3, POWER: 4, QUICK_GAME: 3, DROPBACK: 4, SCREEN: 3, RUN: 3, SHORT_PASS: 3, DEEP_PASS: 4, PLAY_ACTION: 4, SPIKE: 1, KNEEL: 2, PUNT: 0, FG: 0 },
  DL: { INSIDE_ZONE: 3, OUTSIDE_ZONE: 3, POWER: 4, QUICK_GAME: 2, DROPBACK: 3, SCREEN: 2, RUN: 3, SHORT_PASS: 2, DEEP_PASS: 3, PLAY_ACTION: 3, SPIKE: 0, KNEEL: 1, PUNT: 0, FG: 0 },
  LB: { INSIDE_ZONE: 3, OUTSIDE_ZONE: 3, POWER: 4, QUICK_GAME: 2, DROPBACK: 2, SCREEN: 2, RUN: 3, SHORT_PASS: 2, DEEP_PASS: 2, PLAY_ACTION: 3, SPIKE: 0, KNEEL: 1, PUNT: 0, FG: 0 },
  DB: { INSIDE_ZONE: 2, OUTSIDE_ZONE: 3, POWER: 3, QUICK_GAME: 3, DROPBACK: 3, SCREEN: 2, RUN: 2, SHORT_PASS: 3, DEEP_PASS: 4, PLAY_ACTION: 3, SPIKE: 0, KNEEL: 0, PUNT: 0, FG: 0 },
};

export function clampFatigue(value: number): number {
  if (!Number.isFinite(value)) return FATIGUE_DEFAULT;
  return Math.max(FATIGUE_MIN, Math.min(FATIGUE_MAX, value));
}

export function getRecoveryRate(pos: string): number {
  const p = String(pos).toUpperCase() as FatigueTrackedPosition;
  return POSITION_RECOVERY_RATES[p] ?? POSITION_RECOVERY_RATES.WR;
}

export function computeFatigueEffects(fatigue: number): { accuracy: number; speed: number; injuryRisk: number } {
  const safe = clampFatigue(fatigue);
  return {
    accuracy: safe >= FATIGUE_THRESHOLDS.ACCURACY ? FATIGUE_MODIFIERS.ACCURACY : 1,
    speed: safe >= FATIGUE_THRESHOLDS.SPEED ? FATIGUE_MODIFIERS.SPEED : 1,
    injuryRisk: safe >= FATIGUE_THRESHOLDS.INJURY ? FATIGUE_MODIFIERS.INJURY : 1,
  };
}

export function recoverFatigue(current: number, recoveryRate: number): number {
  return clampFatigue(Math.max(0, clampFatigue(current) - Math.max(0, recoveryRate)));
}

export function pushLast3SnapLoad(last3SnapLoads: number[], load: number): number[] {
  return [...last3SnapLoads.map((n) => Math.max(0, Number(n) || 0)), Math.max(0, Math.round(load))].slice(-3);
}
