import { validateCriticalSaveState, type SaveValidationResult } from "@/lib/migrations/saveSchema";
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
