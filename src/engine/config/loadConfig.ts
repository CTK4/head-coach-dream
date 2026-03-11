import {
  DEFAULT_CALIBRATION_PACK_ID,
  DEFAULT_CONFIG_VERSION,
  getCalibrationPackById,
  getDefaultConfigRegistry,
  type ConfigRegistry,
} from "@/engine/config/configRegistry";
import { applyCalibrationTuning, type SimTuningSettings } from "@/config/simTuning";
import { validateConfigRegistry, type ConfigValidationResult } from "@/engine/config/validateConfig";

export type LoadedConfig =
  | { ok: true; registry: ConfigRegistry }
  | { ok: false; validation: ConfigValidationResult & { ok: false } };



function applySimTuningToRegistry(registry: ConfigRegistry, simTuning?: Partial<SimTuningSettings> | null): ConfigRegistry {
  if (!simTuning) return registry;
  return {
    ...registry,
    calibrationPack: {
      ...registry.calibrationPack,
      tunables: applyCalibrationTuning(registry.calibrationPack.tunables, simTuning),
    },
  };
}

export function loadConfigRegistry(options?: { calibrationPackId?: string; configVersion?: string; simTuning?: Partial<SimTuningSettings> | null }): LoadedConfig {
  const requestedPackId = options?.calibrationPackId ?? DEFAULT_CALIBRATION_PACK_ID;
  const requestedVersion = options?.configVersion ?? DEFAULT_CONFIG_VERSION;

  const calibrationPack = getCalibrationPackById(requestedPackId);
  const registry: ConfigRegistry = calibrationPack
    ? { configVersion: requestedVersion, calibrationPackId: requestedPackId, calibrationPack }
    : getDefaultConfigRegistry();

  const tunedRegistry = applySimTuningToRegistry(registry, options?.simTuning);

  const validation = validateConfigRegistry(tunedRegistry);
  if (!validation.ok) {
    return { ok: false, validation: validation as ConfigValidationResult & { ok: false } };
  }

  return { ok: true, registry: tunedRegistry };
}
