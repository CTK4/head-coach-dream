import calibrationPackV1 from "@/data/config/calibrationPack.v1.json";

export type CalibrationTunables = {
  fatigueRecoveryRate: number;
  injuryDurationMultiplier: number;
  contractDemandMultiplier: number;
};

export type SeasonWeekMultiplier = {
  season_phase: string;
  multiplier: number;
};

export type PositionInjuryRate = {
  out_rate_weekly: number;
  limited_rate_weekly: number;
  season_ending_rate_season: number;
  evidence_flag: string;
};

export type InjuryBaselines = {
  starter_definition: { slots_per_team: Record<string, number> };
  season_week_multipliers: SeasonWeekMultiplier[];
  position_rates: Record<string, PositionInjuryRate>;
};

export type ReinjuryMultiplierEntry = {
  mult_by_days: { "0_14": number; "15_60": number; "61_180": number; "181_plus": number };
  prior_count_multiplier_each_addl: number;
};

export type ReinjuryMultipliers = {
  model_form: string;
  tiers_days: number[];
  injury_type_params: Record<string, ReinjuryMultiplierEntry>;
};

export type ConcussionModel = {
  candidate_models: Record<string, unknown>;
  recommended_proxy: {
    severity_score_S_range: [number, number];
    kinematics_mapping: Record<string, string>;
    base_model: string;
    modifiers: {
      prior_concussions_logodds_scale: number;
      acute_window_days: number;
      acute_window_prob_multiplier: number;
    };
  };
  rtp_time_loss_targets: {
    median_days_missed: number;
    mean_days_missed: number;
    pct_miss_1plus_games: number;
  };
};

export type SituationalTurnoverMultiplier = {
  situation: string;
  play_type: string;
  turnover_mult: number;
  sack_mult: number | null;
};

export type SituationalTurnovers = {
  note: string;
  base_params: { p_to_pass: number; p_to_run: number; p_sack: number };
  multipliers: SituationalTurnoverMultiplier[];
};

export type CoverageStyleModifier = {
  two_high_mult: number;
  disguise_mult: number;
  blitz_mult: number;
  sim_pressure_mult: number;
};

export type CoverageUsage = {
  league_baselines: {
    coverage_by_season_2018_2023: Record<string, Record<string, number>>;
    disguise_rate: Record<string, number>;
    blitz_rate: Record<string, number>;
    multi_year_blitz_percent: Record<string, number>;
  };
  style_modifiers: Record<string, CoverageStyleModifier>;
};

export type CoachingHazardPriors = {
  anchors: {
    avg_current_hc_tenure_years: number;
    fired_within_3_years_last_5_years: number;
    fired_within_2_years_last_5_years: number;
  };
  hazard_model: {
    midseason: { form: string; coefficients: Record<string, number> };
    postseason: { form: string; coefficients: Record<string, number> };
  };
  interim_conversion: {
    base_rate: number;
    evidence_snapshot: Record<string, number>;
    modifiers: Record<string, number>;
  };
  coordinator_churn_priors: Record<string, { oc_departure_prob_year: number; dc_departure_prob_year: number }>;
};

export type FuturePickDiscountEntry = { dy_years: number; factor: number };

export type TradeAiPriors = {
  draft_value_chart: string;
  future_pick_discount: FuturePickDiscountEntry[];
  gm_archetype_thresholds: Record<string, number>;
  need_modifier: Record<string, number>;
  owner_pressure_modifier: Record<string, number>;
  rivalry_modifier: Record<string, number>;
};

export type ContractMarketPriors = {
  cap_history_2011_2024_millions: Record<string, number>;
  franchise_tag_anchors_2024_millions: Record<string, number>;
  top_qb_cap_share_examples: Array<{ apy_millions: number; avg_pct_cap: number }>;
  structure_templates: Record<string, unknown>;
  guarantee_pct_priors: Record<string, unknown>;
};

export type FuturePickDiscount = {
  curve: Array<{ dy_years: number; D: number }>;
  notes: string;
};

export type CalibrationPack = {
  id: string;
  configVersion: string;
  generatedAt: string;
  tunables: CalibrationTunables;
  injury_baselines: InjuryBaselines;
  reinjury_multipliers: ReinjuryMultipliers;
  concussion_model: ConcussionModel;
  situational_turnovers: SituationalTurnovers;
  coverage_usage: CoverageUsage;
  coaching_hazard_priors: CoachingHazardPriors;
  trade_ai_priors: TradeAiPriors;
  contract_market_priors: ContractMarketPriors;
  future_pick_discount: FuturePickDiscount;
};

export type ConfigRegistry = {
  configVersion: string;
  calibrationPackId: string;
  calibrationPack: CalibrationPack;
};

export const DEFAULT_CONFIG_VERSION = "1.0.0";
export const DEFAULT_CALIBRATION_PACK_ID = "calibration-pack-v1";

const REGISTRY: Record<string, CalibrationPack> = {
  [DEFAULT_CALIBRATION_PACK_ID]: calibrationPackV1 as unknown as CalibrationPack,
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
