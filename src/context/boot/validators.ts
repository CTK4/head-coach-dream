import { validateCriticalSaveState, LATEST_SAVE_SCHEMA_VERSION, type SaveValidationResult } from "@/lib/migrations/saveSchema";
import { validateConfigPins, type ConfigValidationResult } from "@/engine/config/validateConfig";
import type { ConfigRegistry } from "@/engine/config/configRegistry";
import type { GameState } from "@/context/GameContext";

function getConfigValidationMessage(result: ConfigValidationResult): string | null {
  return "message" in result ? result.message : null;
}

function getSaveValidationMessage(result: SaveValidationResult): string | null {
  return "message" in result ? result.message : null;
}

export function applyBootValidators(state: GameState, registry: ConfigRegistry): GameState {
  // Guard: ensure schema migration has been fully applied before using state.
  // schemaVersion is written by migrateSaveSchema (save-manager path). If it is
  // absent or below the current maximum, the schema-migration pass was skipped or
  // incomplete. Flag for recovery rather than running with an under-migrated save.
  const schemaVersion = Number((state as any).schemaVersion ?? -1);
  if (schemaVersion < LATEST_SAVE_SCHEMA_VERSION) {
    return {
      ...state,
      recoveryNeeded: true,
      recoveryErrors: [
        `Save schema version ${schemaVersion} is below the required version ${LATEST_SAVE_SCHEMA_VERSION}. The save may not have been migrated correctly.`,
      ],
    };
  }

  const pinMessage = getConfigValidationMessage(
    validateConfigPins(registry, {
      configVersion: state.configVersion,
      calibrationPackId: state.calibrationPackId,
    }),
  );
  if (pinMessage) {
    return { ...state, recoveryNeeded: true, recoveryErrors: [pinMessage] };
  }

  let out = {
    ...state,
    configVersion: registry.configVersion,
    calibrationPackId: registry.calibrationPackId,
  };

  const criticalMessage = getSaveValidationMessage(validateCriticalSaveState(out));
  if (criticalMessage) {
    out = { ...out, recoveryNeeded: true, recoveryErrors: [criticalMessage] };
  }

  return out;
}
