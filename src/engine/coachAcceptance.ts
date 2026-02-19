/**
 * src/engine/coachAcceptance.ts
 *
 * Deterministic offer acceptance model.
 * - Higher reputation => higher required generosity vs expected salary.
 * - Coordinators are stricter than position/assistant coaches.
 * - Uses stable hash-based pseudo-randomness to avoid flaky behavior.
 */

export type CoachOfferContext = {
  season: number;
  teamId: string;
  personId: string;
  roleKey: string;
  reputation: number;
  expectedSalary: number;
  offeredSalary: number;
  isCoordinator: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rand01(key: string): number {
  const h = hash32(key);
  return (h & 0xffffff) / 0x1000000;
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function requiredRatio(rep: number, isCoordinator: boolean, season: number): number {
  const r = clamp(rep, 0, 100);
  const base = 0.9 + (r / 100) * 0.35;
  const coordPremium = isCoordinator ? 0.1 + (r / 100) * 0.08 : 0;
  const earlyPenalty = season <= 2026 ? 0.05 : 0;
  return base + coordPremium + earlyPenalty;
}

export function computeAcceptanceProbability(ctx: CoachOfferContext): number {
  const exp = Math.max(1, ctx.expectedSalary);
  const ratio = ctx.offeredSalary / exp;
  const req = requiredRatio(ctx.reputation, ctx.isCoordinator, ctx.season);
  const k = ctx.isCoordinator ? 10 : 7;
  const raw = sigmoid((ratio - req) * k);
  const repCold = ctx.isCoordinator ? clamp((ctx.reputation - 60) / 80, 0, 0.35) : 0;
  return clamp(raw - repCold, 0, 1);
}

export function isOfferAccepted(ctx: CoachOfferContext): boolean {
  const p = computeAcceptanceProbability(ctx);
  const key = `${ctx.season}|${ctx.teamId}|${ctx.personId}|${ctx.roleKey}|${Math.round(ctx.offeredSalary)}|${Math.round(
    ctx.expectedSalary
  )}|${Math.round(ctx.reputation)}|${ctx.isCoordinator ? "C" : "N"}`;
  const roll = rand01(key);
  return roll < p;
}
