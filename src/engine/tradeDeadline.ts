export const TRADE_DEADLINE_DEFAULT_WEEK = 0;

export type TradeDeadlineError = {
  code: "TRADE_DEADLINE_PASSED";
  deadlineWeek: number;
  currentWeek: number;
};

export function isTradeAllowed(currentWeek: number, deadlineWeek: number): boolean {
  return Number(currentWeek) <= Number(deadlineWeek);
}

export function getDeadlineStatus(currentWeek: number, deadlineWeek: number): "open" | "approaching" | "passed" {
  if (currentWeek > deadlineWeek) return "passed";
  if (deadlineWeek - currentWeek <= 2) return "approaching";
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
