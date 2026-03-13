import type { ConceptTemplateId, OffenseEligibleRole, ProtectionAssignments } from "@/engine/assignments/types";

export type OffenseTemplate = {
  family: "run" | "pass" | "play-action" | "screen";
  primaryReadRole: OffenseEligibleRole;
  progressionRoles: OffenseEligibleRole[];
  protectionFamily?: "quick" | "dropback" | "shot" | "play-action" | "screen";
  runProtectionDefaults?: ProtectionAssignments;
  notes?: string;
};

const RUN_PROTECTION: ProtectionAssignments = {
  protectorsCount: 0,
  chipRoles: [],
  baseType: "zone-run",
  slideDirection: "none",
};

const TEMPLATES: Record<ConceptTemplateId, OffenseTemplate> = {
  R1: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB"], runProtectionDefaults: RUN_PROTECTION, notes: "Inside zone" },
  R2: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "wide-zone" }, notes: "Outside zone" },
  R3: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "gap" }, notes: "Power" },
  R4: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "Y"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "gap" }, notes: "Counter" },
  R5: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "H"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "zone-run" }, notes: "Split zone" },
  R6: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "Y"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "draw" }, notes: "Draw" },
  R7: { family: "run", primaryReadRole: "QB", progressionRoles: ["QB", "RB"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "option" }, notes: "Read option" },
  R8: { family: "run", primaryReadRole: "QB", progressionRoles: ["QB", "RB", "H"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "option" }, notes: "Speed option" },
  R9: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "H"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "gap" }, notes: "Duo" },
  R10: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "Y"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "gap" }, notes: "Trap" },
  R11: { family: "run", primaryReadRole: "QB", progressionRoles: ["QB"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "option" }, notes: "QB sneak/keep" },
  R12: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "X"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "wide-zone" }, notes: "Jet/sweep" },
  R13: { family: "run", primaryReadRole: "RB", progressionRoles: ["RB", "Y", "H"], runProtectionDefaults: { ...RUN_PROTECTION, baseType: "boot" }, notes: "Pin-pull" },
  P1: { family: "pass", primaryReadRole: "X", progressionRoles: ["X", "H", "RB"], protectionFamily: "quick" },
  P2: { family: "pass", primaryReadRole: "Z", progressionRoles: ["Z", "Y", "RB"], protectionFamily: "quick" },
  P3: { family: "pass", primaryReadRole: "H", progressionRoles: ["H", "Y", "RB"], protectionFamily: "quick" },
  P4: { family: "pass", primaryReadRole: "Y", progressionRoles: ["Y", "H", "RB"], protectionFamily: "quick" },
  P5: { family: "pass", primaryReadRole: "X", progressionRoles: ["X", "Z", "Y", "RB"], protectionFamily: "dropback" },
  P6: { family: "pass", primaryReadRole: "Z", progressionRoles: ["Z", "X", "RB"], protectionFamily: "dropback" },
  P7: { family: "pass", primaryReadRole: "Y", progressionRoles: ["Y", "X", "H", "RB"], protectionFamily: "dropback" },
  P8: { family: "pass", primaryReadRole: "H", progressionRoles: ["H", "X", "RB"], protectionFamily: "dropback" },
  P9: { family: "pass", primaryReadRole: "X", progressionRoles: ["X", "Z", "RB"], protectionFamily: "shot" },
  P10: { family: "pass", primaryReadRole: "Z", progressionRoles: ["Z", "Y", "RB"], protectionFamily: "shot" },
  P11: { family: "pass", primaryReadRole: "Y", progressionRoles: ["Y", "X", "RB"], protectionFamily: "shot" },
  P12: { family: "pass", primaryReadRole: "X", progressionRoles: ["X", "H", "Y", "RB"], protectionFamily: "dropback" },
  P13: { family: "pass", primaryReadRole: "H", progressionRoles: ["H", "X", "Y", "RB"], protectionFamily: "quick" },
  P14: { family: "pass", primaryReadRole: "Z", progressionRoles: ["Z", "H", "RB"], protectionFamily: "dropback" },
  P15: { family: "pass", primaryReadRole: "RB", progressionRoles: ["RB", "H", "X"], protectionFamily: "quick" },
  P16: { family: "pass", primaryReadRole: "Y", progressionRoles: ["Y", "RB", "H"], protectionFamily: "dropback" },
  PA1: { family: "play-action", primaryReadRole: "Y", progressionRoles: ["Y", "X", "RB"], protectionFamily: "play-action" },
  PA2: { family: "play-action", primaryReadRole: "X", progressionRoles: ["X", "Y", "RB"], protectionFamily: "play-action" },
  PA3: { family: "play-action", primaryReadRole: "Z", progressionRoles: ["Z", "Y", "RB"], protectionFamily: "play-action" },
  PA4: { family: "play-action", primaryReadRole: "H", progressionRoles: ["H", "X", "RB"], protectionFamily: "play-action" },
  PA5: { family: "play-action", primaryReadRole: "RB", progressionRoles: ["RB", "Y", "X"], protectionFamily: "play-action" },
  S1: { family: "screen", primaryReadRole: "RB", progressionRoles: ["RB", "H"], protectionFamily: "screen" },
  S2: { family: "screen", primaryReadRole: "X", progressionRoles: ["X", "RB"], protectionFamily: "screen" },
  S3: { family: "screen", primaryReadRole: "Z", progressionRoles: ["Z", "RB"], protectionFamily: "screen" },
  S4: { family: "screen", primaryReadRole: "H", progressionRoles: ["H", "RB"], protectionFamily: "screen" },
  S5: { family: "screen", primaryReadRole: "Y", progressionRoles: ["Y", "RB"], protectionFamily: "screen" },
  S6: { family: "screen", primaryReadRole: "RB", progressionRoles: ["RB", "X", "Z"], protectionFamily: "screen" },
};

export function getOffenseTemplate(templateId: ConceptTemplateId): OffenseTemplate {
  return TEMPLATES[templateId];
}
