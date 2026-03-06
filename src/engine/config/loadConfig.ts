import {
  DEFAULT_CALIBRATION_PACK_ID,
  DEFAULT_CONFIG_VERSION,
  getCalibrationPackById,
  getDefaultConfigRegistry,
  type ConfigRegistry,
} from "@/engine/config/configRegistry";
import { validateConfigRegistry, type ConfigValidationResult } from "@/engine/config/validateConfig";

export type LoadedConfig =
  | { ok: true; registry: ConfigRegistry }
  | { ok: false; validation: ConfigValidationResult & { ok: false } };

export function loadConfigRegistry(options?: { calibrationPackId?: string; configVersion?: string }): LoadedConfig {
  const requestedPackId = options?.calibrationPackId ?? DEFAULT_CALIBRATION_PACK_ID;
  const requestedVersion = options?.configVersion ?? DEFAULT_CONFIG_VERSION;

  const calibrationPack = getCalibrationPackById(requestedPackId);
  const registry: ConfigRegistry = calibrationPack
    ? { configVersion: requestedVersion, calibrationPackId: requestedPackId, calibrationPack }
    : getDefaultConfigRegistry();

  const validation = validateConfigRegistry(registry);
  if (!validation.ok) {
    return { ok: false, validation };
  }

  return { ok: true, registry };
}
