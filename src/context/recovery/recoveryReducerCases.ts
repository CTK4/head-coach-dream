import { StateMachine, type OffseasonStepId } from "@/lib/stateMachine";
import { sortTransactionEvents, type TransactionState } from "@/engine/transactions/transactionLedger";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import type { CareerStage, GameAction, GamePhase, GameState } from "@/context/GameContext";

export type RecoveryReducerDeps = {
  buildMigrationEvents: (state: GameState) => TransactionState["events"];
};

export function reduceRecoveryCases(state: GameState, action: GameAction, deps: RecoveryReducerDeps): GameState | null {
  switch (action.type) {
    case "RECOVERY_RETURN_TO_HUB": {
      return { ...state, recoveryNeeded: false, recoveryErrors: [], phase: "HUB" as GamePhase, careerStage: "OFFSEASON_HUB" as CareerStage };
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

      return {
        ...rebuilt,
        recoveryNeeded: !rebuildConsistent,
        recoveryErrors: rebuildConsistent ? [] : ["Rebuild indices consistency check failed"],
      };
    }
    case "RECOVERY_SKIP_STEP": {
      const cfg = { enableTamperingStep: (state.offseason as any)?.enableTamperingStep ?? false };
      const next = StateMachine.nextOffseasonStepId(state.offseason?.stepId ?? "RESIGNING", cfg);
      const nextStep = next ?? "RESIGNING";
      return {
        ...state,
        recoveryNeeded: false,
        recoveryErrors: [],
        offseason: { ...state.offseason, stepId: nextStep as OffseasonStepId },
      };
    }
    case "RECOVERY_RESTORE_BACKUP": {
      return {
        ...state,
        recoveryNeeded: true,
        recoveryErrors: ["Backup restore must run from the recovery controller."],
      };
    }
    case "RECOVERY_HYDRATE_STATE": {
      return action.payload.state;
    }
    case "RECOVERY_SET_ERRORS": {
      return {
        ...state,
        recoveryNeeded: true,
        recoveryErrors: action.payload.errors,
      };
    }
    default:
      return null;
  }
}
