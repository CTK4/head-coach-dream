import type {
  GMScoutingTraits,
  IntelTrack,
  ProspectScoutProfile,
  ProspectTrueProfile,
  ScoutingWindowId,
} from "./types";

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

export function baseWidthByPos(pos: string) {
  const p = pos.toUpperCase();
  if (p === "QB") return 18;
  if (p === "RB") return 14;
  if (p === "WR") return 14;
  if (p === "TE") return 15;
  if (p === "OL") return 16;
  if (p === "DL") return 16;
  if (p === "EDGE") return 16;
  if (p === "LB") return 15;
  if (p === "CB") return 14;
  if (p === "S") return 14;
  return 15;
}

export function widthToConfidence(width: number) {
  return clamp(Math.round(100 - width * 4), 5, 95);
}

export function initScoutProfile(args: {
  prospectId: string;
  trueOVR: number;
  pos: string;
  seed: (k: string) => number;
  gm: GMScoutingTraits;
  windowKey: string;
}): ProspectScoutProfile {
  const { prospectId, trueOVR, pos, seed, gm, windowKey } = args;

  const sigma = clamp(9 - 0.05 * gm.film_process - 0.03 * gm.analytics_orientation, 2.5, 9);
  const u1 = Math.max(1e-9, seed(`init:ovr:${prospectId}:u1`));
  const u2 = Math.max(1e-9, seed(`init:ovr:${prospectId}:u2`));
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const center = clamp(Math.round(trueOVR + z * sigma), 40, 99);
  const width = clamp(baseWidthByPos(pos), 10, 22);
  const low = clamp(center - Math.floor(width / 2), 40, 99);
  const high = clamp(center + Math.ceil(width / 2), 40, 99);

  return {
    prospectId,
    estCenter: center,
    estWidth: width,
    estLow: low,
    estHigh: high,
    confidence: widthToConfidence(width),
    clarity: { TALENT: 0, MED: 0, CHAR: 0, FIT: 0 },
    revealed: {},
    lastSnapshot: { windowKey, estCenter: center },
    stockArrow: "FLAT",
    notes: {},
  };
}

export function computeBudget(args: { gm: GMScoutingTraits; windowId: ScoutingWindowId; carryIn: number }) {
  const { gm, windowId, carryIn } = args;
  const base = windowId === "COMBINE" ? 60 : windowId === "PRE_DRAFT" ? 22 : windowId === "FREE_AGENCY" ? 28 : 20;
  const add = Math.round(gm.eval_bandwidth * (windowId === "COMBINE" ? 0.3 : windowId === "FREE_AGENCY" ? 0.35 : 0.25));
  const ci = Math.round(Math.max(0, carryIn) * 0.5);
  const total = base + add + ci;
  return { total, carryIn: ci, remaining: total, spent: 0 };
}

function dm(current: number) {
  if (current < 30) return 1;
  if (current < 60) return 0.75;
  if (current < 80) return 0.55;
  return 0.35;
}

export function addClarity(args: {
  profile: ProspectScoutProfile;
  track: IntelTrack;
  points: number;
  gm: GMScoutingTraits;
}) {
  const { profile, track, points, gm } = args;
  const t =
    track === "TALENT" ? gm.film_process :
    track === "FIT" ? gm.film_process * 0.5 + gm.analytics_orientation * 0.5 :
    track === "MED" ? gm.intel_network * 0.6 + gm.risk_management * 0.4 :
    gm.intel_network;

  const mult = 0.9 + 0.0035 * t;
  const cur = profile.clarity[track];
  const add = Math.round(points * dm(cur) * mult);
  profile.clarity[track] = clamp(cur + add, 0, 100);
}

export function tightenBand(args: {
  profile: ProspectScoutProfile;
  gm: GMScoutingTraits;
  seed: (k: string) => number;
  windowKey: string;
  actionKey: string;
  hoursOrPoints: number;
  minWidth: number;
}) {
  const { profile, gm, seed, windowKey, actionKey, hoursOrPoints, minWidth } = args;
  const eff = (0.8 + 0.006 * (gm.film_process - 50)) * (0.9 + 0.004 * (gm.analytics_orientation - 50));
  const raw = Math.max(0, hoursOrPoints) * 0.18 * eff;
  const dr = profile.estWidth > 12 ? 1 : profile.estWidth > 9 ? 0.7 : 0.4;
  const widthDelta = clamp(raw * dr, 0.5, 6);

  const u = seed(`tighten:${windowKey}:${profile.prospectId}:${actionKey}:shift`);
  const centerShift = Math.round((u - 0.5) * 4);

  const newWidth = Math.max(minWidth, profile.estWidth - widthDelta);
  const newCenter = clamp(profile.estCenter + centerShift, 40, 99);

  profile.estWidth = Math.round(newWidth * 10) / 10;
  profile.estCenter = newCenter;
  profile.estLow = clamp(Math.round(newCenter - newWidth / 2), 40, 99);
  profile.estHigh = clamp(Math.round(newCenter + newWidth / 2), 40, 99);
  profile.confidence = widthToConfidence(profile.estWidth);

  const prev = profile.lastSnapshot?.estCenter ?? profile.estCenter;
  const delta = profile.estCenter - prev;
  profile.stockArrow = delta >= 2 ? "UP" : delta <= -2 ? "DOWN" : "FLAT";
  profile.lastSnapshot = { windowKey, estCenter: profile.estCenter };
}

export function revealMedicalIfUnlocked(args: {
  profile: ProspectScoutProfile;
  truth: ProspectTrueProfile;
  gm: GMScoutingTraits;
  seed: (k: string) => number;
  windowKey: string;
}) {
  const { profile, truth, gm, seed, windowKey } = args;
  const c = profile.clarity.MED;
  const miss = clamp(0.3 - 0.0025 * gm.risk_management - 0.002 * (c / 100), 0.03, 0.3);

  if (c >= 70) {
    profile.revealed.medicalTier = truth.trueMedical.tier;
    if (c >= 85) {
      profile.revealed.recurrence01 = truth.trueMedical.recurrence01;
      profile.revealed.degenerative = truth.trueMedical.degenerative;
    }
    return;
  }

  if (c >= 35 && !profile.revealed.medicalTier) {
    const ok = seed(`med:miss:${windowKey}:${profile.prospectId}`) >= miss;
    if (ok) profile.revealed.medicalTier = truth.trueMedical.tier;
  }
}

export function revealCharacterIfUnlocked(args: {
  profile: ProspectScoutProfile;
  truth: ProspectTrueProfile;
  gm: GMScoutingTraits;
  seed: (k: string) => number;
  windowKey: string;
}) {
  const { profile, truth, gm, seed, windowKey } = args;
  const c = profile.clarity.CHAR;
  const miss = clamp(0.3 - 0.0025 * gm.risk_management - 0.002 * (c / 100), 0.03, 0.3);

  if (c >= 70) {
    profile.revealed.characterTier = truth.trueCharacter.tier;
    if (c >= 85) profile.revealed.leadershipTag = truth.trueCharacter.leadershipTag;
    return;
  }

  if (c >= 35 && !profile.revealed.characterTier) {
    const ok = seed(`char:miss:${windowKey}:${profile.prospectId}`) >= miss;
    if (ok) profile.revealed.characterTier = truth.trueCharacter.tier;
  }
}
