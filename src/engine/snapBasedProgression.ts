export type DevTrait = "normal" | "impact" | "elite" | "generational";

export type SnapCounts = { offense: number; defense: number; specialTeams: number };
export type SeasonStats = { gamesPlayed: number; starts: number; performanceScore: number; injuryGamesMissed?: number };
export type DevelopmentProfile = { trait: DevTrait; hiddenDev: boolean; highSnapSeasons: number };

export type ProgressionPlayer = {
  playerId: string;
  fullName: string;
  pos?: string;
  age: number;
  overall: number;
  snapCounts: SnapCounts;
  seasonStats: SeasonStats;
  development: DevelopmentProfile;
};

export const CORE_ATTRIBUTE_KEYS = ["Awareness", "Poise", "Focus", "Football_IQ", "Instincts", "Speed", "Acceleration", "Agility", "Strength", "Stamina"] as const;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function normalizePosGroup(position: string): "QB"|"RB"|"WR"|"OL"|"DL"|"DB"|"OTHER" {
  const p = String(position ?? "").toUpperCase();
  if (p === "QB") return "QB";
  if (["RB", "HB", "FB"].includes(p)) return "RB";
  if (["WR", "TE"].includes(p)) return "WR";
  if (["OT", "OG", "C", "OL"].includes(p)) return "OL";
  if (["DE", "DT", "EDGE", "DL", "LB", "OLB", "ILB", "MLB"].includes(p)) return "DL";
  if (["CB", "S", "FS", "SS", "DB"].includes(p)) return "DB";
  return "OTHER";
}

const PEAK_BANDS: Record<ReturnType<typeof normalizePosGroup>, [number, number]> = {
  QB: [27,34], RB:[23,27], WR:[24,29], OL:[26,32], DL:[25,30], DB:[24,28], OTHER:[25,29],
};

export function getAgeModifier(position: string, age: number): number {
  const [peakStart, peakEnd] = PEAK_BANDS[normalizePosGroup(position)];
  if (age < peakStart) {
    const dist = peakStart - age;
    return clamp(0.08 - dist * 0.01, -0.08, 0.08);
  }
  if (age <= peakEnd) return 0.04;
  const declineYears = age - peakEnd;
  return clamp(0.04 - declineYears * 0.02, -0.08, 0.08);
}

export function getSnapModifier(player: Pick<ProgressionPlayer, "snapCounts">, teamTotalSnaps: number): number {
  const total = Number(player.snapCounts.offense ?? 0) + Number(player.snapCounts.defense ?? 0) + Number(player.snapCounts.specialTeams ?? 0);
  const share = clamp(total / Math.max(1, teamTotalSnaps), 0, 1.25);
  if (share < 0.2) return -0.03;
  if (share < 0.6) return 0.02;
  if (share <= 0.9) return 0.07;
  return -0.05;
}

export function getPerformanceModifier(performanceScore: number): number {
  const perf = clamp(Number(performanceScore ?? 0.5), 0, 1);
  return clamp(-0.04 + perf * 0.1, -0.04, 0.06);
}

export function getDevelopmentMultiplier(trait: DevTrait): number {
  if (trait === "impact") return 1.2;
  if (trait === "elite") return 1.35;
  if (trait === "generational") return 1.5;
  return 1;
}

function peakEndFor(position: string): number { return PEAK_BANDS[normalizePosGroup(position)][1]; }

export function calculateProgressionDelta(player: ProgressionPlayer, teamTotalSnaps: number): { delta: number; revealed: boolean; nextHighSnapSeasons: number; appliedRegression: boolean } {
  const ageMod = getAgeModifier(String(player.pos ?? ""), Number(player.age ?? 22));
  const snapMod = getSnapModifier(player, teamTotalSnaps);
  const perfMod = getPerformanceModifier(player.seasonStats.performanceScore);
  let delta = ageMod + snapMod + perfMod;
  delta *= getDevelopmentMultiplier(player.development.trait);

  const totalSnaps = player.snapCounts.offense + player.snapCounts.defense + player.snapCounts.specialTeams;
  const snapShare = totalSnaps / Math.max(1, teamTotalSnaps);
  const highSnapSeasons = snapShare > 0.6 ? player.development.highSnapSeasons + 1 : 0;
  const reveal = player.development.hiddenDev && (highSnapSeasons >= 2 || player.seasonStats.performanceScore > 0.85);

  const ageReg = Number(player.age) > peakEndFor(String(player.pos ?? "")) + 2;
  const lowSnapReg = snapShare < 0.1;
  const injuryReg = Number(player.seasonStats.injuryGamesMissed ?? 0) > 6;
  let appliedRegression = false;
  if (ageReg || lowSnapReg || injuryReg) {
    delta -= (ageReg ? 0.03 : 0) + (lowSnapReg ? 0.02 : 0) + (injuryReg ? 0.03 : 0);
    appliedRegression = true;
  }

  const ratingDelta = Math.round(clamp(delta * 40, -5, 5));
  return { delta: ratingDelta, revealed: reveal, nextHighSnapSeasons: highSnapSeasons, appliedRegression };
}

export function defaultDevelopmentTrait(playerId: string, seed: number): DevTrait {
  let hash = seed >>> 0;
  const s = `${playerId}|dev`;
  for (let i = 0; i < s.length; i++) hash = Math.imul(hash ^ s.charCodeAt(i), 16777619) >>> 0;
  const r = (hash % 1000) / 1000;
  if (r > 0.985) return "generational";
  if (r > 0.9) return "elite";
  if (r > 0.65) return "impact";
  return "normal";
}
