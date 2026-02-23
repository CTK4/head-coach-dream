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
