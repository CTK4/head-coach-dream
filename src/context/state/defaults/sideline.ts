import type { SidelineAdjustments } from "@/context/state/types/defaultStateTypes";

export const DEFAULT_SIDELINE: SidelineAdjustments = {
  offense: { tempo: "NORMAL", aggressiveness: 50, runBias: 50, passProtection: "BASE" },
  defense: { shellPreference: "AUTO", blitzRate: 35, spyQB: false, runFit: "NORMAL" },
  specialTeams: { returnAggression: 50, puntStrategy: "NORMAL" },
};
