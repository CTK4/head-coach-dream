import type { Prospect } from "@/engine/offseasonData";
import type { GmScoutTraits } from "@/engine/gmScouting";

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Deterministic hash for noise generation
function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Minimum sigma reduction multiplier regardless of film_process */
const MIN_SIGMA_MULTIPLIER = 0.3;
/** Reduction rate per film_process point (0..100) */
const FILM_PROCESS_REDUCTION_RATE = 0.005;

function deterministicNoise(seed: number, prospectId: string, filmProcess: number, sigma: number): number {
  const key = `TIER_NOISE|${seed}|${prospectId}`;
  const h = fnv1a32(key);
  // Box-Muller using deterministic hash values
  const u1 = Math.max(1e-9, ((h & 0xffffff) / 0x1000000));
  const u2 = Math.max(1e-9, (((h >>> 8) & 0xffffff) / 0x1000000));
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  // filmProcess (0..100) reduces noise: high film_process = tighter scouting
  const effectiveSigma = sigma * Math.max(MIN_SIGMA_MULTIPLIER, 1 - filmProcess * FILM_PROCESS_REDUCTION_RATE);
  return z * effectiveSigma;
}

export function computeEffectiveGrade(
  p: Prospect,
  gmTraits: Pick<GmScoutTraits, "film_process">,
  seed: number,
): number {
  const base = p.scoutedGrade ?? p.grade;
  const sigma = p.sigma ?? 5;
  const noise = deterministicNoise(seed, p.id, gmTraits.film_process, sigma);
  return clamp(Math.round(base + noise), 0, 100);
}

export type TieredProspect = Prospect & {
  tier: number;
  tierConfidence: number;
  effectiveGrade: number;
};

// Dynamic tier gap thresholds by position in sorted order (elite top, mid, late)
function gapThreshold(rank: number, total: number): number {
  const pct = rank / Math.max(total, 1);
  if (pct < 0.1) return 4;   // elite tier break needs bigger gap
  if (pct < 0.4) return 3;   // mid-round break
  return 2;                   // late-round break
}

export function clusterIntoTiers(
  prospects: Prospect[],
  gmTraits: Pick<GmScoutTraits, "film_process">,
  seed: number,
): TieredProspect[] {
  const MAX_TIERS = 5;

  const withGrades = prospects.map((p) => ({
    ...p,
    effectiveGrade: computeEffectiveGrade(p, gmTraits, seed),
    tier: 1,
    tierConfidence: 100 - ((p.sigma ?? 5) * 10),
  }));

  // Sort descending by effectiveGrade
  withGrades.sort((a, b) => b.effectiveGrade - a.effectiveGrade);

  // Detect tier breaks
  let currentTier = 1;
  for (let i = 1; i < withGrades.length; i++) {
    const gap = withGrades[i - 1].effectiveGrade - withGrades[i].effectiveGrade;
    const threshold = gapThreshold(i, withGrades.length);
    if (gap >= threshold && currentTier < MAX_TIERS) {
      currentTier++;
    }
    withGrades[i].tier = currentTier;
    withGrades[i].tierConfidence = clamp(
      100 - ((withGrades[i].sigma ?? 5) * 10),
      0,
      100,
    );
  }

  return withGrades;
}
