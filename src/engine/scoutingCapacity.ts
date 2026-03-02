import type { Prospect } from "@/engine/offseasonData";
import type { MedicalTier, CharacterTier } from "@/engine/prospectIntel";
import { hiddenIntelForProspect } from "@/engine/prospectIntel";
import type { GmScoutTraits as GMScoutTraits } from "@/engine/gmScouting";

export type IntelTrack = "TALENT" | "MED" | "CHAR" | "FIT";
export type IntelState = Record<IntelTrack, number>;
export type PlayerIntel = {
  clarity: IntelState;
  meta: { lastWindowId?: string; windowGainUsed?: number; hiddenTraitRevealed?: boolean };
  revealed?: { medicalTier?: MedicalTier; characterTier?: CharacterTier };
};
export type ScoutingWindowId = "COMBINE" | "FREE_AGENCY" | "PRE_DRAFT";
export type ScoutingBudget = { windowId: ScoutingWindowId; total: number; spent: number; remaining: number; carryIn: number };

export type ScoutAction =
  | "FILM_QUICK"
  | "FILM_DEEP"
  | "BACKGROUND_CHECK"
  | "REQUEST_MEDICAL"
  | "COMBINE_REVIEW"
  | "TOP30_VISIT"
  | "PRIVATE_WORKOUT"
  | "FA_TAPE_SCAN"
  | "FA_MEDICAL_CHECK"
  | "FA_CHARACTER_CALL"
  | "FA_CONTRACT_RECON"
  | "FA_FULL_DD";

