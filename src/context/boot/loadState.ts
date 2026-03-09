import { migrateDraftClassIdsInSave } from "@/lib/migrations/migrateDraftClassIds";
import { logError } from "@/lib/logger";
import { getActiveSaveId, loadSaveResult, type LoadSaveResult } from "@/lib/saveManager";
import type { LoadedConfig } from "@/engine/config/loadConfig";
import type { TransactionEvent } from "@/engine/transactions/types";
import type { ContractRow, PersonnelOverride } from "@/data/leagueDb";
import { restoreCheckpointOverlay } from "@/context/boot/checkpointRestore";
import { hydrateLoadedState } from "@/context/boot/hydrateState";
import { ensureLeagueGmMap } from "@/context/boot/migrateSave";
import { applyBootValidators } from "@/context/boot/validators";
import type { GameState } from "@/context/GameContext";

type PersistedPersonnelState = GameState & {
  personnelTeamOverrides?: Record<string, PersonnelOverride>;
  staffContractsByPersonId?: Record<string, ContractRow>;
};

type LoadStateDeps = {
  createInitialState: () => GameState;
  applyCapModeQuery: (state: GameState) => GameState;
  loadConfigRegistry: () => LoadedConfig;
  currentSaveVersion: number;
  migrateSave: (state: Partial<GameState>) => Partial<GameState>;
  defaultDeterministicCounters: GameState["deterministicCounters"];
  normalizePriorityList: (list: unknown) => string[];
  defaultLeagueRecords: () => Record<string, unknown>;
  clampFatigue: (fatigue: number) => number;
  fatigueDefault: number;
  migratePracticePlan: (plan: unknown) => GameState["practicePlan"];
  defaultPracticePlan: { neglectWeeks: Record<string, number> };
  buildMigrationEvents: (state: GameState) => TransactionEvent[];
  replayPersonnelOverrides: (teamOverrides: Record<string, PersonnelOverride>, contractsByPersonId: Record<string, ContractRow>) => void;
  getUserTeamId: (state: GameState) => string | null | undefined;
  ensureAccolades: (state: GameState) => GameState;
  bootstrapAccolades: (state: GameState) => GameState;
};

export function loadStateFromStorage(deps: LoadStateDeps): GameState {
  const initial = deps.applyCapModeQuery(deps.createInitialState());
  const loadedConfig = deps.loadConfigRegistry();
  if (loadedConfig.ok === false) {
    return {
      ...initial,
      recoveryNeeded: true,
      recoveryErrors: [loadedConfig.validation.message],
    };
  }

  const activeSaveId = getActiveSaveId();
  if (!activeSaveId) return initial;

  try {
    const loadResult = loadSaveResult(activeSaveId);
    if (!loadResult.ok) {
      const failedLoad = loadResult as Extract<LoadSaveResult, { ok: false }>;
      return {
        ...initial,
        recoveryNeeded: true,
        recoveryErrors: [failedLoad.message],
      };
    }

    const parsed = loadResult.state as Partial<GameState>;
    const migrated = (parsed.saveVersion ?? 0) < deps.currentSaveVersion ? deps.migrateSave(parsed) : parsed;

    let out = hydrateLoadedState(
      initial,
      migrated,
      deps.currentSaveVersion,
      deps.defaultDeterministicCounters,
      {
        normalizePriorityList: deps.normalizePriorityList,
        defaultLeagueRecords: deps.defaultLeagueRecords,
        clampFatigue: deps.clampFatigue,
        FATIGUE_DEFAULT: deps.fatigueDefault,
        migratePracticePlan: deps.migratePracticePlan,
        DEFAULT_PRACTICE_PLAN: deps.defaultPracticePlan,
      },
    );
    if (!out.transactionLedger?.events?.length) {
      const migrationEvents = deps.buildMigrationEvents(out);
      if (migrationEvents.length > 0) {
        out = {
          ...out,
          transactionLedger: {
            events: migrationEvents,
            counter: migrationEvents.length,
            migrationComplete: true,
          },
          playerTeamOverrides: {},
          playerContractOverrides: {},
        };
      }
    }

    const outWithPersonnel = out as PersistedPersonnelState;
    deps.replayPersonnelOverrides(
      outWithPersonnel.personnelTeamOverrides ?? {},
      outWithPersonnel.staffContractsByPersonId ?? {},
    );

    const backfilledUserTeamId = deps.getUserTeamId(out);
    out = backfilledUserTeamId && !out.userTeamId ? { ...out, userTeamId: backfilledUserTeamId } : out;

    out = deps.ensureAccolades(deps.bootstrapAccolades(out));
    out = migrateDraftClassIdsInSave(out) as GameState;
    out = ensureLeagueGmMap(out);
    out = deps.applyCapModeQuery(out);
    out = restoreCheckpointOverlay(out);
    out = applyBootValidators(out, loadedConfig.registry);

    return out;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError("state.load.failure", { saveId: activeSaveId, meta: { message } });
    console.error("[state-load] Failed to restore saved state, entering recovery mode", error);
    return {
      ...initial,
      recoveryNeeded: true,
      recoveryErrors: [message],
    };
  }
}
