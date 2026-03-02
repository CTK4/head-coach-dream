import type { PlayType } from "@/engine/gameSim";

export type PersonnelPackage = "10" | "11" | "12" | "21" | "22";
export type DefensivePackage = "Base" | "Nickel" | "Dime" | "GoalLine";
export type DistanceBucket = "short" | "medium" | "long";
export type DownKey = 1 | 2 | 3 | 4;

export type PersonnelDefinition = {
  code: PersonnelPackage;
  label: string;
  description: string;
  toneClass: "light" | "balanced" | "heavy";
};

export type DefensiveReaction = { defensivePackage: DefensivePackage; probability: number };
export type MatchupModifier = { runEfficiency: number; passEfficiency: number; pressureRisk: number };

export const NEUTRAL_MATCHUP_MODIFIER: MatchupModifier = { runEfficiency: 1, passEfficiency: 1, pressureRisk: 1 };

export const PERSONNEL_PACKAGE_DEFINITIONS: Record<PersonnelPackage, PersonnelDefinition> = {
  "10": { code: "10", label: "10 — 1 RB, 0 TE, 4 WR", description: "Spread passing personnel", toneClass: "light" },
  "11": { code: "11", label: "11 — 1 RB, 1 TE, 3 WR", description: "Standard spread", toneClass: "balanced" },
  "12": { code: "12", label: "12 — 1 RB, 2 TE, 2 WR", description: "Balanced run/pass with extra edge", toneClass: "heavy" },
  "21": { code: "21", label: "21 — 2 RB, 1 TE, 2 WR", description: "Lead-run and play-action", toneClass: "heavy" },
  "22": { code: "22", label: "22 — 2 RB, 2 TE, 1 WR", description: "Power personnel", toneClass: "heavy" },
};

export const DOWNS: DownKey[] = [1, 2, 3, 4];
export const DISTANCE_BUCKETS: DistanceBucket[] = ["short", "medium", "long"];
export const PERSONNEL_PACKAGES: PersonnelPackage[] = ["10", "11", "12", "21", "22"];
export const DEFENSIVE_PACKAGES: DefensivePackage[] = ["Base", "Nickel", "Dime", "GoalLine"];

