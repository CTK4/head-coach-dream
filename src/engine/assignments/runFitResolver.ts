import type { DefensePackage } from "@/engine/assignments/types";

export function resolveRunFits(frontTag?: string, pkg: DefensePackage = "NICKEL"): {
  front: string;
  boxCount: number;
  forceDefender: string;
  cutbackDefender: string;
  primaryFitDefenders: string[];
} {
  if (pkg === "ODD_34" || frontTag?.toLowerCase().includes("odd") || frontTag?.toLowerCase().includes("mint")) {
    return {
      front: frontTag ?? "odd/mint",
      boxCount: 7,
      forceDefender: "OLB_R",
      cutbackDefender: "FS",
      primaryFitDefenders: ["LB1", "LB2", "SS"],
    };
  }

  if (pkg === "BEAR" || frontTag?.toLowerCase().includes("bear")) {
    return {
      front: frontTag ?? "bear",
      boxCount: 8,
      forceDefender: "EDGE_L",
      cutbackDefender: "SS",
      primaryFitDefenders: ["LB1", "LB2", "EDGE_L", "EDGE_R"],
    };
  }

  return {
    front: frontTag ?? "even nickel",
    boxCount: 6,
    forceDefender: "SS",
    cutbackDefender: "FS",
    primaryFitDefenders: ["LB1", "LB2", "SS"],
  };
}
