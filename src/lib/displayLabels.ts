export const OFFER_STRATEGY_LABELS: Record<string, string> = {
  steady_build: "Steady Build",
  "offer.steady_build": "Steady Build",
  win_now: "Win Now",
  "offer.win_now": "Win Now",
  youth_movement: "Youth Movement",
  "offer.youth_movement": "Youth Movement",
  culture_reset: "Culture Reset",
  "offer.culture_reset": "Culture Reset",
};

export const GM_MODE_LABELS: Record<string, string> = {
  REBUILD: "Rebuild",
  RELOAD: "Reload",
  CONTEND: "Contend",
};

export const ARCHETYPE_LABELS: Record<string, string> = {
  oc_promoted: "Offensive Coordinator",
  dc_promoted: "Defensive Coordinator",
  stc_promoted: "Special Teams Coordinator",
  college_hc: "College Head Coach",
  assistant_grinder: "Career Assistant",
  young_guru: "Young Innovator",
};

export const CAREER_STAGE_LABELS: Record<string, string> = {
  PRE_SEASON: "Preseason",
  REGULAR_SEASON: "Regular Season",
  PLAYOFFS: "Playoffs",
  OFFSEASON_HUB: "Offseason",
  SEASON_AWARDS: "Season Review",
  ASSISTANT_HIRING: "Staff Hiring",
  FREE_AGENCY: "Free Agency",
  DRAFT: "Draft",
  TRAINING_CAMP: "Training Camp",
};

export const PLAYOFF_RESULT_LABELS: Record<string, string> = {
  CHAMPION: "Champion",
  RUNNER_UP: "Super Bowl Loss",
  CONF_FINALS: "Conference Finals",
  DIV_ROUND: "Divisional Round",
  WILD_CARD: "Wild Card",
  MISSED: "Missed Playoffs",
};

export const DEV_TRAIT_LABELS: Record<string, string> = {
  normal: "Normal",
  star: "Star",
  superstar: "Superstar",
  elite: "Elite",
};

export const OFFENSE_SCHEME_LABELS = {
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
} as const;

export const DEFENSE_SCHEME_LABELS = {
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
} as const;

export const SCHEME_LABELS = {
  ...OFFENSE_SCHEME_LABELS,
  ...DEFENSE_SCHEME_LABELS,
} as const;

export const POSITION_LABELS: Record<string, string> = {
  ALL: "All",
  NONE: "None",
  QB: "QB",
  RB: "RB",
  WR: "WR",
  TE: "TE",
  OL: "OL",
  OT: "OT",
  IOL: "IOL",
  DL: "DL",
  DT: "DT",
  EDGE: "EDGE",
  LB: "LB",
  CB: "CB",
  DB: "DB",
  S: "S",
  K: "K",
  P: "P",
  ATH: "ATH",
  UNK: "Unknown",
};

export const TRAINING_CAMP_INTENSITY_LABELS: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
};

export const TRAINING_CAMP_INSTALL_FOCUS_LABELS: Record<string, string> = {
  BALANCED: "Balanced",
  OFFENSE: "Offense",
  DEFENSE: "Defense",
};

function getMappedLabel(raw: string, labels: Record<string, string>): string {
  return labels[raw] ?? safeLabel(raw);
}

export function getSchemeLabel(raw: string): string {
  return getMappedLabel(raw, SCHEME_LABELS);
}

export function getPlaybookLabel(raw: string): string {
  return getSchemeLabel(raw);
}

export function getPositionLabel(raw: string): string {
  return getMappedLabel(raw, POSITION_LABELS);
}

export function getTrainingCampIntensityLabel(raw: string): string {
  return getMappedLabel(raw, TRAINING_CAMP_INTENSITY_LABELS);
}

export function getTrainingCampInstallFocusLabel(raw: string): string {
  return getMappedLabel(raw, TRAINING_CAMP_INSTALL_FOCUS_LABELS);
}

export function toDisplayLabel(raw: string): string {
  const stripped = raw.includes(".") ? raw.split(".").pop() ?? raw : raw;
  return stripped
    .replace(/[_-]/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function safeLabel(raw: string): string {
  const isInternalKey = /^[a-z]+\.[a-z_]+$/.test(raw) || /^[A-Z_]{3,}$/.test(raw);
  if (isInternalKey && process.env.NODE_ENV === "development") {
    console.warn(`[displayLabels] Raw internal key rendered in UI: "${raw}". Add to display label registry.`);
  }
  return toDisplayLabel(raw);
}
