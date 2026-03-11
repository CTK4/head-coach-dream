import type { CalibrationTunables } from "@/engine/config/configRegistry";

export type DifficultyPresetId = "ROOKIE" | "STANDARD" | "CHALLENGING";
export type RealismPresetId = "ARCADE" | "BALANCED" | "SIM";

export type SimTuningSettings = {
  difficultyPreset: DifficultyPresetId;
  realismPreset: RealismPresetId;
};

type TunableMultipliers = Record<keyof CalibrationTunables, number>;

type SimPresetDefinition<TId extends string> = {
  id: TId;
  label: string;
  description: string;
  multipliers: TunableMultipliers;
};

const IDENTITY_MULTIPLIERS: TunableMultipliers = {
  fatigueRecoveryRate: 1,
  injuryDurationMultiplier: 1,
  contractDemandMultiplier: 1,
};

export const DEFAULT_SIM_TUNING: SimTuningSettings = {
  difficultyPreset: "STANDARD",
  realismPreset: "BALANCED",
};

export const DIFFICULTY_PRESETS: Record<DifficultyPresetId, SimPresetDefinition<DifficultyPresetId>> = {
  ROOKIE: {
    id: "ROOKIE",
    label: "Rookie",
    description: "Softer economy pressure and quicker fatigue recovery.",
    multipliers: {
      ...IDENTITY_MULTIPLIERS,
      fatigueRecoveryRate: 1.05,
      contractDemandMultiplier: 0.95,
    },
  },
  STANDARD: {
    id: "STANDARD",
    label: "Standard",
    description: "Default tuning calibrated for baseline balance.",
    multipliers: IDENTITY_MULTIPLIERS,
  },
  CHALLENGING: {
    id: "CHALLENGING",
    label: "Challenging",
    description: "Tighter contract market and slightly harsher recovery profile.",
    multipliers: {
      ...IDENTITY_MULTIPLIERS,
      fatigueRecoveryRate: 0.95,
      contractDemandMultiplier: 1.06,
    },
  },
};

export const REALISM_PRESETS: Record<RealismPresetId, SimPresetDefinition<RealismPresetId>> = {
  ARCADE: {
    id: "ARCADE",
    label: "Arcade",
    description: "Faster recovery with shorter injury windows.",
    multipliers: {
      ...IDENTITY_MULTIPLIERS,
      fatigueRecoveryRate: 1.08,
      injuryDurationMultiplier: 0.92,
    },
  },
  BALANCED: {
    id: "BALANCED",
    label: "Balanced",
    description: "Default realism profile.",
    multipliers: IDENTITY_MULTIPLIERS,
  },
  SIM: {
    id: "SIM",
    label: "Simulation",
    description: "Longer injury timelines with slightly slower recovery.",
    multipliers: {
      ...IDENTITY_MULTIPLIERS,
      fatigueRecoveryRate: 0.94,
      injuryDurationMultiplier: 1.1,
    },
  },
};

export function resolveSimTuning(settings?: Partial<SimTuningSettings> | null): SimTuningSettings {
  const difficultyPreset = settings?.difficultyPreset;
  const realismPreset = settings?.realismPreset;
  return {
    difficultyPreset: difficultyPreset && difficultyPreset in DIFFICULTY_PRESETS ? difficultyPreset : DEFAULT_SIM_TUNING.difficultyPreset,
    realismPreset: realismPreset && realismPreset in REALISM_PRESETS ? realismPreset : DEFAULT_SIM_TUNING.realismPreset,
  };
}

export function applyCalibrationTuning(
  baseTunables: CalibrationTunables,
  settings?: Partial<SimTuningSettings> | null,
): CalibrationTunables {
  const resolved = resolveSimTuning(settings);
  const difficulty = DIFFICULTY_PRESETS[resolved.difficultyPreset];
  const realism = REALISM_PRESETS[resolved.realismPreset];

  return {
    fatigueRecoveryRate: baseTunables.fatigueRecoveryRate * difficulty.multipliers.fatigueRecoveryRate * realism.multipliers.fatigueRecoveryRate,
    injuryDurationMultiplier:
      baseTunables.injuryDurationMultiplier *
      difficulty.multipliers.injuryDurationMultiplier *
      realism.multipliers.injuryDurationMultiplier,
    contractDemandMultiplier:
      baseTunables.contractDemandMultiplier *
      difficulty.multipliers.contractDemandMultiplier *
      realism.multipliers.contractDemandMultiplier,
  };
}
