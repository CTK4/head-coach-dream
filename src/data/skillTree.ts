export type PerkRequirement =
  | { type: "PERK"; perkId: string }
  | { type: "TENURE"; minTenureYear: number };

export type PerkNode = {
  id: string;
  label: string;
  description: string;
  cost: number;
  pathId: "COMMANDER" | "ARCHITECT" | "OPERATOR" | "ARCHETYPE";
  tier: number;
  columnOffset?: number;
  archetypeId?: string;
  requires?: PerkRequirement[];
  grants?: string[];
};

const CORE_NODES: PerkNode[] = [
  {
    id: "cmd_presence",
    label: "Sideline Presence",
    description: "Players respond to your command voice. Leadership trust builds faster after tight wins.",
    cost: 1,
    pathId: "COMMANDER",
    tier: 1,
    grants: ["+Leadership trust momentum in one-score wins"],
  },
  {
    id: "cmd_control",
    label: "Clock Command",
    description: "You control game tempo and preserve composure under late pressure.",
    cost: 2,
    pathId: "COMMANDER",
    tier: 2,
    requires: [{ type: "PERK", perkId: "cmd_presence" }],
    grants: ["Reduced late-game volatility"],
  },
  {
    id: "cmd_branch_a",
    label: "Culture Standard",
    description: "Accountability standards increase buy-in across the locker room.",
    cost: 2,
    pathId: "COMMANDER",
    tier: 3,
    columnOffset: -1,
    requires: [{ type: "PERK", perkId: "cmd_control" }],
    grants: ["+Player respect floor"],
  },
  {
    id: "cmd_branch_b",
    label: "Crisis Voice",
    description: "You stabilize the building after rough weeks and media pressure.",
    cost: 2,
    pathId: "COMMANDER",
    tier: 3,
    columnOffset: 1,
    requires: [{ type: "PERK", perkId: "cmd_control" }],
    grants: ["+Owner patience preservation"],
  },
  {
    id: "arc_install",
    label: "Install Precision",
    description: "Weekly install quality improves, translating plan to execution faster.",
    cost: 1,
    pathId: "ARCHITECT",
    tier: 1,
    grants: ["+Install familiarity efficiency"],
  },
  {
    id: "arc_self_scout",
    label: "Self Scout Loop",
    description: "Structured postgame review sharpens your adaptation cycle.",
    cost: 2,
    pathId: "ARCHITECT",
    tier: 2,
    requires: [{ type: "PERK", perkId: "arc_install" }],
    grants: ["Scheme counters become more consistent"],
  },
  {
    id: "arc_choice_run",
    label: "Run Structure",
    description: "Builds a repeatable run identity your roster can execute under stress.",
    cost: 2,
    pathId: "ARCHITECT",
    tier: 3,
    columnOffset: -1,
    requires: [{ type: "PERK", perkId: "arc_self_scout" }],
    grants: ["+Rushing consistency in neutral scripts"],
  },
  {
    id: "arc_choice_pass",
    label: "Passing Sequencing",
    description: "Coordinates route layering and timing-based answers against pressure looks.",
    cost: 2,
    pathId: "ARCHITECT",
    tier: 3,
    columnOffset: 1,
    requires: [{ type: "PERK", perkId: "arc_self_scout" }],
    grants: ["+Explosive pass chance in scripted drives"],
  },
  {
    id: "op_staff_net",
    label: "Staff Network",
    description: "Your internal network speeds hiring and improves staff retention fit.",
    cost: 1,
    pathId: "OPERATOR",
    tier: 1,
    grants: ["Improved assistant acceptance odds"],
  },
  {
    id: "op_media",
    label: "Message Discipline",
    description: "Sharper messaging lowers unnecessary external noise.",
    cost: 2,
    pathId: "OPERATOR",
    tier: 2,
    requires: [{ type: "PERK", perkId: "op_staff_net" }],
    grants: ["Reduced negative media swings"],
  },
  {
    id: "op_choice_owner",
    label: "Owner Alignment",
    description: "Delivers updates in the language ownership values most.",
    cost: 2,
    pathId: "OPERATOR",
    tier: 3,
    columnOffset: -1,
    requires: [{ type: "PERK", perkId: "op_media" }],
    grants: ["+Owner trust stability"],
  },
  {
    id: "op_choice_gm",
    label: "GM Partnership",
    description: "Builds friction-resistant collaboration with football operations.",
    cost: 2,
    pathId: "OPERATOR",
    tier: 3,
    columnOffset: 1,
    requires: [{ type: "PERK", perkId: "op_media" }],
    grants: ["+Coordination with front office"],
  },
];

