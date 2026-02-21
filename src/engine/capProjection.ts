import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";

/** Annual league-cap growth rate (historical NFL average ~6.5%). */
export const CAP_GROWTH_RATE = 0.065;

/** Fallback league cap when not yet set in game state. */
export const DEFAULT_BASE_CAP = 250_000_000;

/** Min-roster / practice-squad estimated burden per team per year (placeholder). */
export const MIN_ROSTER_ESTIMATE = 4_000_000;

const round50k = (n: number) => Math.round(n / 50_000) * 50_000;

/**
 * Project the league-wide salary cap for a given target season, using the
 * base cap stored in game state and a constant annual growth rate.
 * Deterministic: depends only on baseCap + growth constant, no RNG.
 */
export function projectLeagueCap(
  baseCap: number,
  targetYear: number,
  baseSeason: number,
): number {
  if (targetYear <= baseSeason) return round50k(baseCap);
  const delta = targetYear - baseSeason;
  return round50k(baseCap * Math.pow(1 + CAP_GROWTH_RATE, delta));
}

export type CapHitRow = {
  playerId: string;
  name: string;
  pos: string;
  capHit: number;
  yearsRemaining: number;
  contractEnd: number;
};

/**
 * Return all players on a team with their projected cap hit for a given year,
 * sorted descending by cap hit.
 */
export function getCapHitsByYear(
  state: GameState,
  teamId: string,
  year: number,
): CapHitRow[] {
  return getEffectivePlayersByTeam(state, teamId)
    .map((p: any) => {
      const s = getContractSummaryForPlayer(state, String(p.playerId));
      const capHit = round50k(Number(s?.capHitBySeason?.[year] ?? 0));
      return {
        playerId: String(p.playerId),
        name: String(p.fullName ?? p.name ?? "Unknown"),
        pos: String(p.pos ?? "UNK"),
        capHit,
        yearsRemaining: Math.max(0, Number(s?.endSeason ?? year) - year + 1),
        contractEnd: Number(s?.endSeason ?? year),
      };
    })
    .filter((r) => r.capHit > 0)
    .sort((a, b) => b.capHit - a.capHit);
}

/**
 * Sum of all on-roster cap commitments for a given year.
 */
export function sumCapCommitments(
  state: GameState,
  teamId: string,
  year: number,
): number {
  return round50k(
    getCapHitsByYear(state, teamId, year).reduce((s, r) => s + r.capHit, 0),
  );
}

/**
 * Dead-money projection for a given year.
 * Uses teamFinances.deadMoneyBySeason for any stored future dead money, and
 * state.finances.deadCapThisYear / deadCapNextYear for the current + next year.
 */
export function sumDeadMoney(
  state: GameState,
  _teamId: string,
  year: number,
): number {
  // Prefer the explicit dead-money ledger stored in teamFinances
  const fromLedger = Number(
    state.teamFinances?.deadMoneyBySeason?.[year] ?? 0,
  );
  if (fromLedger > 0) return round50k(fromLedger);

  // Fall back to the finance snapshot values for current / next year
  if (year === state.season) {
    return round50k(Number(state.finances?.deadCapThisYear ?? 0));
  }
  if (year === state.season + 1) {
    return round50k(Number(state.finances?.deadCapNextYear ?? 0));
  }
  return 0;
}

export type YearProjection = {
  year: number;
  projectedCap: number;
  commitments: number;
  deadMoney: number;
  /** Effective cap space = projectedCap − commitments − deadMoney */
  effectiveSpace: number;
  topHits: CapHitRow[];
};

/**
 * Build a 3-year projection snapshot for the given team.
 *
 * @param includeMinRoster  Add a MIN_ROSTER_ESTIMATE burden to commitments.
 * @param extensions        Manual "expected extension" line-items {capHit per year}.
 */
export function buildCapProjection(
  state: GameState,
  teamId: string,
  opts: {
    includeMinRoster?: boolean;
    extensions?: Array<{ label: string; capHit: number; years: boolean[] }>;
    topHitsLimit?: number;
  } = {},
): YearProjection[] {
  const { includeMinRoster = false, extensions = [], topHitsLimit = 10 } = opts;
  const baseCap = Number(state.finances?.cap ?? DEFAULT_BASE_CAP);
  const baseSeason = Number(state.season ?? 2026);

  return [0, 1, 2].map((delta) => {
    const year = baseSeason + delta;
    const projectedCap = projectLeagueCap(baseCap, year, baseSeason);

    const topHits = getCapHitsByYear(state, teamId, year).slice(0, topHitsLimit);
    const allHits = getCapHitsByYear(state, teamId, year);
    let commitments = round50k(allHits.reduce((s, r) => s + r.capHit, 0));

    if (includeMinRoster) commitments = round50k(commitments + MIN_ROSTER_ESTIMATE);

    // Add manual extension placeholders that apply to this year
    for (const ext of extensions) {
      if (ext.years[delta]) commitments = round50k(commitments + ext.capHit);
    }

    const deadMoney = sumDeadMoney(state, teamId, year);
    const effectiveSpace = round50k(projectedCap - commitments - deadMoney);

    return { year, projectedCap, commitments, deadMoney, effectiveSpace, topHits };
  });
}
