export type ModelCardFactor = {
  name: string;
  weight?: string;
  direction: string;
  details: string;
};

export type ModelCardExample = {
  title: string;
  before: string;
  after: string;
  result: string;
};

export type ModelCardConfig = {
  id: string;
  title: string;
  description: string;
  factors: ModelCardFactor[];
  tiers: string[];
  examples: ModelCardExample[];
};

export const athleticCompositeModelCard: ModelCardConfig = {
  id: "athletic-composite",
  title: "Athletic Composite",
  description:
    "Athletic summary combines drill signals into speed, explosiveness, agility, and power tiers, then assigns an overall label.",
  factors: [
    {
      name: "40-yard dash",
      weight: "36 (composite weight)",
      direction: "Lower is better.",
      details: "Composite uses (5.3 - forty) * 36. Tier cutoffs: ELITE ≤ 4.40, GOOD ≤ 4.58, AVG ≤ 4.78, else POOR.",
    },
    {
      name: "Shuttle",
      weight: "24 (composite weight)",
      direction: "Lower is better.",
      details:
        "Composite uses (5.2 - shuttle) * 24. Agility tier uses shuttle plus three-cone scoring: ELITE/GOOD/AVG/POOR by averaged bucket score.",
    },
    {
      name: "Vertical jump",
      weight: "0.9 (composite weight)",
      direction: "Higher is better.",
      details: "Composite uses vert * 0.9. Tier cutoffs: ELITE ≥ 38, GOOD ≥ 34, AVG ≥ 30, else POOR.",
    },
    {
      name: "Bench reps",
      weight: "0.45 (composite weight)",
      direction: "Higher is better.",
      details: "Composite uses bench * 0.45. Tier cutoffs: ELITE ≥ 30, GOOD ≥ 23, AVG ≥ 16, else POOR.",
    },
    {
      name: "Overall label logic",
      direction: "Rule-based label from tier points.",
      details:
        "Points are ELITE=3, GOOD=2, AVG=1, POOR=0 by area. Total ≤ 3 => LIMITED; speed+explosiveness strong => EXPLOSIVE; speed+agility strong => FLUID; power+explosiveness strong => POWER; otherwise BALANCED.",
    },
  ],
  tiers: ["EXPLOSIVE", "FLUID", "POWER", "BALANCED", "LIMITED"],
  examples: [
    {
      title: "Burst + speed jump",
      before: "40: 4.74, Shuttle: 4.41, Vert: 31, Bench: 17",
      after: "40: 4.46, Shuttle: 4.15, Vert: 37, Bench: 24",
      result: "Speed/agility/explosiveness all move up, often shifting from BALANCED/AVG profile toward EXPLOSIVE or FLUID.",
    },
    {
      title: "Power add without losing movement",
      before: "40: 4.62, Shuttle: 4.27, Vert: 33, Bench: 18",
      after: "40: 4.54, Shuttle: 4.20, Vert: 35, Bench: 29",
      result: "Better 40/shuttle plus higher vert/bench can elevate both power and burst, moving summaries toward POWER or EXPLOSIVE.",
    },
  ],
};
