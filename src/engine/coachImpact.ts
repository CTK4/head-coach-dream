import { TRAIT_STRENGTH, type CoachProfile } from "@/data/coachTraits";

const BASE_BOOST = 0.10;
const BASE_DRAG = 0.05;
const MAX_TENURE_MULT = 1.25;
const TENURE_RATE = 0.05;
const ATTR_FLOOR = 0;
const ATTR_CEIL = 99;

function clampAttr(value: number): number {
  return Math.min(ATTR_CEIL, Math.max(ATTR_FLOOR, value));
}

export function tenureMultiplier(tenureYears: number): number {
  return Math.min(1 + tenureYears * TENURE_RATE, MAX_TENURE_MULT);
}

export function coachAttrModifier(coach: CoachProfile, attrId: string): number {
  const tenureMult = tenureMultiplier(coach.tenureYears);
  return coach.traits.reduce((sum, trait) => {
    const affinityScore = trait.affinityMap[attrId] ?? 0;
    if (affinityScore === 1) return sum + BASE_BOOST * TRAIT_STRENGTH[trait.tier] * tenureMult;
    if (affinityScore === -1) return sum - BASE_DRAG * TRAIT_STRENGTH[trait.tier];
    return sum;
  }, 0);
}

export function applyStaffModifiers(baseAttr: number, attrId: string, staff: CoachProfile[]): number {
  const modified = staff.reduce((acc, coach) => acc * (1 + coachAttrModifier(coach, attrId)), baseAttr);
  return Math.round(clampAttr(modified));
}

export function coachFitScore(coach: CoachProfile, rosterAvgAttrs: Record<string, number>): number {
  const attrs = Object.keys(rosterAvgAttrs);
  if (!coach.traits.length || attrs.length === 0) return 0;

  const traitScores = coach.traits.map((trait) => {
    const weightedSum = attrs.reduce((sum, attr) => sum + (trait.affinityMap[attr] ?? 0) * rosterAvgAttrs[attr], 0);
    return (weightedSum / (attrs.length * ATTR_CEIL)) * 100;
  });

  const avg = traitScores.reduce((a, b) => a + b, 0) / traitScores.length;
  return Math.round(clampAttr(avg));
}

export function applyFullStaffImpact(baseAttrs: Record<string, number>, staff: CoachProfile[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [attrId, value] of Object.entries(baseAttrs)) {
    out[attrId] = applyStaffModifiers(value, attrId, staff);
  }
  return out;
}

export function netCoachImpact(coach: CoachProfile, baseAttrs: Record<string, number>): number {
  return Object.entries(baseAttrs).reduce((sum, [attrId, base]) => {
    const modified = applyStaffModifiers(base, attrId, [coach]);
    return sum + (modified - base);
  }, 0);
}

export function coachesForPosition(staff: CoachProfile[], pos: string): CoachProfile[] {
  const normalized = String(pos).toUpperCase();
  const roleMap: Record<string, CoachProfile["role"][]> = {
    QB: ["QB_COACH", "OC"],
    RB: ["RB_COACH", "OC"],
    WR: ["WR_COACH", "OC"],
    TE: ["WR_COACH", "OC"],
    OL: ["OL_COACH", "OC"],
    DL: ["DL_COACH", "DC"],
    EDGE: ["DL_COACH", "DC"],
    LB: ["LB_COACH", "DC"],
    CB: ["DB_COACH", "DC"],
    S: ["DB_COACH", "DC"],
    K: ["ST_COACH"],
    P: ["ST_COACH"],
  };

  const roles = roleMap[normalized] ?? [];
  return staff.filter((coach) => roles.includes(coach.role));
}
