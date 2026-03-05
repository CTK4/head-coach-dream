import type { GameState } from "@/context/GameContext";
import { getContractById, getPlayerContract, getPlayers } from "@/data/leagueDb";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { Tx } from "@/engine/transactions/transactionAPI";
import type { TransactionEvent } from "@/engine/transactions/types";
import { validatePostTx } from "@/engine/transactions/validatePostTx";

function applyCanonicalTx(state: GameState, draft: Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts">): GameState {
  const tx: TransactionEvent = {
    ...draft,
    txId: buildTxId(state),
    season: Number(state.season ?? 1),
    weekIndex: Number(state.week ?? 0),
    ts: Number(state.season ?? 1) * 10_000 + Number(state.week ?? 0) * 100 + Number(state.transactionLedger?.counter ?? 0) + 1,
  };
  const draftState = applyTransaction(state, tx);
  const validation = validatePostTx(draftState);
  if (validation.ok) return draftState;
  if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${validation.errors.join("|")}`);
  return { ...state, uiToast: `Transaction blocked: ${validation.errors[0] ?? "invalid state"}` };
}

function resolvePlayerContractEndSeason(state: GameState, playerId: string, basePlayer: any): number | null {
  const override = state.playerContractOverrides?.[playerId];
  if (override && Number.isFinite(Number(override.endSeason))) return Number(override.endSeason);

  const contractId = String(basePlayer?.contractId ?? "");
  if (contractId) {
    const contract = getContractById(contractId) as any;
    if (contract && Number.isFinite(Number(contract.endSeason))) return Number(contract.endSeason);
  }

  const legacy = getPlayerContract(playerId) as any;
  if (legacy && Number.isFinite(Number(legacy.endSeason))) return Number(legacy.endSeason);

  return null;
}

export function migrateExpiredContractsToFreeAgency(state: GameState, currentSeason: number): GameState {
  let next = state;
  const expiredPlayerIds = new Set<string>();

  for (const p of getPlayers()) {
    const playerId = String((p as any)?.playerId ?? "");
    if (!playerId) continue;

    const effectiveTeamId = String(next.playerTeamOverrides[playerId] ?? (p as any)?.teamId ?? "");
    const isAlreadyFreeAgent = effectiveTeamId === "FREE_AGENT" || String((p as any)?.status ?? "") === "FREE_AGENT";
    if (isAlreadyFreeAgent) continue;

    const override = next.playerContractOverrides?.[playerId];
    if (override && Number(override.endSeason) > Number(currentSeason)) continue;

    const contractEndSeason = resolvePlayerContractEndSeason(next, playerId, p);
    if (contractEndSeason === null) continue;
    if (Number(contractEndSeason) > Number(currentSeason)) continue;

    next = applyCanonicalTx(next, Tx.release(effectiveTeamId, playerId, "CONTRACT_EXPIRED"));
    expiredPlayerIds.add(playerId);
  }

  if (expiredPlayerIds.size === 0) return next;

  const startersByPos: Record<string, string | undefined> = { ...(next.depthChart?.startersByPos ?? {}) };
  const lockedBySlot: Record<string, true | undefined> = { ...(next.depthChart?.lockedBySlot ?? {}) };
  let depthChanged = false;

  for (const [slot, playerId] of Object.entries(startersByPos)) {
    if (!playerId || !expiredPlayerIds.has(String(playerId))) continue;
    delete startersByPos[slot];
    delete lockedBySlot[slot];
    depthChanged = true;
  }

  if (!depthChanged) return next;

  return {
    ...next,
    depthChart: {
      ...next.depthChart,
      startersByPos,
      lockedBySlot,
    },
  };
}
