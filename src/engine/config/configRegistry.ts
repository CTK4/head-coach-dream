import calibrationPackV1 from "@/data/config/calibrationPack.v1.json";

export type CalibrationTunables = {
  fatigueRecoveryRate: number;
  injuryDurationMultiplier: number;
  contractDemandMultiplier: number;
};

export type CalibrationPack = {
  id: string;
  configVersion: string;
  generatedAt: string;
  tunables: CalibrationTunables;
};

export type ConfigRegistry = {
  configVersion: string;
  calibrationPackId: string;
  calibrationPack: CalibrationPack;
};

export const DEFAULT_CONFIG_VERSION = "1.0.0";
export const DEFAULT_CALIBRATION_PACK_ID = "calibration-pack-v1";

const REGISTRY: Record<string, CalibrationPack> = {
  [DEFAULT_CALIBRATION_PACK_ID]: calibrationPackV1 as CalibrationPack,
};

export function getCalibrationPackById(packId: string): CalibrationPack | null {
  return REGISTRY[packId] ?? null;
}

export function getDefaultConfigRegistry(): ConfigRegistry {
  const calibrationPack = getCalibrationPackById(DEFAULT_CALIBRATION_PACK_ID);
  if (!calibrationPack) {
    throw new Error(`Missing default calibration pack '${DEFAULT_CALIBRATION_PACK_ID}'.`);
  }
  return {
    configVersion: DEFAULT_CONFIG_VERSION,
    calibrationPackId: calibrationPack.id,
    calibrationPack,
  };
}
