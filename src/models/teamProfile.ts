import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

export type RebuildStage = "contender" | "competitive" | "retool" | "rebuild";

export type TeamProfile = {
  aggressiveness: number;
  rebuildStage: RebuildStage;
  capDiscipline: number;
  positionalNeeds: Record<string, number>;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function inferRebuildStage(input: {
  winPct: number;
  capSpaceRatio: number;
  avgRosterAge: number;
  playoffResult: "missed" | "wildCard" | "divisional" | "conference" | "superbowlLoss" | "champion";
}): RebuildStage {
  if (input.playoffResult === "champion" || input.playoffResult === "superbowlLoss") return "contender";
  if (input.winPct >= 0.6 && input.playoffResult !== "missed") return "competitive";
  if (input.winPct < 0.4 || input.avgRosterAge > 28.5 || input.capSpaceRatio < SIM_SYSTEMS_CONFIG.offseason.minimumCapBufferRatio) return "rebuild";
  return "retool";
}

export function buildTeamProfile(input: {
  winPct: number;
  capSpace: number;
  capTotal: number;
  avgRosterAge: number;
  playoffResult: "missed" | "wildCard" | "divisional" | "conference" | "superbowlLoss" | "champion";
  positionalNeeds: Record<string, number>;
}): TeamProfile {
  const capSpaceRatio = input.capTotal > 0 ? input.capSpace / input.capTotal : 0;
  const rebuildStage = inferRebuildStage({ ...input, capSpaceRatio });

  const aggressivenessBase = rebuildStage === "contender" ? 0.76 : rebuildStage === "competitive" ? 0.62 : rebuildStage === "retool" ? 0.48 : 0.38;
  const capDisciplineBase = rebuildStage === "rebuild" ? 0.78 : rebuildStage === "retool" ? 0.66 : 0.54;

  const aggressiveness = clamp01(aggressivenessBase + (input.winPct - 0.5) * 0.2 - Math.max(0, 0.08 - capSpaceRatio));
  const capDiscipline = clamp01(capDisciplineBase + Math.max(0, (28 - input.avgRosterAge) * 0.02));

  const positionalNeeds: Record<string, number> = {};
  for (const [pos, need] of Object.entries(input.positionalNeeds)) positionalNeeds[pos] = clamp01(Number(need ?? 0));

  return { aggressiveness, rebuildStage, capDiscipline, positionalNeeds };
}
