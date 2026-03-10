import { hashSeed } from "@/engine/rng";

const SAVE_SEED_MODULUS = 2147483647;

type LegacySeedInput = {
  saveSeed?: unknown;
  season?: unknown;
  week?: unknown;
  saveId?: unknown;
  teamId?: unknown;
  userTeamId?: unknown;
  acceptedOffer?: { teamId?: unknown } | null;
  coach?: { coachId?: unknown } | null;
  league?: {
    week?: unknown;
    tradeDeadlineWeek?: unknown;
  } | null;
  finances?: {
    cap?: unknown;
    carryover?: unknown;
    cash?: unknown;
    deadCapThisYear?: unknown;
  } | null;
  deterministicCounters?: {
    autosaveCounter?: unknown;
    manualSaveCounter?: unknown;
  } | null;
};

function normalizeNumber(value: unknown, fallback = "NA"): number | string {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeString(value: unknown, fallback = "NA"): string {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return fallback;
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function deriveSaveSeedFromState(input: LegacySeedInput): number {
  const existing = Number(input.saveSeed);
  if (Number.isFinite(existing) && existing > 0) return Math.floor(existing) % SAVE_SEED_MODULUS || 1;

  const fingerprint = {
    season: normalizeNumber(input.season, 2026),
    week: normalizeNumber(input.week, 1),
    saveId: normalizeString(input.saveId),
    teamId: normalizeString(input.teamId),
    userTeamId: normalizeString(input.userTeamId),
    acceptedOfferTeamId: normalizeString(input.acceptedOffer?.teamId),
    coachId: normalizeString(input.coach?.coachId),
    leagueWeek: normalizeNumber(input.league?.week),
    tradeDeadlineWeek: normalizeNumber(input.league?.tradeDeadlineWeek),
    cap: normalizeNumber(input.finances?.cap),
    carryover: normalizeNumber(input.finances?.carryover),
    cash: normalizeNumber(input.finances?.cash),
    deadCapThisYear: normalizeNumber(input.finances?.deadCapThisYear),
    autosaveCounter: normalizeNumber(input.deterministicCounters?.autosaveCounter),
    manualSaveCounter: normalizeNumber(input.deterministicCounters?.manualSaveCounter),
  };

  const hashed = hashSeed("save-seed-policy-v1", stableStringify(fingerprint));
  return (hashed % SAVE_SEED_MODULUS) || 1;
}



export function deriveSaveSeedFromIdentity(identity: { saveId: string }): number {
  const saveId = normalizeString(identity.saveId, "missing-save-id");
  const hashed = hashSeed("save-seed-identity-v1", saveId);
  return (hashed % SAVE_SEED_MODULUS) || 1;
}

