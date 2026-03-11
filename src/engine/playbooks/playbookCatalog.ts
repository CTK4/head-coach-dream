import type { PlayType } from "@/engine/gameSim";
import type { DefenseSchemeId, OffenseSchemeId } from "@/lib/schemeLabels";

const RUN_CORE: PlayType[] = ["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER"];
const PASS_CORE: PlayType[] = ["QUICK_GAME", "DROPBACK", "PLAY_ACTION", "SCREEN", "RPO_READ"];
const SPECIAL_CORE: PlayType[] = ["PUNT", "FG", "SPIKE", "KNEEL"];

export type PlayConceptType = "RUN" | "PASS" | "SPECIAL";
export type PlayFormation = "UNDER_CENTER" | "SHOTGUN" | "PISTOL" | "HEAVY" | "SPECIAL_TEAMS";
export type SituationalTag =
  | "EARLY_DOWN"
  | "SHORT_YARDAGE"
  | "LONG_YARDAGE"
  | "RED_ZONE"
  | "HURRY_UP"
  | "FOURTH_DOWN"
  | "GOAL_TO_GO"
  | "TWO_MINUTE"
  | "BACKED_UP"
  | "NORMAL";

export type OffensePlayConcept = {
  playType: PlayType;
  formation: PlayFormation;
  situationalTags: SituationalTag[];
  conceptType: PlayConceptType;
};

export type PlaycallSnapshot = {
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballOn: number;
  quarter: number;
  clockSec: number;
};

