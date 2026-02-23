export type PositionGroup = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "CB" | "S" | "K" | "P";

export type AgingPlayer = {
  playerId: string;
  fullName: string;
  pos?: string;
  age: number;
  overall: number;
};

// Age curve reference points for NFL-style sim
// These match approximate real decline windows by position group
export const DECLINE_ONSET: Record<PositionGroup, number> = {
  QB: 35,
  RB: 28,
  WR: 31,
  TE: 31,
  OL: 33,
  DL: 30,
  LB: 30,
  CB: 29,
  S: 30,
  K: 36,
  P: 36,
};

export const PEAK_AGE: Record<PositionGroup, number> = {
  QB: 29,
  RB: 25,
  WR: 27,
  TE: 27,
  OL: 29,
  DL: 27,
  LB: 27,
  CB: 26,
  S: 27,
  K: 30,
  P: 30,
};

function normalizePos(pos: string | undefined): PositionGroup {
  const p = String(pos ?? "").toUpperCase();
  if (p === "HB" || p === "FB") return "RB";
  if (p === "OT" || p === "OG" || p === "C") return "OL";
  if (p === "DE" || p === "EDGE") return "DL";
  if (p === "DT") return "DL";
  if (p === "OLB" || p === "ILB" || p === "MLB") return "LB";
  if (p === "DB") return "CB";
  if (p === "FS" || p === "SS") return "S";
  if (["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P"].includes(p)) return p as PositionGroup;
  return "WR";
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  const u = Math.max(1e-9, rand());
  const v = Math.max(1e-9, rand());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function getSeasonalAgingDelta(player: AgingPlayer): number {
  const pos = normalizePos(player.pos);
  const peak = PEAK_AGE[pos];
  const onset = DECLINE_ONSET[pos];
  const age = Number(player.age ?? 0);
  const rand = mulberry32(hash32(`${player.playerId}|${age}|aging`));
  const noise = gaussian(rand);

  if (age < peak) {
    return noise > 0.5 ? 1 : 0;
  }
  if (age < onset) return 0;

  const yearsPast = age - onset;
  let base = -1;
  if (yearsPast >= 3) base = -2.6;
  else if (yearsPast >= 1) base = -1.5;
  const d = Math.round(base + noise);
  return Math.max(-4, Math.min(-1, d));
}

export function shouldRetire(player: AgingPlayer): boolean {
  const age = Number(player.age ?? 0);
  const ovr = Number(player.overall ?? 0);
  const pos = normalizePos(player.pos);

  if (age >= 40) return true;
  if (age >= 36 && ovr < 70) return true;
  if (age >= 33 && ovr < 65) return true;
  if (age >= 30 && ovr < 60) return true;
  if (pos === "QB" && age >= 38 && ovr < 75) return true;

  if (age >= 34) {
    const p = age >= 37 ? 0.1 : 0.03;
    const rand = mulberry32(hash32(`${player.playerId}|${age}|retire`));
    return rand() < p;
  }
  return false;
}