const ARCHETYPE_BRANCHES: Record<string, PerkNode[]> = {
  oc_promoted: [
    { id: "arch_oc_1", label: "Offensive Sovereignty", description: "Own the offensive identity from script to finish.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "oc_promoted", grants: ["+Offensive credibility gain"] },
    { id: "arch_oc_2", label: "Play Caller Authority", description: "Command-level confidence in high leverage passing downs.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "oc_promoted", requires: [{ type: "PERK", perkId: "arch_oc_1" }], grants: ["+Late-down pass execution"] },
  ],
  dc_promoted: [
    { id: "arch_dc_1", label: "Defensive Sovereignty", description: "Install a defense-first identity across all situational calls.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "dc_promoted", grants: ["+Defensive credibility gain"] },
    { id: "arch_dc_2", label: "Pressure Menu", description: "Expanded pressure sequencing without compromising structure.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "dc_promoted", requires: [{ type: "PERK", perkId: "arch_dc_1" }], grants: ["+Pressure look effectiveness"] },
  ],
  stc_promoted: [
    { id: "arch_st_1", label: "Hidden Yardage", description: "Special teams phases become a weekly edge.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "stc_promoted", grants: ["+Field-position leverage"] },
    { id: "arch_st_2", label: "Situational Edge", description: "Late-game special teams decisions swing close outcomes.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "stc_promoted", requires: [{ type: "PERK", perkId: "arch_st_1" }], grants: ["+Close-game execution"] },
  ],
  college_hc: [
    { id: "arch_col_1", label: "Program Builder", description: "Build unified culture and teach-to-standard systems.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "college_hc", grants: ["+Leadership trust in year 1-2"] },
    { id: "arch_col_2", label: "Recruiting Pipeline", description: "Talent identification instincts carry into roster building.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "college_hc", requires: [{ type: "PERK", perkId: "arch_col_1" }], grants: ["+Prospect confidence read"] },
  ],
  assistant_grinder: [
    { id: "arch_grind_1", label: "Process Mastery", description: "Small operational edges compound every week.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "assistant_grinder", grants: ["+Staff cohesion"] },
    { id: "arch_grind_2", label: "Building Operator", description: "The building runs cleanly under pressure weeks.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "assistant_grinder", requires: [{ type: "PERK", perkId: "arch_grind_1" }], grants: ["-Volatility in adversity"] },
  ],
  young_guru: [
    { id: "arch_guru_1", label: "Innovation Loop", description: "Rapid experiment-feedback cycles create weekly surprises.", cost: 1, pathId: "ARCHETYPE", tier: 1, archetypeId: "young_guru", grants: ["+Innovation perception"] },
    { id: "arch_guru_2", label: "Momentum Playbook", description: "Aggressive sequencing can overwhelm unprepared opponents.", cost: 2, pathId: "ARCHETYPE", tier: 2, archetypeId: "young_guru", requires: [{ type: "PERK", perkId: "arch_guru_1" }], grants: ["+High-variance upside"] },
  ],
};

export const SKILL_TREE_NODES: PerkNode[] = [...CORE_NODES, ...Object.values(ARCHETYPE_BRANCHES).flat()];

export function getSkillTreeNodes(archetypeId: string): PerkNode[] {
  const archetypeNodes = ARCHETYPE_BRANCHES[archetypeId] ?? [];
  return [...CORE_NODES, ...archetypeNodes];
}

export function getPerkNode(nodeId: string): PerkNode | undefined {
  return SKILL_TREE_NODES.find((node) => node.id === nodeId);
}
