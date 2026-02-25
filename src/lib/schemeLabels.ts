export const OFFENSE_SCHEME_IDS = [
  "AIR_RAID",
  "SHANAHAN_WIDE_ZONE",
  "VERTICAL_PASSING",
  "PRO_STYLE_BALANCED",
  "POWER_GAP",
  "ERHARDT_PERKINS",
  "RUN_AND_SHOOT",
  "SPREAD_RPO",
  "WEST_COAST",
  "AIR_CORYELL",
  "MODERN_TRIPLE_OPTION",
  "CHIP_KELLY_RPO",
  "TWO_TE_POWER_I",
  "MOTION_BASED_MISDIRECTION",
  "POWER_SPREAD",
] as const;

export const DEFENSE_SCHEME_IDS = [
  "THREE_FOUR_TWO_GAP",
  "FOUR_TWO_FIVE",
  "SEATTLE_COVER_3",
  "COVER_SIX",
  "FANGIO_TWO_HIGH",
  "TAMPA_2",
  "MULTIPLE_HYBRID",
  "CHAOS_FRONT",
  "PHILLIPS_BASE_THREE_FOUR",
  "LEBEAU_ZONE_BLITZ_THREE_FOUR",
  "BEARS_FOUR_SIX",
  "FOUR_THREE_OVER",
  "SINGLE_HIGH_COVER_3",
  "SABAN_COVER_4_MATCH",
  "RYAN_NICKEL_PRESSURE",
] as const;

export type OffenseSchemeId = (typeof OFFENSE_SCHEME_IDS)[number];
export type DefenseSchemeId = (typeof DEFENSE_SCHEME_IDS)[number];

export const OFFENSE_SCHEME_LABELS: Record<OffenseSchemeId, string> = {
  AIR_RAID: "Air Raid",
  SHANAHAN_WIDE_ZONE: "Shanahan Wide Zone",
  VERTICAL_PASSING: "Vertical Passing",
  PRO_STYLE_BALANCED: "Pro Style Balanced",
  POWER_GAP: "Power Gap",
  ERHARDT_PERKINS: "Erhardt-Perkins",
  RUN_AND_SHOOT: "Run and Shoot",
  SPREAD_RPO: "Spread RPO",
  WEST_COAST: "West Coast",
  AIR_CORYELL: "Air Coryell",
  MODERN_TRIPLE_OPTION: "Modern Triple Option",
  CHIP_KELLY_RPO: "Chip Kelly RPO",
  TWO_TE_POWER_I: "Two TE Power I",
  MOTION_BASED_MISDIRECTION: "Motion-Based Misdirection",
  POWER_SPREAD: "Power Spread",
};

export const DEFENSE_SCHEME_LABELS: Record<DefenseSchemeId, string> = {
  THREE_FOUR_TWO_GAP: "3-4 Two Gap",
  FOUR_TWO_FIVE: "4-2-5",
  SEATTLE_COVER_3: "Seattle Cover 3",
  COVER_SIX: "Cover 6",
  FANGIO_TWO_HIGH: "Fangio Two High",
  TAMPA_2: "Tampa 2",
  MULTIPLE_HYBRID: "Multiple Hybrid",
  CHAOS_FRONT: "Chaos Front",
  PHILLIPS_BASE_THREE_FOUR: "Phillips Base 3-4",
  LEBEAU_ZONE_BLITZ_THREE_FOUR: "LeBeau Zone Blitz 3-4",
  BEARS_FOUR_SIX: "Bears 4-6",
  FOUR_THREE_OVER: "4-3 Over",
  SINGLE_HIGH_COVER_3: "Single High Cover 3",
  SABAN_COVER_4_MATCH: "Saban Cover 4 Match",
  RYAN_NICKEL_PRESSURE: "Ryan Nickel Pressure",
};

export const DEFAULT_OFFENSE_SCHEME_ID: OffenseSchemeId = "PRO_STYLE_BALANCED";
export const DEFAULT_DEFENSE_SCHEME_ID: DefenseSchemeId = "MULTIPLE_HYBRID";