export const ACTION_COST: Record<ScoutAction, number> = {
  FILM_QUICK: 2,
  FILM_DEEP: 5,
  BACKGROUND_CHECK: 4,
  REQUEST_MEDICAL: 4,
  COMBINE_REVIEW: 3,
  TOP30_VISIT: 6,
  PRIVATE_WORKOUT: 5,
  FA_TAPE_SCAN: 2,
  FA_MEDICAL_CHECK: 5,
  FA_CHARACTER_CALL: 4,
  FA_CONTRACT_RECON: 3,
  FA_FULL_DD: 10,
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

export function freshIntel(): PlayerIntel {
  return { clarity: { TALENT: 0, MED: 0, CHAR: 0, FIT: 0 }, meta: {} };
}

export function computeWindowBudget(traits: GMScoutTraits, windowId: ScoutingWindowId, prevCarryover: number): ScoutingBudget {
  const base = windowId === "COMBINE" ? 30 : windowId === "FREE_AGENCY" ? 28 : 22;
  const add = windowId === "COMBINE" ? Math.round(traits.eval_bandwidth * 0.3) : windowId === "FREE_AGENCY" ? Math.round(traits.eval_bandwidth * 0.35) : Math.round(traits.eval_bandwidth * 0.25);
  const carryIn = Math.round(clamp(prevCarryover, 0, 999) * 0.5);
  const total = base + add + carryIn;
  return { windowId, total, spent: 0, remaining: total, carryIn };
}

const weeklyGainCap = 35;
const dimReturns = (current: number) => (current < 30 ? 1 : current < 60 ? 0.75 : current < 80 ? 0.55 : 0.35);
const traitMult = (traits: GMScoutTraits, track: IntelTrack) => {
  const t =
    track === "TALENT"
      ? traits.film_process
      : track === "MED"
        ? traits.intel_network * 0.6 + traits.risk_management * 0.4
        : track === "CHAR"
          ? traits.intel_network
          : traits.analytics_orientation * 0.4 + traits.film_process * 0.6;
  return 0.9 + 0.0035 * t;
};

const baseGains = (action: ScoutAction): Partial<Record<IntelTrack, number>> => {
  switch (action) {
    case "FILM_QUICK": return { TALENT: 10 };
    case "FILM_DEEP": return { TALENT: 22, FIT: 8 };
    case "BACKGROUND_CHECK": return { CHAR: 20 };
    case "REQUEST_MEDICAL": return { MED: 20 };
    case "COMBINE_REVIEW": return { TALENT: 14, FIT: 6 };
    case "TOP30_VISIT": return { CHAR: 30, FIT: 15 };
    case "PRIVATE_WORKOUT": return { FIT: 20, TALENT: 8 };
    case "FA_TAPE_SCAN": return { TALENT: 10, FIT: 4 };
    case "FA_MEDICAL_CHECK": return { MED: 28 };
    case "FA_CHARACTER_CALL": return { CHAR: 25 };
    case "FA_CONTRACT_RECON": return { FIT: 10 };
    case "FA_FULL_DD": return { TALENT: 14, MED: 14, CHAR: 14, FIT: 10 };
  }
};

export function applyScoutAction(detRand: (key: string) => number, budget: ScoutingBudget, intel: PlayerIntel, action: ScoutAction, traits: GMScoutTraits, windowKey: string) {
  const cost = ACTION_COST[action];
  if (budget.remaining < cost) return { ok: false as const, reason: "NOT_ENOUGH_SCP" };
  if (intel.meta.lastWindowId !== windowKey) {
    intel.meta.lastWindowId = windowKey;
    intel.meta.windowGainUsed = 0;
  }
  const used = intel.meta.windowGainUsed ?? 0;
  if (used >= weeklyGainCap) return { ok: false as const, reason: "TARGET_WINDOW_CAP_REACHED" };

  const gains = baseGains(action);
  const gained: Partial<Record<IntelTrack, number>> = {};
  let totalAdd = 0;
  for (const track of Object.keys(gains) as IntelTrack[]) {
    const cur = intel.clarity[track];
    const add = Math.round((gains[track] ?? 0) * dimReturns(cur) * traitMult(traits, track));
    const next = clamp(cur + add, 0, 100);
    const actual = next - cur;
    if (actual > 0) {
      gained[track] = actual;
      totalAdd += actual;
    }
  }

  const remainingCap = weeklyGainCap - used;
  if (totalAdd > remainingCap && totalAdd > 0) {
    const scale = remainingCap / totalAdd;
    totalAdd = 0;
    for (const track of Object.keys(gained) as IntelTrack[]) {
      const cur = intel.clarity[track];
      const scaled = Math.max(0, Math.round((gained[track] ?? 0) * scale));
      const next = clamp(cur + scaled, 0, 100);
      gained[track] = next - cur;
      totalAdd += gained[track] ?? 0;
    }
  }

  for (const track of Object.keys(gained) as IntelTrack[]) intel.clarity[track] = clamp(intel.clarity[track] + (gained[track] ?? 0), 0, 100);
  intel.meta.windowGainUsed = used + totalAdd;

  if (!intel.meta.hiddenTraitRevealed && ["TOP30_VISIT", "BACKGROUND_CHECK", "PRIVATE_WORKOUT"].includes(action)) {
    let p = action === "TOP30_VISIT" ? 0.35 : 0.18;
    p += (traits.intel_network - 50) * 0.003;
    p += (traits.risk_management - 50) * 0.002;
    if (intel.clarity.CHAR > 80) p += 0.05;
    if (intel.clarity.FIT > 70) p += 0.03;
    if (detRand(`reveal:${windowKey}:${action}`) < clamp(p, 0.1, 0.55)) intel.meta.hiddenTraitRevealed = true;
  }

  budget.spent += cost;
  budget.remaining -= cost;
  return { ok: true as const, cost, gained };
}

export function intelLabel(v: number) {
  if (v < 35) return "Unknown";
  if (v < 70) return "Partial";
  return "Verified";
}

export function updateRevealedTiers(detRand: (key: string) => number, intel: PlayerIntel, prospect: Prospect) {
  const hidden = hiddenIntelForProspect(detRand, prospect);
  intel.revealed = intel.revealed ?? {};
  if (intel.clarity.MED >= 35 && !intel.revealed.medicalTier && detRand(`miss:med:${prospect.id}`) > 0.2) intel.revealed.medicalTier = hidden.medicalTier;
  if (intel.clarity.MED >= 70) intel.revealed.medicalTier = hidden.medicalTier;
  if (intel.clarity.CHAR >= 35 && !intel.revealed.characterTier && detRand(`miss:char:${prospect.id}`) > 0.2) intel.revealed.characterTier = hidden.characterTier;
  if (intel.clarity.CHAR >= 70) intel.revealed.characterTier = hidden.characterTier;
}
