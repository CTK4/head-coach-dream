import type { DefensePackage, DefenseRole } from "@/engine/assignments/types";

export function resolveDefenseRoles(pkg: DefensePackage): Partial<Record<DefenseRole, string>> {
  if (pkg === "NICKEL") {
    return {
      CB1: "CB1",
      CB2: "CB2",
      NB: "NB",
      FS: "FS",
      SS: "SS",
      LB1: "LB1",
      LB2: "LB2",
      EDGE_L: "EDGE_L",
      EDGE_R: "EDGE_R",
      DT1: "DT1",
      DT2: "DT2",
    };
  }

  if (pkg === "ODD_34") {
    return {
      CB1: "CB1",
      CB2: "CB2",
      FS: "FS",
      SS: "SS",
      LB1: "LB1",
      LB2: "LB2",
      OLB_L: "OLB_L",
      OLB_R: "OLB_R",
      DE_L: "DE_L",
      NT: "NT",
      DE_R: "DE_R",
    };
  }

  return {
    CB1: "CB1",
    CB2: "CB2",
    FS: "FS",
    SS: "SS",
    LB1: "LB1",
    LB2: "LB2",
    EDGE_L: "EDGE_L",
    DT1: "DT1",
    NT: "NT",
    DT2: "DT2",
    EDGE_R: "EDGE_R",
  };
}
