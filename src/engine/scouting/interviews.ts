import type { GameState } from "@/context/GameContext";
import { detRand as detRand2 } from "@/engine/scouting/rng";
import type { InterviewResult } from "@/engine/scouting/types";

const REVEALS_BY_CATEGORY: Record<InterviewResult["category"], string[]> = {
  CHARACTER: ["Team-first response", "Handled adversity with maturity", "Deflects accountability"],
  INTELLIGENCE: ["Strong whiteboard processing", "Average coverage recognition", "Slow progression reads"],
  WORK_ETHIC: ["Lives in the facility", "Inconsistent prep cadence", "Elite offseason discipline"],
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function runInterview(
  state: GameState,
  prospectId: string,
  category: InterviewResult["category"],
): InterviewResult {
  const scouting = state.scoutingState;
  const truth = scouting?.trueProfiles?.[prospectId];
  const attributes = truth?.trueAttributes ?? {};

  const base =
    category === "CHARACTER"
      ? Number(attributes.character ?? 55)
      : category === "INTELLIGENCE"
        ? Number(attributes.intelligence ?? 55)
        : Number(attributes.workEthic ?? attributes.character ?? 55);

  const noise = (detRand2(state.saveSeed, `interview:${state.season}:${prospectId}:${category}:noise`) - 0.5) * 18;
  const score = clampScore(base + noise);
  const revealRoll = detRand2(state.saveSeed, `interview:${state.season}:${prospectId}:${category}:reveal`);

  const reveal = revealRoll >= 0.45
    ? undefined
    : REVEALS_BY_CATEGORY[category][Math.floor(revealRoll * REVEALS_BY_CATEGORY[category].length)];

  return { prospectId, category, score, reveal };
}
