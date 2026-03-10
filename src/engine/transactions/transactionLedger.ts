import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import type { TransactionEvent, TransactionLedger } from "./types";

export type TransactionState = TransactionLedger;

export function getTransactionState(state: Pick<GameState, "transactions"> & { transactionLedger?: TransactionState }): TransactionState {
  const cur = state.transactionLedger as any;
  return {
    events: cur?.events ?? [],
    counter: Number(cur?.counter ?? cur?.lastTxId ?? 0),
    migrationComplete: Boolean(cur?.migrationComplete ?? false),
  };
}

export function sortTransactionEvents(events: TransactionEvent[]): TransactionEvent[] {
  return [...events].sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    if (a.weekIndex !== b.weekIndex) return a.weekIndex - b.weekIndex;
    if (a.ts !== b.ts) return a.ts - b.ts;
    return a.txId.localeCompare(b.txId);
  });
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
      kind: "MIGRATION",
      teamId: String(teamId ?? "FREE_AGENT"),
      playerIds: [String(playerId)],
      details: { teamId: String(teamId ?? "FREE_AGENT") },
    });
  }
  for (const [playerId, contract] of Object.entries(state.playerContractOverrides ?? {}) as Array<[string, PlayerContractOverride]>) {
    seq += 1;
    events.push({
      txId: `MIGRATE_CONTRACT_${seq}`,
      season,
      weekIndex,
      ts: season * 10_000 + weekIndex * 100 + seq,
      kind: "MIGRATION",
      teamId: String(state.playerTeamOverrides?.[playerId] ?? "FREE_AGENT"),
      playerIds: [String(playerId)],
      details: { contract },
    });
  }
  return sortTransactionEvents(events);
}