export const DEFENSIVE_REACTION_TABLE: Record<DownKey, Record<DistanceBucket, Record<PersonnelPackage, DefensiveReaction[]>>> = {
  1: {
    short: {
      "10": [{ defensivePackage: "Nickel", probability: 75 }, { defensivePackage: "Base", probability: 25 }],
      "11": [{ defensivePackage: "Nickel", probability: 70 }, { defensivePackage: "Base", probability: 30 }],
      "12": [{ defensivePackage: "Base", probability: 65 }, { defensivePackage: "Nickel", probability: 35 }],
      "21": [{ defensivePackage: "Base", probability: 80 }, { defensivePackage: "Nickel", probability: 20 }],
      "22": [{ defensivePackage: "GoalLine", probability: 55 }, { defensivePackage: "Base", probability: 45 }],
    },
    medium: {
      "10": [{ defensivePackage: "Nickel", probability: 80 }, { defensivePackage: "Dime", probability: 20 }],
      "11": [{ defensivePackage: "Nickel", probability: 75 }, { defensivePackage: "Base", probability: 25 }],
      "12": [{ defensivePackage: "Nickel", probability: 60 }, { defensivePackage: "Base", probability: 40 }],
      "21": [{ defensivePackage: "Base", probability: 70 }, { defensivePackage: "Nickel", probability: 30 }],
      "22": [{ defensivePackage: "Base", probability: 65 }, { defensivePackage: "GoalLine", probability: 35 }],
    },
    long: {
      "10": [{ defensivePackage: "Dime", probability: 65 }, { defensivePackage: "Nickel", probability: 35 }],
      "11": [{ defensivePackage: "Dime", probability: 55 }, { defensivePackage: "Nickel", probability: 45 }],
      "12": [{ defensivePackage: "Nickel", probability: 70 }, { defensivePackage: "Dime", probability: 30 }],
      "21": [{ defensivePackage: "Nickel", probability: 65 }, { defensivePackage: "Base", probability: 35 }],
      "22": [{ defensivePackage: "Base", probability: 60 }, { defensivePackage: "Nickel", probability: 40 }],
    },
  },
  2: {
    short: {
      "10": [{ defensivePackage: "Nickel", probability: 70 }, { defensivePackage: "Base", probability: 30 }],
      "11": [{ defensivePackage: "Nickel", probability: 68 }, { defensivePackage: "Base", probability: 32 }],
      "12": [{ defensivePackage: "Base", probability: 62 }, { defensivePackage: "Nickel", probability: 38 }],
      "21": [{ defensivePackage: "Base", probability: 78 }, { defensivePackage: "Nickel", probability: 22 }],
      "22": [{ defensivePackage: "GoalLine", probability: 60 }, { defensivePackage: "Base", probability: 40 }],
    },
    medium: {
      "10": [{ defensivePackage: "Nickel", probability: 78 }, { defensivePackage: "Dime", probability: 22 }],
      "11": [{ defensivePackage: "Nickel", probability: 72 }, { defensivePackage: "Dime", probability: 28 }],
      "12": [{ defensivePackage: "Nickel", probability: 62 }, { defensivePackage: "Base", probability: 38 }],
      "21": [{ defensivePackage: "Base", probability: 68 }, { defensivePackage: "Nickel", probability: 32 }],
      "22": [{ defensivePackage: "Base", probability: 63 }, { defensivePackage: "GoalLine", probability: 37 }],
    },
    long: {
      "10": [{ defensivePackage: "Dime", probability: 70 }, { defensivePackage: "Nickel", probability: 30 }],
      "11": [{ defensivePackage: "Dime", probability: 60 }, { defensivePackage: "Nickel", probability: 40 }],
      "12": [{ defensivePackage: "Nickel", probability: 68 }, { defensivePackage: "Dime", probability: 32 }],
      "21": [{ defensivePackage: "Nickel", probability: 66 }, { defensivePackage: "Dime", probability: 34 }],
      "22": [{ defensivePackage: "Nickel", probability: 58 }, { defensivePackage: "Base", probability: 42 }],
    },
  },
  3: {
    short: {
      "10": [{ defensivePackage: "Nickel", probability: 74 }, { defensivePackage: "Dime", probability: 26 }],
      "11": [{ defensivePackage: "Nickel", probability: 70 }, { defensivePackage: "Base", probability: 30 }],
      "12": [{ defensivePackage: "Base", probability: 58 }, { defensivePackage: "Nickel", probability: 42 }],
      "21": [{ defensivePackage: "Base", probability: 72 }, { defensivePackage: "Nickel", probability: 28 }],
      "22": [{ defensivePackage: "GoalLine", probability: 62 }, { defensivePackage: "Base", probability: 38 }],
    },
    medium: {
      "10": [{ defensivePackage: "Dime", probability: 60 }, { defensivePackage: "Nickel", probability: 40 }],
      "11": [{ defensivePackage: "Nickel", probability: 66 }, { defensivePackage: "Dime", probability: 34 }],
      "12": [{ defensivePackage: "Nickel", probability: 64 }, { defensivePackage: "Base", probability: 36 }],
      "21": [{ defensivePackage: "Nickel", probability: 60 }, { defensivePackage: "Base", probability: 40 }],
      "22": [{ defensivePackage: "Base", probability: 64 }, { defensivePackage: "Nickel", probability: 36 }],
    },
    long: {
      "10": [{ defensivePackage: "Dime", probability: 78 }, { defensivePackage: "Nickel", probability: 22 }],
      "11": [{ defensivePackage: "Dime", probability: 70 }, { defensivePackage: "Nickel", probability: 30 }],
      "12": [{ defensivePackage: "Dime", probability: 52 }, { defensivePackage: "Nickel", probability: 48 }],
      "21": [{ defensivePackage: "Nickel", probability: 62 }, { defensivePackage: "Dime", probability: 38 }],
      "22": [{ defensivePackage: "Nickel", probability: 65 }, { defensivePackage: "Base", probability: 35 }],
    },
  },
  4: {
    short: {
      "10": [{ defensivePackage: "Nickel", probability: 68 }, { defensivePackage: "Dime", probability: 32 }],
      "11": [{ defensivePackage: "Nickel", probability: 65 }, { defensivePackage: "Base", probability: 35 }],
      "12": [{ defensivePackage: "Base", probability: 60 }, { defensivePackage: "GoalLine", probability: 40 }],
      "21": [{ defensivePackage: "Base", probability: 72 }, { defensivePackage: "GoalLine", probability: 28 }],
      "22": [{ defensivePackage: "GoalLine", probability: 70 }, { defensivePackage: "Base", probability: 30 }],
    },
    medium: {
      "10": [{ defensivePackage: "Dime", probability: 62 }, { defensivePackage: "Nickel", probability: 38 }],
      "11": [{ defensivePackage: "Nickel", probability: 64 }, { defensivePackage: "Dime", probability: 36 }],
      "12": [{ defensivePackage: "Nickel", probability: 60 }, { defensivePackage: "Base", probability: 40 }],
      "21": [{ defensivePackage: "Base", probability: 66 }, { defensivePackage: "Nickel", probability: 34 }],
      "22": [{ defensivePackage: "Base", probability: 63 }, { defensivePackage: "GoalLine", probability: 37 }],
    },
    long: {
      "10": [{ defensivePackage: "Dime", probability: 80 }, { defensivePackage: "Nickel", probability: 20 }],
      "11": [{ defensivePackage: "Dime", probability: 72 }, { defensivePackage: "Nickel", probability: 28 }],
      "12": [{ defensivePackage: "Dime", probability: 55 }, { defensivePackage: "Nickel", probability: 45 }],
      "21": [{ defensivePackage: "Nickel", probability: 60 }, { defensivePackage: "Dime", probability: 40 }],
      "22": [{ defensivePackage: "Nickel", probability: 62 }, { defensivePackage: "Base", probability: 38 }],
    },
  },
};

