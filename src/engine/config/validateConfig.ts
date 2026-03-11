import type { CalibrationPack, ConfigRegistry } from "@/engine/config/configRegistry";

export type ConfigValidationIssueCode = "INVALID_CONFIG_VERSION" | "MISSING_PACK" | "INVALID_PACK" | "PIN_MISMATCH";

export type ConfigValidationResult =
  | { ok: true }
  | { ok: false; code: ConfigValidationIssueCode; message: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validatePack(pack: CalibrationPack | null): ConfigValidationResult {
  if (!pack) {
    return { ok: false, code: "MISSING_PACK", message: "Calibration pack is missing from config registry." };
  }

  if (!pack.id || !pack.configVersion || !pack.generatedAt) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack metadata is incomplete." };
  }

  const tunables = pack.tunables;
  if (!tunables || !isFiniteNumber(tunables.fatigueRecoveryRate) || !isFiniteNumber(tunables.injuryDurationMultiplier) || !isFiniteNumber(tunables.contractDemandMultiplier)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack tunables are missing or invalid." };
  }

  return { ok: true };
}

export function validateConfigRegistry(registry: ConfigRegistry): ConfigValidationResult {
  if (!registry.configVersion || typeof registry.configVersion !== "string") {
    return { ok: false, code: "INVALID_CONFIG_VERSION", message: "Config version is missing." };
  }

  const packResult = validatePack(registry.calibrationPack);
  if (!packResult.ok) return packResult;

  if (registry.calibrationPackId !== registry.calibrationPack.id) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack id does not match loaded pack." };
  }

  if (registry.configVersion !== registry.calibrationPack.configVersion) {
    return { ok: false, code: "INVALID_CONFIG_VERSION", message: "Config version does not match calibration pack version." };
  }

  return { ok: true };
}

export function validateConfigPins(
  registry: ConfigRegistry,
  pin: { configVersion?: unknown; calibrationPackId?: unknown } | null | undefined,
): ConfigValidationResult {
  const base = validateConfigRegistry(registry);
  if (!base.ok) return base;

  if (!pin) return { ok: true };

  if (pin.configVersion != null && String(pin.configVersion) !== registry.configVersion) {
    return {
      ok: false,
      code: "PIN_MISMATCH",
      message: `Save configVersion '${String(pin.configVersion)}' does not match active config '${registry.configVersion}'.`,
    };
  }

  if (pin.calibrationPackId != null && String(pin.calibrationPackId) !== registry.calibrationPackId) {
    return {
      ok: false,
      code: "PIN_MISMATCH",
      message: `Save calibrationPackId '${String(pin.calibrationPackId)}' does not match active pack '${registry.calibrationPackId}'.`,
    };
  }

  return { ok: true };
}
