import type { GameState } from "@/context/GameContext";
import { getPerkNode, getSkillTreeNodes, type PerkNode, type PerkRequirement } from "@/data/skillTree";
import { applyFlagsToContext as collectPerkFlags } from "@/engine/perkWiring";

export type CoachPerkState = GameState["coach"];

function requirementMet(coach: CoachPerkState, req: PerkRequirement): boolean {
  if (req.type === "PERK") return (coach.unlockedPerkIds ?? []).includes(req.perkId);
  if (req.type === "TENURE") return Number(coach.tenureYear ?? 1) >= req.minTenureYear;
  return false;
}

export function canUnlockNode(coach: CoachPerkState, node: PerkNode): { ok: boolean; reason?: string } {
  const unlocked = new Set(coach.unlockedPerkIds ?? []);
  if (unlocked.has(node.id)) return { ok: false, reason: "Already unlocked." };
  if ((coach.perkPoints ?? 0) < node.cost) return { ok: false, reason: `Requires ${node.cost} point${node.cost === 1 ? "" : "s"}.` };

  const unmet = (node.requires ?? []).find((req) => !requirementMet(coach, req));
  if (unmet?.type === "PERK") return { ok: false, reason: "Missing prerequisite perk." };
  if (unmet?.type === "TENURE") return { ok: false, reason: `Requires tenure year ${unmet.minTenureYear}+.` };

  return { ok: true };
}

export function getAvailableNodes(coach: CoachPerkState): PerkNode[] {
  const nodes = getSkillTreeNodes(coach.archetypeId);
  return nodes.filter((node) => canUnlockNode(coach, node).ok);
}

export function unlockPerk(coach: CoachPerkState, nodeId: string): { coach: CoachPerkState; error?: string } {
  const node = getPerkNode(nodeId);
  if (!node) return { coach, error: "Perk not found." };
  if (node.archetypeId && node.archetypeId !== coach.archetypeId) return { coach, error: "Perk is not available for this archetype." };

  const gate = canUnlockNode(coach, node);
  if (!gate.ok) return { coach, error: gate.reason ?? "Cannot unlock." };

  return {
    coach: {
      ...coach,
      perkPoints: Math.max(0, (coach.perkPoints ?? 0) - node.cost),
      unlockedPerkIds: [...(coach.unlockedPerkIds ?? []), node.id],
    },
  };
}

export function applyFlagsToContext(coach: CoachPerkState): string[] {
  return collectPerkFlags(coach);
}
