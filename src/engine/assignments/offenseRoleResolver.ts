import type { OffensePersonnel, OffenseResolvedAssignments } from "@/engine/assignments/types";

const OL_ASSIGNMENTS: OffenseResolvedAssignments["olAssignments"] = {
  LT: "LT1",
  LG: "LG1",
  C: "C1",
  RG: "RG1",
  RT: "RT1",
};

const ELIGIBLE_BY_PERSONNEL: Record<OffensePersonnel, OffenseResolvedAssignments["eligibleRoleAssignments"]> = {
  "10": { QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "WR3", Y: "WR4" },
  "11": { QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "WR3", Y: "TE1" },
  "12": { QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "TE2", Y: "TE1" },
  "21": { QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "FB1", Y: "TE1" },
  "22": { QB: "QB1", RB: "RB1", X: "WR1", Z: "TE2", H: "FB1", Y: "TE1" },
};

export function resolveOffenseRoles(personnel: OffensePersonnel): Pick<OffenseResolvedAssignments, "eligibleRoleAssignments" | "olAssignments"> {
  return {
    eligibleRoleAssignments: ELIGIBLE_BY_PERSONNEL[personnel],
    olAssignments: OL_ASSIGNMENTS,
  };
}
