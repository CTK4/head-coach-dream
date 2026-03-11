import type { CalibrationPack, ConfigRegistry } from "@/engine/config/configRegistry";

export type ConfigValidationIssueCode = "INVALID_CONFIG_VERSION" | "MISSING_PACK" | "INVALID_PACK" | "PIN_MISMATCH";

export type ConfigValidationResult =
  | { ok: true }
  | { ok: false; code: ConfigValidationIssueCode; message: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
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

  // injury_baselines
  const ib = pack.injury_baselines;
  if (!isObject(ib)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing injury_baselines." };
  }
  if (!isObject(ib.position_rates) || !isObject((ib.position_rates as Record<string, unknown>)["QB"])) {
    return { ok: false, code: "INVALID_PACK", message: "injury_baselines.position_rates must include QB entry." };
  }
  const qbRate = (ib.position_rates as Record<string, unknown>)["QB"] as Record<string, unknown>;
  if (!isFiniteNumber(qbRate["out_rate_weekly"])) {
    return { ok: false, code: "INVALID_PACK", message: "injury_baselines.position_rates.QB.out_rate_weekly is invalid." };
  }
  if (!isNonEmptyArray(ib.season_week_multipliers)) {
    return { ok: false, code: "INVALID_PACK", message: "injury_baselines.season_week_multipliers must be a non-empty array." };
  }

  // reinjury_multipliers
  const rim = pack.reinjury_multipliers;
  if (!isObject(rim)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing reinjury_multipliers." };
  }
  if (!isObject(rim.injury_type_params) || !isObject((rim.injury_type_params as Record<string, unknown>)["hamstring"])) {
    return { ok: false, code: "INVALID_PACK", message: "reinjury_multipliers.injury_type_params must include hamstring entry." };
  }

  // concussion_model
  const cm = pack.concussion_model;
  if (!isObject(cm) || !isObject(cm.recommended_proxy)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing concussion_model.recommended_proxy." };
  }

  // situational_turnovers
  const st = pack.situational_turnovers;
  if (!isObject(st) || !isNonEmptyArray(st.multipliers)) {
    return { ok: false, code: "INVALID_PACK", message: "situational_turnovers.multipliers must be a non-empty array." };
  }

  // coverage_usage
  const cu = pack.coverage_usage;
  if (!isObject(cu) || !isObject(cu.league_baselines)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing coverage_usage.league_baselines." };
  }

  // coaching_hazard_priors
  const chp = pack.coaching_hazard_priors;
  if (!isObject(chp) || !isObject(chp.hazard_model)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing coaching_hazard_priors.hazard_model." };
  }

  // trade_ai_priors
  const tap = pack.trade_ai_priors;
  if (!isObject(tap) || !isNonEmptyArray(tap.future_pick_discount)) {
    return { ok: false, code: "INVALID_PACK", message: "trade_ai_priors.future_pick_discount must be a non-empty array." };
  }

  // contract_market_priors
  const cmp = pack.contract_market_priors;
  if (!isObject(cmp) || !isObject(cmp.cap_history_2011_2024_millions)) {
    return { ok: false, code: "INVALID_PACK", message: "Calibration pack missing contract_market_priors.cap_history_2011_2024_millions." };
  }
  if (!isFiniteNumber((cmp.cap_history_2011_2024_millions as Record<string, unknown>)["2024"])) {
    return { ok: false, code: "INVALID_PACK", message: "contract_market_priors.cap_history_2011_2024_millions must include a finite 2024 value." };
  }

  // future_pick_discount
  const fpd = pack.future_pick_discount;
  if (!isObject(fpd) || !isNonEmptyArray(fpd.curve)) {
    return { ok: false, code: "INVALID_PACK", message: "future_pick_discount.curve must be a non-empty array." };
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
