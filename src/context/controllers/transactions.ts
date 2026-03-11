import { assignTeamRosterNumbers } from "@/engine/jerseyNumbers/assignTeamRoster";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { findSmallestEligibleCapRelease, isMinorCapOverage, markRecoverableCapFailure, partitionValidationErrors } from "@/engine/transactions/capRecovery";
import { Tx } from "@/engine/transactions/transactionAPI";
import { validatePostTx } from "@/engine/transactions/validatePostTx";
import type { TransactionEvent } from "@/engine/transactions/types";
import type { GameState } from "@/context/GameContext";

export function reconcileJerseyNumbersForTx(state: GameState, tx: TransactionEvent): GameState {
  const affectedTeams = new Set<string>();
  if (tx.teamId) affectedTeams.add(String(tx.teamId));
  if (tx.otherTeamId) affectedTeams.add(String(tx.otherTeamId));

  for (const playerId of tx.playerIds ?? []) {
    const beforeTeam = String(state.playerTeamOverrides?.[playerId] ?? "");
    if (beforeTeam) affectedTeams.add(beforeTeam);
  }

  const nextAttr = { ...(state.playerAttrOverrides ?? {}) };
  for (const teamId of affectedTeams) {
    if (!teamId || teamId === "FREE_AGENT" || teamId === "RETIRED") continue;
    const assigned = assignTeamRosterNumbers({ ...state, playerAttrOverrides: nextAttr }, teamId);
    for (const [playerId, jerseyNumber] of Object.entries(assigned)) {
      nextAttr[playerId] = { ...(nextAttr[playerId] ?? {}), jerseyNumber };
    }
  }

  return nextAttr === state.playerAttrOverrides ? state : { ...state, playerAttrOverrides: nextAttr };
}

export function applyCanonicalTx(state: GameState, draft: Omit<TransactionEvent, "txId" | "season" | "weekIndex" | "ts">): GameState {
  const tx: TransactionEvent = {
    ...draft,
    txId: buildTxId(state),
    season: Number(state.season ?? 1),
    weekIndex: Number(state.week ?? 0),
    ts: Number(state.season ?? 1) * 10_000 + Number(state.week ?? 0) * 100 + Number(state.transactionLedger?.counter ?? 0) + 1,
  };
  const draftState = applyTransaction(state, tx);
  const withJerseys = reconcileJerseyNumbersForTx(draftState, tx);
  let candidate = withJerseys;
  let validation = validatePostTx(candidate);
  if (validation.ok) return candidate;
  if (!("errors" in validation)) return candidate;

  const initialPartition = partitionValidationErrors(validation.errors);
  if (initialPartition.integrityErrors.length > 0) {
    if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${initialPartition.integrityErrors.join("|")}`);
    return { ...state, uiToast: `Transaction blocked: ${initialPartition.integrityErrors[0] ?? "invalid state"}` };
  }

  const minorOverages = initialPartition.capOverages.filter(isMinorCapOverage);
  if (minorOverages.length === initialPartition.capOverages.length && minorOverages.length > 0) {
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
      candidate = reconcileJerseyNumbersForTx(applyTransaction(candidate, remediationTx), remediationTx);
    }
    validation = validatePostTx(candidate);
    if (validation.ok) return candidate;
    if (!("errors" in validation)) return candidate;
    const rerunPartition = partitionValidationErrors(validation.errors);
    if (rerunPartition.integrityErrors.length > 0) {
      if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${rerunPartition.integrityErrors.join("|")}`);
      return { ...state, uiToast: `Transaction blocked: ${rerunPartition.integrityErrors[0] ?? "invalid state"}` };
    }
    return markRecoverableCapFailure(candidate, rerunPartition.capOverages);
  }

  return markRecoverableCapFailure(candidate, initialPartition.capOverages);
}
