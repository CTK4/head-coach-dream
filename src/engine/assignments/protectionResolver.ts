import type { ProtectionAssignments } from "@/engine/assignments/types";

type ProtectionFamily = "quick" | "dropback" | "shot" | "play-action" | "screen";

export function resolveProtection(
  family: ProtectionFamily,
  opts: { frontId?: string; maxProtect?: boolean; playActionChipH?: boolean } = {},
): ProtectionAssignments {
  if (family === "quick") {
    return {
      protectorsCount: 5,
      chipRoles: [],
      baseType: "quick",
      slideDirection: "none",
    };
  }

  if (family === "dropback") {
    return {
      protectorsCount: 6,
      chipRoles: ["RB"],
      baseType: "half-slide",
      slideDirection: opts.frontId ? "pressure" : "field",
    };
  }

  if (family === "shot") {
    if (opts.maxProtect) {
      return {
        protectorsCount: 7,
        chipRoles: ["RB", "Y"],
        baseType: "max",
        slideDirection: "pressure",
      };
    }

    return {
      protectorsCount: 6,
      chipRoles: ["RB"],
      baseType: "half-slide",
      slideDirection: "pressure",
    };
  }

  if (family === "play-action") {
    return {
      protectorsCount: 7,
      chipRoles: opts.playActionChipH ? ["RB", "H"] : ["RB", "Y"],
      baseType: "play-action",
      slideDirection: "run-action",
    };
  }

  return {
    protectorsCount: 5,
    chipRoles: [],
    baseType: "screen",
    slideDirection: "callside",
  };
}
