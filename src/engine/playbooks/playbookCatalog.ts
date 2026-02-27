import type { PlayType } from "@/engine/gameSim";
import type { DefenseSchemeId, OffenseSchemeId } from "@/lib/schemeLabels";

const RUN_CORE: PlayType[] = ["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER"];
const PASS_CORE: PlayType[] = ["QUICK_GAME", "DROPBACK", "PLAY_ACTION", "SCREEN"];
const SPECIAL_CORE: PlayType[] = ["PUNT", "FG", "SPIKE", "KNEEL"];

const OFFENSE_PLAYBOOK_PLAYS: Record<OffenseSchemeId, PlayType[]> = {
  AIR_RAID: ["QUICK_GAME", "DROPBACK", "SCREEN", "INSIDE_ZONE", "SPIKE", "PUNT", "FG", "KNEEL"],
  SHANAHAN_WIDE_ZONE: ["OUTSIDE_ZONE", "PLAY_ACTION", "QUICK_GAME", "SCREEN", "PUNT", "FG", "SPIKE", "KNEEL"],
  VERTICAL_PASSING: ["DROPBACK", "PLAY_ACTION", "QUICK_GAME", "POWER", "PUNT", "FG", "SPIKE", "KNEEL"],
  PRO_STYLE_BALANCED: [...RUN_CORE, ...PASS_CORE, ...SPECIAL_CORE],
  POWER_GAP: ["POWER", "INSIDE_ZONE", "PLAY_ACTION", "QUICK_GAME", "PUNT", "FG", "SPIKE", "KNEEL"],
  ERHARDT_PERKINS: [...RUN_CORE, ...PASS_CORE, ...SPECIAL_CORE],
  RUN_AND_SHOOT: ["QUICK_GAME", "DROPBACK", "SCREEN", "OUTSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  SPREAD_RPO: ["QUICK_GAME", "SCREEN", "OUTSIDE_ZONE", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  WEST_COAST: ["QUICK_GAME", "PLAY_ACTION", "SCREEN", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  AIR_CORYELL: ["DROPBACK", "PLAY_ACTION", "QUICK_GAME", "OUTSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
  MODERN_TRIPLE_OPTION: ["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "PLAY_ACTION", "PUNT", "FG", "SPIKE", "KNEEL"],
  CHIP_KELLY_RPO: ["QUICK_GAME", "SCREEN", "OUTSIDE_ZONE", "POWER", "PUNT", "FG", "SPIKE", "KNEEL"],
  TWO_TE_POWER_I: ["POWER", "INSIDE_ZONE", "PLAY_ACTION", "DROPBACK", "PUNT", "FG", "SPIKE", "KNEEL"],
  MOTION_BASED_MISDIRECTION: ["OUTSIDE_ZONE", "SCREEN", "QUICK_GAME", "PLAY_ACTION", "PUNT", "FG", "SPIKE", "KNEEL"],
  POWER_SPREAD: ["POWER", "QUICK_GAME", "SCREEN", "INSIDE_ZONE", "PUNT", "FG", "SPIKE", "KNEEL"],
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

export function hasDefensePlaybook(playbookId: DefenseSchemeId): boolean {
  return Array.isArray(DEFENSE_PLAYBOOK_REACTIONS[playbookId]);
}
