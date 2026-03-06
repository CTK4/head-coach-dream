import { REGULAR_SEASON_WEEKS } from "@/engine/schedule";

export const TRADE_DEADLINE_DEFAULT_WEEK = 10;

export type TradeDeadlineError = {
  code: "TRADE_DEADLINE_PASSED";
  deadlineWeek: number;
  currentWeek: number;
};

/**
 * Safe resolver for trade deadline week values loaded from league state.
 * If saves are missing or carrying invalid values, we fall back to the
 * canonical in-season deadline (week 10) so legacy files stay playable while
 * remaining deterministic and conservative.
 */
export function resolveTradeDeadlineWeek(deadlineWeek: number | null | undefined): number {
  const normalized = Number(deadlineWeek);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized >= REGULAR_SEASON_WEEKS) {
    return TRADE_DEADLINE_DEFAULT_WEEK;
  }
  return normalized;
}

export function isTradeAllowed(currentWeek: number, deadlineWeek: number): boolean {
  return Number(currentWeek) <= Number(resolveTradeDeadlineWeek(deadlineWeek));
}

export function getDeadlineStatus(currentWeek: number, deadlineWeek: number): "open" | "approaching" | "passed" {
  const resolvedDeadlineWeek = resolveTradeDeadlineWeek(deadlineWeek);
  if (currentWeek > resolvedDeadlineWeek) return "passed";
  if (resolvedDeadlineWeek - currentWeek <= 2) return "approaching";
  return "open";
}

export type PendingTradeLike = { status: "PENDING" | "CANCELLED" | "ACCEPTED" };

export function cancelPendingTradesAtDeadline<T extends PendingTradeLike>(offers: T[]): { offers: T[]; cancelledOffers: number } {
  const cancelledOffers = offers.filter((o) => o.status === "PENDING").length;
  return {
    offers: offers.map((o) => (o.status === "PENDING" ? ({ ...o, status: "CANCELLED" as const } as T) : o)),
    cancelledOffers,
  };
}