export const MATCHUP_MODIFIER_MATRIX: Record<PersonnelPackage, Record<DefensivePackage, MatchupModifier>> = {
  "10": {
    Base: { runEfficiency: 0.95, passEfficiency: 1.2, pressureRisk: 1.1 },
    Nickel: { runEfficiency: 1, passEfficiency: 1, pressureRisk: 1 },
    Dime: { runEfficiency: 1.05, passEfficiency: 0.98, pressureRisk: 0.95 },
    GoalLine: { runEfficiency: 0.85, passEfficiency: 0.9, pressureRisk: 1.2 },
  },
  "11": {
    Base: { runEfficiency: 1, passEfficiency: 1.05, pressureRisk: 1 },
    Nickel: { runEfficiency: 0.98, passEfficiency: 1.02, pressureRisk: 1.02 },
    Dime: { runEfficiency: 1.04, passEfficiency: 0.96, pressureRisk: 0.98 },
    GoalLine: { runEfficiency: 0.9, passEfficiency: 0.92, pressureRisk: 1.15 },
  },
  "12": {
    Base: { runEfficiency: 1.08, passEfficiency: 1, pressureRisk: 1 },
    Nickel: { runEfficiency: 1.15, passEfficiency: 0.95, pressureRisk: 1 },
    Dime: { runEfficiency: 1.18, passEfficiency: 0.92, pressureRisk: 0.98 },
    GoalLine: { runEfficiency: 0.95, passEfficiency: 0.9, pressureRisk: 1.1 },
  },
  "21": {
    Base: { runEfficiency: 1.1, passEfficiency: 0.98, pressureRisk: 1 },
    Nickel: { runEfficiency: 1.06, passEfficiency: 0.96, pressureRisk: 1.05 },
    Dime: { runEfficiency: 1.12, passEfficiency: 0.94, pressureRisk: 1.08 },
    GoalLine: { runEfficiency: 0.97, passEfficiency: 0.9, pressureRisk: 1.1 },
  },
  "22": {
    Base: { runEfficiency: 1.14, passEfficiency: 0.9, pressureRisk: 1.08 },
    Nickel: { runEfficiency: 1.25, passEfficiency: 0.9, pressureRisk: 1.15 },
    Dime: { runEfficiency: 1.2, passEfficiency: 0.88, pressureRisk: 1.18 },
    GoalLine: { runEfficiency: 1.05, passEfficiency: 0.82, pressureRisk: 1.2 },
  },
};

