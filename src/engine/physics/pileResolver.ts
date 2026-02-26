import type { ResultTag } from "@/engine/gameSim";
import { PILE_BASE_STUFF, PILE_MAX_YAC_BONUS } from "@/engine/physics/constants";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type PileInput = {
  offense: { OL_pushZ: number; RB_massEff: number; RB_balanceZ: number };
  defense: { DL_anchorZ: number; boxCount: number; LB_fillZ: number };
  context: { yardsToGo: number; goalLine: boolean; surface: "DRY" | "WET" | "SNOW"; fatigue: number };
};

/** roll order: stuffRoll, yardsRoll */
export function resolvePile(input: PileInput, rng: () => number): { yardsGained: number; stuffed: boolean; resultTags: ResultTag[]; debug: Record<string, number> } {
  const boxPenalty = (input.defense.boxCount - 7) * 0.045;
  const surfacePenalty = input.context.surface === "WET" ? 0.03 : input.context.surface === "SNOW" ? 0.05 : 0;
  const delta = input.offense.OL_pushZ * 0.45 + input.offense.RB_massEff * 0.0018 + input.offense.RB_balanceZ * 0.22 - input.defense.DL_anchorZ * 0.45 - input.defense.LB_fillZ * 0.32 - boxPenalty - input.context.fatigue * 0.06 - surfacePenalty;
  const stuffProb = clamp(PILE_BASE_STUFF - delta * 0.22 + (input.context.goalLine ? 0.08 : 0), 0.14, 0.86);
  const stuffRoll = rng();
  const stuffed = stuffRoll < stuffProb;
  const yardsRoll = rng();
  const maxYards = Math.max(1, input.context.yardsToGo + PILE_MAX_YAC_BONUS);
  const yardsBase = stuffed ? (yardsRoll < 0.72 ? 0 : 1) : Math.round(1 + yardsRoll * (2.2 + Math.max(0, delta) * 1.2));
  const yardsGained = clamp(yardsBase, 0, maxYards);
  const resultTags: ResultTag[] = [{ kind: "BOX", text: stuffed ? "PILE_STUFF" : "PILE_SURGE" }];
  return { yardsGained, stuffed, resultTags, debug: { delta, stuffProb, stuffRoll, yardsRoll, maxYards } };
}
