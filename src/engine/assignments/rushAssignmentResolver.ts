import type { DefensePackage, DefenseTemplateId, RushMatchup } from "@/engine/assignments/types";

type RushAssignments = {
  rushersCount: number;
  matchups: RushMatchup[];
  simDropperId?: string;
  actualRushers?: string[];
};

export function resolveRushMatchups(defTemplateId: DefenseTemplateId, defensePkg: DefensePackage, pressureTag?: string): RushAssignments {
  const evenFront: RushMatchup[] = [
    { rusherRole: "EDGE_L", blockerRoles: ["LT"] },
    { rusherRole: "EDGE_R", blockerRoles: ["RT"] },
    { rusherRole: "DT1", blockerRoles: ["LG", "C"] },
    { rusherRole: "DT2", blockerRoles: ["RG", "C"] },
  ];
  const oddFront: RushMatchup[] = [
    { rusherRole: "OLB_L", blockerRoles: ["LT"] },
    { rusherRole: "OLB_R", blockerRoles: ["RT"] },
    { rusherRole: "DE_L", blockerRoles: ["LG"] },
    { rusherRole: "NT", blockerRoles: ["C", "RG"] },
  ];

  const isOddFamily = defensePkg === "ODD_34" || defTemplateId === "D15";
  const base = isOddFamily ? oddFront : evenFront;

  if (["D2", "D3", "D6", "D12", "D14", "D16"].includes(defTemplateId) || pressureTag === "PRESSURE_5") {
    return {
      rushersCount: defTemplateId === "D14" || defTemplateId === "D16" ? 6 : 5,
      matchups: [...base, { rusherRole: isOddFamily ? "LB1" : "NB", blockerRoles: ["RB", "Y", "H"], note: "protection side" }],
    };
  }

  if (["D10", "D11", "D13"].includes(defTemplateId) || pressureTag === "SIM") {
    return {
      rushersCount: defTemplateId === "D10" ? 3 : 4,
      matchups: base,
      simDropperId: isOddFamily ? "DE_R" : "EDGE_R",
      actualRushers: isOddFamily ? ["OLB_L", "OLB_R", "LB1", "NT"] : ["EDGE_L", "EDGE_R", "LB1", "DT1"],
    };
  }

  return {
    rushersCount: 4,
    matchups: base,
  };
}
