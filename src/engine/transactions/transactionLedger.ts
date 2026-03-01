import type { GameState, PlayerContractOverride } from "@/context/GameContext";

export type TxKind =
  | "RESIGN"
  | "FRANCHISE_TAG"
  | "CUT"
  | "RELEASE"
  | "SIGN_FA"
  | "TRADE"
  | "DRAFT_PICK"
  | "ROOKIE_SIGN"
  | "WAIVER_CLAIM"
  | "CONTRACT_EXTEND"
  | "MIGRATION_OVERRIDE";

export type TransactionEvent = {
  txId: string;
  season: number;
  weekIndex: number;
  ts: number;
  kind: TxKind;
  teamId: string;
  otherTeamId?: string;
  playerIds: string[];
  details: Record<string, any>;
};

export type TransactionState = {
  events: TransactionEvent[];
  lastTxId?: number;
};

export function getTransactionState(state: Pick<GameState, "transactions"> & { transactionLedger?: TransactionState }): TransactionState {
  return state.transactionLedger ?? { events: [], lastTxId: 0 };
}

export function sortTransactionEvents(events: TransactionEvent[]): TransactionEvent[] {
  return [...events].sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    if (a.weekIndex !== b.weekIndex) return a.weekIndex - b.weekIndex;
    if (a.ts !== b.ts) return a.ts - b.ts;
    return a.txId.localeCompare(b.txId);
  });
}

export function appendTransactionEvent(state: GameState, draft: Omit<TransactionEvent, "txId" | "ts"> & { ts?: number }): GameState {
  const ledger = getTransactionState(state);
  const nextId = Number(ledger.lastTxId ?? 0) + 1;
  const event: TransactionEvent = {
    ...draft,
    txId: `TX_${String(nextId).padStart(8, "0")}`,
    ts: Number(draft.ts ?? state.season * 10_000 + (state.week ?? 0) * 10 + nextId),
  };
  return {
    ...state,
    transactionLedger: {
      events: sortTransactionEvents([...(ledger.events ?? []), event]),
      lastTxId: nextId,
    },
  };
}

export function buildMigrationEvents(state: GameState): TransactionEvent[] {
  const season = Number(state.season ?? 1);
  const weekIndex = Number(state.week ?? 0);
  const events: TransactionEvent[] = [];
  let seq = 0;
  for (const [playerId, teamId] of Object.entries(state.playerTeamOverrides ?? {})) {
    seq += 1;
    events.push({
      txId: `MIGRATE_TEAM_${seq}`,
      season,
      weekIndex,
      ts: season * 10_000 + weekIndex * 100 + seq,
      kind: "MIGRATION_OVERRIDE",
      teamId: String(teamId ?? "FREE_AGENT"),
      playerIds: [String(playerId)],
      details: { source: "playerTeamOverrides", teamId: String(teamId ?? "FREE_AGENT") },
    });
  }
  for (const [playerId, contract] of Object.entries(state.playerContractOverrides ?? {}) as Array<[string, PlayerContractOverride]>) {
    seq += 1;
    events.push({
      txId: `MIGRATE_CONTRACT_${seq}`,
      season,
      weekIndex,
      ts: season * 10_000 + weekIndex * 100 + seq,
      kind: "MIGRATION_OVERRIDE",
      teamId: String(state.playerTeamOverrides?.[playerId] ?? "FREE_AGENT"),
      playerIds: [String(playerId)],
      details: { source: "playerContractOverrides", contract },
    });
  }
  return sortTransactionEvents(events);
}
