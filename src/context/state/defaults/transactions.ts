import type { GameState } from "@/context/GameContext";

export type InitialTransactionsState = Pick<GameState, "pendingTradeOffers" | "tradeError" | "tradeBlockByPlayerId" | "transactions" | "transactionLedger">;

export function createInitialTransactionsState(): InitialTransactionsState {
  return {
    pendingTradeOffers: [],
    tradeError: undefined,
    tradeBlockByPlayerId: {},
    transactions: [],
    transactionLedger: { events: [], counter: 0, migrationComplete: false },
  };
}
