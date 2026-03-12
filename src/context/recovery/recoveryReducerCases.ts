import { StateMachine, type OffseasonStepId } from "@/lib/stateMachine";
import { sortTransactionEvents, type TransactionState } from "@/engine/transactions/transactionLedger";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import type { CareerStage, GameAction, GamePhase, GameState } from "@/context/GameContext";

export type RecoveryReducerDeps = {
  buildMigrationEvents: (state: GameState) => TransactionState["events"];
};


function ensureRecoveryInvariants(previous: GameState, candidate: GameState, source: string): GameState {
  const failures: string[] = [];
  if (!Number.isFinite(candidate.season) || candidate.season <= 0) failures.push("season must be positive finite");
  if (!Number.isFinite(candidate.hub?.regularSeasonWeek) || !Number.isFinite(candidate.hub?.preseasonWeek)) failures.push("hub weeks must be finite");
  if (!candidate.offseason || !candidate.freeAgency || !candidate.finances) failures.push("critical slices must exist");

  if (!failures.length) return candidate;
  return {
    ...previous,
    recoveryNeeded: true,
    recoveryErrors: [...(previous.recoveryErrors ?? []), `${source}: invariant failure (${failures.join("; ")})`].slice(-10),
    uiToast: "Recovery mode engaged after invariant failure.",
  };
}

export function reduceRecoveryCases(state: GameState, action: GameAction, deps: RecoveryReducerDeps): GameState | null {
  switch (action.type) {
    case "RECOVERY_RETURN_TO_HUB": {
      return ensureRecoveryInvariants(state, { ...state, recoveryNeeded: false, recoveryErrors: [], phase: "HUB" as GamePhase, careerStage: "OFFSEASON_HUB" as CareerStage }, "RECOVERY_RETURN_TO_HUB");
    }
    case "RECOVERY_REBUILD_INDICES": {
      const sourceTeamOverrides = { ...state.playerTeamOverrides };
      const sourceContractOverrides = { ...state.playerContractOverrides };
      const sourceState = {
        ...state,
        playerTeamOverrides: sourceTeamOverrides,
        playerContractOverrides: sourceContractOverrides,
      };

      const existingLedgerEvents = Array.isArray(state.transactionLedger?.events)
        ? sortTransactionEvents(state.transactionLedger.events)
        : [];
      const rebuiltLedgerEvents = existingLedgerEvents.length > 0
        ? existingLedgerEvents
        : deps.buildMigrationEvents(sourceState);

      const rebuilt = {
        ...state,
        transactionLedger: {
          events: rebuiltLedgerEvents,
          counter: rebuiltLedgerEvents.length,
          migrationComplete: true,
        },
        playerTeamOverrides: {},
        playerContractOverrides: {},
      };

      const sourceRosterIndex = buildRosterIndex(sourceState);
      const sourceContractIndex = buildContractIndex(sourceState);
      const rebuiltRosterIndex = buildRosterIndex(rebuilt);
      const rebuiltContractIndex = buildContractIndex(rebuilt);

      const teamConsistent = Object.entries(sourceRosterIndex.playerToTeam).every(
        ([playerId, teamId]) => String(rebuiltRosterIndex.playerToTeam[String(playerId)] ?? "FREE_AGENT") === String(teamId ?? "FREE_AGENT"),
      );
      const contractConsistent = Object.entries(sourceContractIndex).every(
        ([playerId, contract]) => JSON.stringify(rebuiltContractIndex[String(playerId)] ?? null) === JSON.stringify(contract ?? null),
      );
      const ledgerConsistent = Number(rebuilt.transactionLedger.counter ?? 0) === Number(rebuilt.transactionLedger.events?.length ?? 0);
      const rebuildConsistent = teamConsistent && contractConsistent && ledgerConsistent;

      return ensureRecoveryInvariants(state, {
        ...rebuilt,
        recoveryNeeded: !rebuildConsistent,
        recoveryErrors: rebuildConsistent ? [] : ["Rebuild indices consistency check failed"],
      }, "RECOVERY_REBUILD_INDICES");
    }
    case "RECOVERY_SKIP_STEP": {
      const cfg = { enableTamperingStep: Boolean((state.offseason as { enableTamperingStep?: boolean } | undefined)?.enableTamperingStep) };
      const next = StateMachine.nextOffseasonStepId(state.offseason?.stepId ?? "RESIGNING", cfg);
      const nextStep = next ?? "RESIGNING";
      return ensureRecoveryInvariants(state, {
        ...state,
        recoveryNeeded: false,
        recoveryErrors: [],
        offseason: { ...state.offseason, stepId: nextStep as OffseasonStepId },
      }, "RECOVERY_SKIP_STEP");
    }
    case "RECOVERY_RESTORE_BACKUP": {
      return ensureRecoveryInvariants(state, {
        ...state,
        recoveryNeeded: true,
        recoveryErrors: ["Backup restore must run from the recovery controller."],
      }, "RECOVERY_RESTORE_BACKUP");
    }
    case "RECOVERY_HYDRATE_STATE": {
      return ensureRecoveryInvariants(state, action.payload.state, "RECOVERY_HYDRATE_STATE");
    }
    case "RECOVERY_SET_ERRORS": {
      return ensureRecoveryInvariants(state, {
        ...state,
        recoveryNeeded: true,
        recoveryErrors: action.payload.errors,
      }, "RECOVERY_SET_ERRORS");
    }
    default:
      return null;
  }
}
