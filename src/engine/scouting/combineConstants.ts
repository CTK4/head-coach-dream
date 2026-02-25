export const COMBINE_DAY_COUNT = 4;
export const COMBINE_DEFAULT_INTERVIEW_TOKENS = 10;
export const COMBINE_FOCUS_HOURS_COST = 4;

export const COMBINE_DAY_POSITION_BUCKETS = {
  1: { categoryKey: "SPECIALISTS_FRONT7", positions: ["K", "P", "EDGE", "DT", "LB"] },
  2: { categoryKey: "SECONDARY_TE", positions: ["S", "TE", "CB"] },
  3: { categoryKey: "SKILL_QB", positions: ["RB", "QB", "WR"] },
  4: { categoryKey: "OFFENSIVE_LINE", positions: ["OT", "OG", "C"] },
} as const;

export const COMBINE_FEED_MAX_PER_DAY = 48;

export const COMBINE_OUTCOME_LABELS = {
  STANDOUT: "standout",
  SOLID: "solid",
  AVERAGE: "average",
  POOR: "poor",
  INJURY: "injury concern",
  BUZZ_CORRECTION: "buzz correction",
} as const;

export const COMBINE_FEED_TEMPLATES = {
  STANDOUT: [
    "{name} ({pos}) lit up testing: elite burst and movement profile showed all day.",
    "{name} ({pos}) posted top-tier numbers and looked explosive in position drills.",
  ],
  SOLID: [
    "{name} ({pos}) turned in a strong all-around workout with very few misses.",
    "{name} ({pos}) delivered a steady, above-average combine session that helped the profile.",
  ],
  AVERAGE: [
    "{name} ({pos}) tested in line with expectations — no major movement in stock.",
    "{name} ({pos}) had a middle-of-the-pack showing with mostly neutral takeaways.",
  ],
  POOR: [
    "{name} ({pos}) struggled in key testing segments and left evaluators wanting more.",
    "{name} ({pos}) posted below-par marks and looked tight in change-of-direction work.",
  ],
  INJURY: [
    "{name} ({pos}) raised durability questions after a limited workout and medical chatter.",
    "{name} ({pos}) did not complete a full workload; medical flags are being revisited.",
  ],
  BUZZ_CORRECTION: [
    "{name} ({pos}) corrected earlier buzz with a cleaner on-field performance than expected.",
    "{name} ({pos}) calmed rumors after a composed workout that matched tape better than gossip.",
  ],
} as const;

export const COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY = {
  IQ: "Football IQ",
  LEADERSHIP: "Leadership",
  STRESS: "Composure",
  CULTURAL: "Culture Fit",
} as const;
