import { assignTeamRosterNumbers } from "@/engine/jerseyNumbers/assignTeamRoster";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
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
  const validation = validatePostTx(withJerseys);
  if (validation.ok) return withJerseys;
  if ("errors" in validation) {
    const errs = validation.errors;
    if (import.meta.env.DEV) throw new Error(`tx_validation_failed:${errs.join("|")}`);
    return { ...state, uiToast: `Transaction blocked: ${errs[0] ?? "invalid state"}` };
  }
  return withJerseys;
}
