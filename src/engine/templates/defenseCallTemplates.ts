import type { CoverageFamily, DefenseTemplateId, OffenseEligibleRole, Shell } from "@/engine/assignments/types";

type DefenseTemplate = {
  coverageFamily: CoverageFamily;
  shell: Shell;
  responsibleDefenderByRole: Record<Exclude<OffenseEligibleRole, "QB">, string>;
  rushersCount: number;
  rushMap: "even4" | "odd4" | "five-man" | "sim";
  runFitDefaults: {
    front: string;
    boxCount: number;
    forceDefender: string;
    cutbackDefender?: string;
    primaryFitDefenders: string[];
  };
};

const MAN_MAP = { X: "CB1", Z: "CB2", H: "NB", Y: "SS", RB: "LB1" };
const ZONE_MAP = { X: "CB1", Z: "CB2", H: "NB", Y: "LB2", RB: "LB1" };
const QUARTERS_MAP = { X: "CB1", Z: "CB2", H: "SS", Y: "LB2", RB: "LB1" };

const TEMPLATES: Record<DefenseTemplateId, DefenseTemplate> = {
  D1: { coverageFamily: "Cover1", shell: "MOFC", responsibleDefenderByRole: MAN_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "even", boxCount: 6, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D2: { coverageFamily: "Cover0", shell: "MOFC", responsibleDefenderByRole: MAN_MAP, rushersCount: 5, rushMap: "five-man", runFitDefaults: { front: "odd", boxCount: 7, forceDefender: "CB1", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D3: { coverageFamily: "Cover2", shell: "MOFO", responsibleDefenderByRole: ZONE_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "even", boxCount: 6, forceDefender: "CB1", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D4: { coverageFamily: "Cover2", shell: "MOFO", responsibleDefenderByRole: ZONE_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "tampa", boxCount: 6, forceDefender: "CB2", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D5: { coverageFamily: "Cover3", shell: "MOFC", responsibleDefenderByRole: ZONE_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "over", boxCount: 7, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D6: { coverageFamily: "FireZone", shell: "MOFC", responsibleDefenderByRole: ZONE_MAP, rushersCount: 5, rushMap: "five-man", runFitDefaults: { front: "under", boxCount: 7, forceDefender: "CB2", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D7: { coverageFamily: "Cover4", shell: "MOFO", responsibleDefenderByRole: QUARTERS_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "two-high", boxCount: 6, forceDefender: "CB1", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D8: { coverageFamily: "Cover6", shell: "MOFO", responsibleDefenderByRole: QUARTERS_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "quarters-halves", boxCount: 6, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D9: { coverageFamily: "2Man", shell: "MOFO", responsibleDefenderByRole: MAN_MAP, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "light", boxCount: 6, forceDefender: "CB1", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D10: { coverageFamily: "Drop8", shell: "MOFO", responsibleDefenderByRole: ZONE_MAP, rushersCount: 3, rushMap: "sim", runFitDefaults: { front: "mint", boxCount: 6, forceDefender: "NB", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D11: { coverageFamily: "SimCreeper", shell: "MOFO", responsibleDefenderByRole: ZONE_MAP, rushersCount: 4, rushMap: "sim", runFitDefaults: { front: "mint", boxCount: 6, forceDefender: "NB", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D12: { coverageFamily: "Bracket", shell: "MOFC", responsibleDefenderByRole: { ...MAN_MAP, X: "CB1", Y: "LB2", RB: "LB1", Z: "CB2", H: "NB" }, rushersCount: 4, rushMap: "even4", runFitDefaults: { front: "nickel", boxCount: 6, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2"] } },
  D13: { coverageFamily: "RedMatch", shell: "MOFC", responsibleDefenderByRole: MAN_MAP, rushersCount: 5, rushMap: "five-man", runFitDefaults: { front: "red-zone", boxCount: 7, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D14: { coverageFamily: "GoalLine", shell: "MOFC", responsibleDefenderByRole: { X: "CB1", Z: "CB2", H: "SS", Y: "LB2", RB: "LB1" }, rushersCount: 6, rushMap: "five-man", runFitDefaults: { front: "goal-line", boxCount: 8, forceDefender: "EDGE_L", cutbackDefender: "SS", primaryFitDefenders: ["LB1", "LB2", "EDGE_L", "EDGE_R"] } },
  D15: { coverageFamily: "Cover3", shell: "MOFC", responsibleDefenderByRole: ZONE_MAP, rushersCount: 4, rushMap: "odd4", runFitDefaults: { front: "odd", boxCount: 7, forceDefender: "OLB_R", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS"] } },
  D16: { coverageFamily: "Cover1", shell: "MOFC", responsibleDefenderByRole: MAN_MAP, rushersCount: 5, rushMap: "five-man", runFitDefaults: { front: "bear", boxCount: 8, forceDefender: "SS", cutbackDefender: "FS", primaryFitDefenders: ["LB1", "LB2", "SS", "EDGE_L"] } },
};

export function getDefenseTemplate(templateId: DefenseTemplateId): DefenseTemplate {
  return TEMPLATES[templateId];
}
