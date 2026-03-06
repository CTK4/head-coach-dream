import type { GameState } from "@/context/GameContext";
import { detRand as detRand2 } from "@/engine/scouting/rng";
import type { MedicalResult } from "@/engine/scouting/types";

const CATEGORY_ROLL: MedicalResult["category"][] = ["DURABILITY", "INJURY_HISTORY", "STRUCTURAL"];

function notesForTier(tier: MedicalResult["riskTier"], category: MedicalResult["category"]) {
  if (tier === "BLACK") return `${category}: non-trivial long-term availability risk.`;
  if (tier === "RED") return `${category}: significant red flag surfaced during medical review.`;
  if (tier === "ORANGE") return `${category}: moderate concern requiring mitigation plan.`;
  if (tier === "YELLOW") return `${category}: monitor in-season workload and maintenance.`;
  return `${category}: clean report.`;
}

export function requestMedical(state: GameState, prospectId: string): MedicalResult {
  const scouting = state.scoutingState;
  const tier = scouting?.trueProfiles?.[prospectId]?.trueMedical?.tier ?? "YELLOW";
  const roll = detRand2(state.saveSeed, `medical:${state.season}:${prospectId}:category`);
  const idx = Math.min(CATEGORY_ROLL.length - 1, Math.floor(roll * CATEGORY_ROLL.length));
  const category = CATEGORY_ROLL[idx];

  return {
    prospectId,
    category,
    riskTier: tier,
    notes: notesForTier(tier, category),
  };
}
