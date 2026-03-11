import type { GameState } from "@/context/GameContext";
import { getContractById, getPlayerContract, getPlayers } from "@/data/leagueDb";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { findSmallestEligibleCapRelease, isMinorCapOverage, markRecoverableCapFailure, partitionValidationErrors } from "@/engine/transactions/capRecovery";
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
  let candidate = applyTransaction(state, tx);
  let validation = validatePostTx(candidate);
  if (validation.ok) return candidate;
  const issues = "errors" in validation ? validation.errors : [];
  const txPlayerIds = new Set((draft.playerIds ?? []).map((id) => String(id)));
  const extractPid = (issue: string): string | null => {
    const match = issue.match(/\b(PLY_\d+)\b/);
    return match ? match[1] : null;
  };
  const isPreExistingDebt = (issue: string): boolean => {
    if (!(issue.startsWith("invalid contract span") || issue.startsWith("negative yearsRemaining"))) {
      return false;
    }
    const pid = extractPid(issue);
    return pid != null && !txPlayerIds.has(pid);
  };
  const partition = partitionValidationErrors(issues);
  const blockingIntegrityIssues = partition.integrityErrors
    .filter((issue) => !isPreExistingDebt(issue));
  if (blockingIntegrityIssues.length > 0) {
    if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${blockingIntegrityIssues.join("|")}`);
    return { ...state, uiToast: `Transaction blocked: ${blockingIntegrityIssues[0] ?? "invalid state"}` };
  }

  const minorOverages = partition.capOverages.filter(isMinorCapOverage);
  if (minorOverages.length === partition.capOverages.length && minorOverages.length > 0) {
    for (const issue of minorOverages.sort((a, b) => a.teamId.localeCompare(b.teamId))) {
      const releaseCandidate = findSmallestEligibleCapRelease(candidate, issue.teamId);
      if (!releaseCandidate) continue;
      const remediationTx: TransactionEvent = {
        ...Tx.release(issue.teamId, releaseCandidate.playerId, "AUTO_CAP_REMEDIATION"),
        txId: buildTxId(candidate),
        season: Number(candidate.season ?? 1),
        weekIndex: Number(candidate.week ?? 0),
        ts: Number(candidate.season ?? 1) * 10_000 + Number(candidate.week ?? 0) * 100 + Number(candidate.transactionLedger?.counter ?? 0) + 1,
      };
      candidate = applyTransaction(candidate, remediationTx);
    }
    validation = validatePostTx(candidate);
    if (validation.ok) return candidate;
    const rerunIssues = "errors" in validation ? validation.errors : [];
    const rerunPartition = partitionValidationErrors(rerunIssues);
    const rerunBlockingIntegrityIssues = rerunPartition.integrityErrors
      .filter((issue) => !isPreExistingDebt(issue));
    if (rerunBlockingIntegrityIssues.length > 0) {
      if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${rerunBlockingIntegrityIssues.join("|")}`);
      return { ...state, uiToast: `Transaction blocked: ${rerunBlockingIntegrityIssues[0] ?? "invalid state"}` };
    }
    return markRecoverableCapFailure(candidate, rerunPartition.capOverages);
  }

  if (partition.capOverages.length > 0) return markRecoverableCapFailure(candidate, partition.capOverages);
  return candidate;
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
