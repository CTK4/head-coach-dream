import type { TransactionEvent } from "./types";

export type TxWireItem = {
  id: string;
  headline: string;
  body: string;
  category: "TRANSACTION";
  weekKey: string;
};

export function toTransactionWire(events: TransactionEvent[]): TxWireItem[] {
  return events.map((tx) => ({
    id: tx.txId,
    headline: `${tx.kind}: ${tx.playerIds.length} player${tx.playerIds.length === 1 ? "" : "s"}`,
    body: `Team ${tx.teamId}${tx.otherTeamId ? ` with ${tx.otherTeamId}` : ""}`,
    category: "TRANSACTION",
    weekKey: `${tx.season}-W${tx.weekIndex}`,
  }));
}
