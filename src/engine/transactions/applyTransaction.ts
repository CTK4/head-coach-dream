import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import type { TransactionEvent, TransactionLedger } from "./types";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

export function buildTxId(state: Pick<GameState, "season" | "week" | "transactionLedger">): string {
  const c = Number((state.transactionLedger as any)?.counter ?? 0) + 1;
  return `${state.season}-${Number(state.week ?? 0)}-${String(c).padStart(6, "0")}`;
}

function nextLedger(state: GameState, tx: TransactionEvent): TransactionLedger {
  const prev = (state.transactionLedger as any) ?? { events: [], counter: 0 };
  return {
    events: [...(prev.events ?? []), tx],
    counter: Number(prev.counter ?? 0) + 1,
    migrationComplete: Boolean(prev.migrationComplete),
  };
}

export function applyTransaction(state: GameState, tx: TransactionEvent): GameState {
  const teamOverrides = { ...(state.playerTeamOverrides ?? {}) };
  const contractOverrides = { ...(state.playerContractOverrides ?? {}) };

  assert(Array.isArray(tx.playerIds), "tx.playerIds must be array");

  const setContract = (playerId: string, contract: PlayerContractOverride | undefined) => {
    if (!contract) return;
    contractOverrides[playerId] = { ...contract, salaries: [...contract.salaries] };
  };

  switch (tx.kind) {
    case "RESIGN":
    case "SIGN_FA":
    case "FRANCHISE_TAG":
    case "ROOKIE_SIGN":
      for (const p of tx.playerIds) {
        teamOverrides[p] = String(tx.teamId);
        setContract(p, tx.details?.contract);
      }
      break;
    case "CUT":
    case "RELEASE":
      for (const p of tx.playerIds) {
        teamOverrides[p] = "FREE_AGENT";
        delete contractOverrides[p];
      }
      break;
    case "FRANCHISE_TAG_REMOVE":
      for (const p of tx.playerIds) {
        teamOverrides[p] = String(tx.teamId);
        if (tx.details?.contract) setContract(p, tx.details.contract);
        else delete contractOverrides[p];
      }
      break;
    case "TRADE": {
      const toTeamByPlayer = tx.details?.toTeamByPlayer ?? {};
      for (const p of tx.playerIds) teamOverrides[p] = String(toTeamByPlayer[p] ?? tx.otherTeamId ?? tx.teamId);
      break;
    }
    case "DRAFT_PICK":
      for (const p of tx.playerIds) teamOverrides[p] = String(tx.teamId);
      break;
    case "MIGRATION":
      for (const p of tx.playerIds) {
        if (tx.details?.teamId) teamOverrides[p] = String(tx.details.teamId);
        if (tx.details?.contract) setContract(p, tx.details.contract);
      }
      break;
    default:
      break;
  }

  return {
    ...state,
    playerTeamOverrides: teamOverrides,
    playerContractOverrides: contractOverrides,
    transactionLedger: nextLedger(state, tx),
  };
}
