import { normalizePos } from "@/engine/rosterOverlay";

/** NFL-style position tag group labels for display. */
export const TAG_POSITION_GROUPS: Record<string, string> = {
  QB: "Quarterback",
  WR: "Wide Receiver",
  TE: "Tight End",
  RB: "Running Back",
  OL: "Offensive Lineman",
  DL: "Defensive Lineman",
  EDGE: "Edge Rusher",
  LB: "Linebacker",
  CB: "Cornerback",
  S: "Safety",
  K: "Kicker",
  P: "Punter",
  UNK: "Other",
};

/**
 * Position-based constant table for tag APY estimates (in dollars).
 * Used as a deterministic fallback when no league-wide salary dataset is available.
 * Values represent approximate top-of-market for each position group.
 */
export const TAG_BASE_APY: Record<string, number> = {
  QB: 35_000_000,
  EDGE: 22_000_000,
  WR: 20_000_000,
  CB: 18_500_000,
  OL: 17_000_000,
  DL: 16_500_000,
  TE: 14_000_000,
  S: 13_500_000,
  LB: 12_000_000,
  RB: 10_500_000,
  K: 5_000_000,
  P: 4_000_000,
};

function round50k(v: number): number {
  return Math.round(v / 50_000) * 50_000;
}

/**
 * Deterministic tag cost resolver.
 * Uses marketApy (e.g. from projectedMarketApy) when available; otherwise falls back
 * to the position-based constant table above.
 *
 * Returns the one-year cap hit for each tag variant:
 *   - non:   Franchise (non-exclusive) = max(market × 1.15, 120% of prior salary)
 *   - ex:    Franchise (exclusive)     = max(market × 1.35, 120% of prior salary)
 *   - trans: Transition                = max(market × 1.05, 120% of prior salary)
 */
export function resolveTagCost(
  posRaw: string,
  marketApy: number,
  priorSalary: number,
): { non: number; ex: number; trans: number } {
  const pos = normalizePos(posRaw);
  const base = marketApy > 0 ? marketApy : (TAG_BASE_APY[pos] ?? 10_000_000);
  const min120 = priorSalary > 0 ? round50k(priorSalary * 1.2) : 0;
  return {
    non: Math.max(round50k(base * 1.15), min120),
    ex: Math.max(round50k(base * 1.35), min120),
    trans: Math.max(round50k(base * 1.05), min120),
  };
}

/** Returns the display label for a player's position tag group. */
export function posTagGroup(posRaw: string): string {
  const pos = normalizePos(posRaw);
  return TAG_POSITION_GROUPS[pos] ?? "Other";
}