const OFFENSE_PLAYBOOK_PLAYS: Record<OffenseSchemeId, PlayType[]> = {
  AIR_RAID: ["QUICK_GAME", "DROPBACK", "SCREEN", "INSIDE_ZONE", "SPIKE", "PUNT", "FG", "KNEEL"],
  SHANAHAN_WIDE_ZONE: ["OUTSIDE_ZONE", "PLAY_ACTION", "QUICK_GAME", "SCREEN", "PUNT", "FG", "SPIKE", "KNEEL"],
  VERTICAL_PASSING: ["DROPBACK", "PLAY_ACTION", "QUICK_GAME", "POWER", "PUNT", "FG", "SPIKE", "KNEEL"],
  PRO_STYLE_BALANCED: [...RUN_CORE, ...PASS_CORE, ...SPECIAL_CORE],
  POWER_GAP: ["POWER", "INSIDE_ZONE", "PLAY_ACTION", "QUICK_GAME", "PUNT", "FG", "SPIKE", "KNEEL"],
  ERHARDT_PERKINS: [...RUN_CORE, ...PASS_CORE, ...SPECIAL_CORE],
  RUN_AND_SHOOT: ["QUICK_GAME", "DROPBACK", "SCREEN", "OUTSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  SPREAD_RPO: ["RPO_READ", "QUICK_GAME", "SCREEN", "OUTSIDE_ZONE", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  WEST_COAST: ["QUICK_GAME", "PLAY_ACTION", "SCREEN", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  AIR_CORYELL: ["DROPBACK", "PLAY_ACTION", "QUICK_GAME", "OUTSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  MODERN_TRIPLE_OPTION: ["RPO_READ", "INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "PLAY_ACTION", "PUNT", "FG", "SPIKE", "KNEEL"],
  CHIP_KELLY_RPO: ["RPO_READ", "QUICK_GAME", "SCREEN", "OUTSIDE_ZONE", "POWER", "PUNT", "FG", "SPIKE", "KNEEL"],
  TWO_TE_POWER_I: ["POWER", "INSIDE_ZONE", "PLAY_ACTION", "DROPBACK", "PUNT", "FG", "SPIKE", "KNEEL"],
  MOTION_BASED_MISDIRECTION: ["OUTSIDE_ZONE", "SCREEN", "QUICK_GAME", "PLAY_ACTION", "PUNT", "FG", "SPIKE", "KNEEL"],
  POWER_SPREAD: ["RPO_READ", "POWER", "QUICK_GAME", "SCREEN", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
};

const OFFENSE_PLAYBOOK_CONCEPT_OVERRIDES: Partial<Record<OffenseSchemeId, Partial<Record<PlayType, Partial<OffensePlayConcept>>>>> = {
  AIR_RAID: {
    QUICK_GAME: { formation: "SHOTGUN", situationalTags: ["EARLY_DOWN", "LONG_YARDAGE", "HURRY_UP", "TWO_MINUTE"] },
    DROPBACK: { formation: "SHOTGUN", situationalTags: ["LONG_YARDAGE", "TWO_MINUTE"] },
  },
  TWO_TE_POWER_I: {
    POWER: { formation: "HEAVY", situationalTags: ["SHORT_YARDAGE", "GOAL_TO_GO", "RED_ZONE", "FOURTH_DOWN"] },
    PLAY_ACTION: { formation: "HEAVY", situationalTags: ["RED_ZONE", "SHORT_YARDAGE"] },
  },
  SPREAD_RPO: {
    RPO_READ: { formation: "SHOTGUN", situationalTags: ["EARLY_DOWN", "SHORT_YARDAGE", "HURRY_UP", "RED_ZONE"] },
  },
};

const DEFENSE_PLAYBOOK_REACTIONS: Record<DefenseSchemeId, string[]> = {
  THREE_FOUR_TWO_GAP: ["Base"],
  FOUR_TWO_FIVE: ["Nickel"],
  SEATTLE_COVER_3: ["Base", "Nickel"],
  COVER_SIX: ["Nickel", "Dime"],
  FANGIO_TWO_HIGH: ["Nickel", "Dime"],
  TAMPA_2: ["Base", "Nickel"],
  MULTIPLE_HYBRID: ["Base", "Nickel", "Dime"],
  CHAOS_FRONT: ["Nickel", "GoalLine"],
  PHILLIPS_BASE_THREE_FOUR: ["Base"],
  LEBEAU_ZONE_BLITZ_THREE_FOUR: ["Base", "Nickel"],
  BEARS_FOUR_SIX: ["GoalLine", "Base"],
  FOUR_THREE_OVER: ["Base"],
  SINGLE_HIGH_COVER_3: ["Base", "Nickel"],
  SABAN_COVER_4_MATCH: ["Nickel", "Dime"],
  RYAN_NICKEL_PRESSURE: ["Nickel", "Dime"],
};

export function getOffensePlaybookPlays(playbookId: OffenseSchemeId): PlayType[] {
  return OFFENSE_PLAYBOOK_PLAYS[playbookId] ?? [...RUN_CORE, ...PASS_CORE, ...SPECIAL_CORE];
}

function deriveConceptType(playType: PlayType): PlayConceptType {
  if (playType === "PUNT" || playType === "FG" || playType === "SPIKE" || playType === "KNEEL") return "SPECIAL";
  if (playType === "QUICK_GAME" || playType === "DROPBACK" || playType === "PLAY_ACTION" || playType === "SCREEN") return "PASS";
  return "RUN";
}

function deriveConceptFromPlayType(playType: PlayType): OffensePlayConcept {
  switch (playType) {
    case "POWER":
      return { playType, conceptType: "RUN", formation: "UNDER_CENTER", situationalTags: ["SHORT_YARDAGE", "GOAL_TO_GO", "FOURTH_DOWN"] };
    case "INSIDE_ZONE":
      return { playType, conceptType: "RUN", formation: "SHOTGUN", situationalTags: ["EARLY_DOWN", "NORMAL", "RED_ZONE"] };
    case "OUTSIDE_ZONE":
      return { playType, conceptType: "RUN", formation: "PISTOL", situationalTags: ["EARLY_DOWN", "NORMAL"] };
    case "RPO_READ":
      return { playType, conceptType: "RUN", formation: "SHOTGUN", situationalTags: ["EARLY_DOWN", "SHORT_YARDAGE", "HURRY_UP"] };
    case "QUICK_GAME":
      return { playType, conceptType: "PASS", formation: "SHOTGUN", situationalTags: ["EARLY_DOWN", "LONG_YARDAGE", "HURRY_UP", "TWO_MINUTE"] };
    case "DROPBACK":
      return { playType, conceptType: "PASS", formation: "UNDER_CENTER", situationalTags: ["LONG_YARDAGE", "TWO_MINUTE"] };
    case "PLAY_ACTION":
      return { playType, conceptType: "PASS", formation: "UNDER_CENTER", situationalTags: ["EARLY_DOWN", "SHORT_YARDAGE", "RED_ZONE"] };
    case "SCREEN":
      return { playType, conceptType: "PASS", formation: "SHOTGUN", situationalTags: ["LONG_YARDAGE", "HURRY_UP"] };
    case "PUNT":
      return { playType, conceptType: "SPECIAL", formation: "SPECIAL_TEAMS", situationalTags: ["FOURTH_DOWN", "BACKED_UP"] };
    case "FG":
      return { playType, conceptType: "SPECIAL", formation: "SPECIAL_TEAMS", situationalTags: ["FOURTH_DOWN", "RED_ZONE"] };
    case "SPIKE":
      return { playType, conceptType: "SPECIAL", formation: "SHOTGUN", situationalTags: ["HURRY_UP", "TWO_MINUTE"] };
    case "KNEEL":
      return { playType, conceptType: "SPECIAL", formation: "UNDER_CENTER", situationalTags: ["HURRY_UP", "TWO_MINUTE"] };
    default:
      return { playType, conceptType: deriveConceptType(playType), formation: "UNDER_CENTER", situationalTags: ["NORMAL"] };
  }
}

export function getOffensePlaybookConcepts(playbookId: OffenseSchemeId): OffensePlayConcept[] {
  const plays = getOffensePlaybookPlays(playbookId);
  const overrides = OFFENSE_PLAYBOOK_CONCEPT_OVERRIDES[playbookId] ?? {};
  return plays.map((playType) => {
    const fallback = deriveConceptFromPlayType(playType);
    const override = overrides[playType] ?? {};
    return {
      ...fallback,
      ...override,
      playType,
      conceptType: override.conceptType ?? fallback.conceptType,
      situationalTags: override.situationalTags ?? fallback.situationalTags,
      formation: override.formation ?? fallback.formation,
    };
  });
}

function matchesSituationTag(snapshot: PlaycallSnapshot, tag: SituationalTag): boolean {
  const inTwoMinute = (snapshot.quarter === 2 || snapshot.quarter === 4) && snapshot.clockSec <= 120;
  if (tag === "NORMAL") return true;
  if (tag === "EARLY_DOWN") return snapshot.down <= 2;
  if (tag === "SHORT_YARDAGE") return snapshot.distance <= 2;
  if (tag === "LONG_YARDAGE") return snapshot.distance >= 8;
  if (tag === "RED_ZONE") return snapshot.ballOn >= 80;
  if (tag === "HURRY_UP") return inTwoMinute;
  if (tag === "FOURTH_DOWN") return snapshot.down === 4;
  if (tag === "GOAL_TO_GO") return snapshot.ballOn >= 96 || (snapshot.ballOn + snapshot.distance >= 100);
  if (tag === "TWO_MINUTE") return inTwoMinute;
  if (tag === "BACKED_UP") return snapshot.ballOn <= 20;
  return false;
}

function isAlwaysLegal(playType: PlayType, snapshot: PlaycallSnapshot): boolean {
  if (playType === "PUNT") return snapshot.down === 4;
  if (playType === "FG") return snapshot.down === 4 && snapshot.ballOn >= 55;
  if (playType === "SPIKE") return snapshot.clockSec > 0 && snapshot.clockSec <= 45;
  if (playType === "KNEEL") return snapshot.down < 4 && snapshot.quarter === 4 && snapshot.clockSec <= 120;
  return true;
}

export function filterEligiblePlayConcepts(
  concepts: OffensePlayConcept[],
  snapshot: PlaycallSnapshot,
  selectedFormation: PlayFormation,
): OffensePlayConcept[] {
  return concepts.filter((concept) => {
    if (concept.formation !== selectedFormation) return false;
    if (!isAlwaysLegal(concept.playType, snapshot)) return false;
    return concept.situationalTags.some((tag) => matchesSituationTag(snapshot, tag));
  });
}

export function hasDefensePlaybook(playbookId: DefenseSchemeId): boolean {
  return Array.isArray(DEFENSE_PLAYBOOK_REACTIONS[playbookId]);
}
