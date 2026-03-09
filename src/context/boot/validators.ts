import type { GameState } from "@/context/GameContext";
import type { loadConfigRegistry } from "@/engine/config/loadConfig";
import { validateConfigPins } from "@/engine/config/validateConfig";
import { validateCriticalSaveState } from "@/lib/migrations/saveSchema";

export function applyBootValidations(
  out: GameState,
  loadedConfig: ReturnType<typeof loadConfigRegistry>,
): GameState {
  const pinValidation = validateConfigPins(loadedConfig.registry, {
    configVersion: (out as any).configVersion,
    calibrationPackId: (out as any).calibrationPackId,
  });
  if (!pinValidation.ok) {
    return { ...out, recoveryNeeded: true, recoveryErrors: [pinValidation.message] };
  }

  const pinned: GameState = {
    ...out,
    configVersion: loadedConfig.registry.configVersion,
    calibrationPackId: loadedConfig.registry.calibrationPackId,
  };

  const criticalResult = validateCriticalSaveState(pinned);
  if (!criticalResult.ok) {
    return { ...pinned, recoveryNeeded: true, recoveryErrors: [criticalResult.message] };
  }
  return pinned;
}
