import type { DynastyProfile } from "@/context/state/types/defaultStateTypes";

export function defaultDynastyProfile(): DynastyProfile {
  return { legacyScore: 0, seasonLog: [], milestones: [], unlockedCosmetics: [] };
}
