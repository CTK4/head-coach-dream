import type { GameState } from "@/context/GameContext";
import type { loadConfigRegistry } from "@/engine/config/loadConfig";
import type { loadSaveResult } from "@/lib/saveManager";
import { applyBootValidations } from "@/context/boot/validators";
import { restoreCheckpointIfAvailable } from "@/context/boot/checkpointRestore";

export type LoadStateDeps = {
  createInitialState: () => GameState;
  applyCapModeQuery: (state: GameState) => GameState;
  loadConfigRegistry: typeof loadConfigRegistry;
  getActiveSaveId: () => string | null;
  loadSaveResult: typeof loadSaveResult;
  CURRENT_SAVE_VERSION: number;
  migrateSave: (oldState: Partial<GameState>) => Partial<GameState>;
  hydrateState: (initial: GameState, migrated: Partial<GameState>) => GameState;
  postHydrate: (state: GameState) => GameState;
  logError: (event: string, payload: unknown) => void;
};

export function loadStateFromBoot(deps: LoadStateDeps): GameState {
  const initial = deps.applyCapModeQuery(deps.createInitialState());
  const loadedConfig = deps.loadConfigRegistry();
  if (!loadedConfig.ok) {
    return {
      ...initial,
      recoveryNeeded: true,
      recoveryErrors: [loadedConfig.validation.message],
    };
  }

  const activeSaveId = deps.getActiveSaveId();
  if (!activeSaveId) return initial;

  try {
    const loadResult = deps.loadSaveResult(activeSaveId);
    if (!loadResult.ok) {
      return {
        ...initial,
        recoveryNeeded: true,
        recoveryErrors: [loadResult.message],
      };
    }

    const parsed = loadResult.state as Partial<GameState>;
    const migrated = (parsed.saveVersion ?? 0) < deps.CURRENT_SAVE_VERSION ? deps.migrateSave(parsed) : parsed;

    let out = deps.hydrateState(initial, migrated);
    out = deps.postHydrate(out);
    out = deps.applyCapModeQuery(out);
    out = restoreCheckpointIfAvailable(out);
    out = applyBootValidations(out, loadedConfig);
    return out;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    deps.logError("state.load.failure", { saveId: activeSaveId, meta: { message } });
    console.error("[state-load] Failed to restore saved state, entering recovery mode", error);
    return {
      ...initial,
      recoveryNeeded: true,
      recoveryErrors: [message],
    };
  }
}