function sumProbability(reactions: DefensiveReaction[]): number {
  return reactions.reduce((s, r) => s + r.probability, 0);
}

function validateTables(): void {
  for (const down of DOWNS) {
    for (const distanceBucket of DISTANCE_BUCKETS) {
      for (const offPersonnel of PERSONNEL_PACKAGES) {
        const reactions = DEFENSIVE_REACTION_TABLE[down]?.[distanceBucket]?.[offPersonnel];
        if (!reactions || reactions.length === 0) {
          throw new Error(`Missing defensive reaction for ${down}-${distanceBucket}-${offPersonnel}`);
        }
        if (sumProbability(reactions) !== 100) {
          throw new Error(`Defensive reaction probabilities must sum to 100 for ${down}-${distanceBucket}-${offPersonnel}`);
        }
      }
    }
  }

  for (const offPersonnel of PERSONNEL_PACKAGES) {
    for (const defPackage of DEFENSIVE_PACKAGES) {
      const modifier = MATCHUP_MODIFIER_MATRIX[offPersonnel]?.[defPackage];
      if (!modifier) {
        throw new Error(`Missing matchup modifier for ${offPersonnel}-${defPackage}`);
      }
    }
  }
}

validateTables();

export function getDistanceBucket(distance: number): DistanceBucket {
  if (distance <= 3) return "short";
  if (distance <= 7) return "medium";
  return "long";
}

function warnFallback(event: string, payload: Record<string, unknown>): void {
  console.warn(JSON.stringify({ level: "warn", event, ...payload }));
}

export function getDefensiveReaction(down: number, distance: number, offPersonnel: PersonnelPackage): DefensiveReaction[] {
  const normalizedDown = (down >= 1 && down <= 4 ? down : 1) as DownKey;
  const bucket = getDistanceBucket(distance);
  const reactions = DEFENSIVE_REACTION_TABLE[normalizedDown]?.[bucket]?.[offPersonnel];
  if (!reactions) {
    warnFallback("personnel.defensive_reaction_fallback", { down, distance, offPersonnel });
    return [{ defensivePackage: "Nickel", probability: 100 }];
  }
  return reactions;
}

export function getMatchupModifier(offPersonnel: PersonnelPackage, defensivePackage: DefensivePackage): MatchupModifier {
  const modifier = MATCHUP_MODIFIER_MATRIX[offPersonnel]?.[defensivePackage];
  if (!modifier) {
    warnFallback("personnel.matchup_modifier_fallback", { offPersonnel, defensivePackage });
    return NEUTRAL_MATCHUP_MODIFIER;
  }
  return modifier;
}

export function selectDefensivePackageFromRoll(reactions: DefensiveReaction[], roll0to1: number): DefensivePackage {
  let cumulative = 0;
  const target = Math.max(0, Math.min(1, roll0to1)) * 100;
  for (const reaction of reactions) {
    cumulative += reaction.probability;
    if (target < cumulative) return reaction.defensivePackage;
  }
  return reactions[reactions.length - 1]?.defensivePackage ?? "Nickel";
}

export function isRunPlay(playType: PlayType): boolean {
  return playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
}
