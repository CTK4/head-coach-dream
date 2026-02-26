import type { ResultTag } from "@/engine/gameSim";
import { PASS_RUSH_CHIP_HELP_PENALTY, PASS_RUSH_QUICK_GAME_SACK_MULT, PRESSURE_SIGMOID_CENTER, SACK_SIGMOID_CENTER } from "@/engine/physics/constants";
import { ratingZ } from "@/engine/physics/ratingsToKinematics";
import { anglePenaltyFromRush } from "@/engine/physics/tackleAngle";

export type PassRushInput = {
  rusher: { speed: number; accel: number; strength: number; technique: number; bend: number; fatigue01: number };
  blocker: { passPro: number; footwork: number; anchor: number; fatigue01: number };
  context: { rushAngleDeg: number; depthYds: number; chipHelp: boolean; quickGame: boolean };
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** roll order: pressureRoll, sackRoll(if pressured) */
export function resolvePassRush(input: PassRushInput, rng: () => number): { pressured: boolean; sacked: boolean; timePenaltySec: number; resultTags: ResultTag[]; debug: Record<string, number> } {
  const bendZ = ratingZ(input.rusher.bend);
  const pressureScore =
    0.3 * ratingZ(input.rusher.speed) +
    0.2 * ratingZ(input.rusher.accel) +
    0.25 * bendZ +
    0.25 * ratingZ(input.rusher.technique) +
    0.1 * ratingZ(input.rusher.strength) -
    input.rusher.fatigue01 * 0.3;
  const blockScore = 0.4 * ratingZ(input.blocker.passPro) + 0.35 * ratingZ(input.blocker.footwork) + 0.25 * ratingZ(input.blocker.anchor) - input.blocker.fatigue01 * 0.2;
  const anglePenalty = anglePenaltyFromRush(input.context.rushAngleDeg, bendZ);
  const chipHelpPenalty = input.context.chipHelp ? PASS_RUSH_CHIP_HELP_PENALTY : 0;
  const delta = pressureScore - blockScore - chipHelpPenalty - anglePenalty;
  const pPressure = clamp(sigmoid(delta - PRESSURE_SIGMOID_CENTER), 0.04, 0.96);
  const pSack = clamp(sigmoid(delta - SACK_SIGMOID_CENTER) * (input.context.quickGame ? PASS_RUSH_QUICK_GAME_SACK_MULT : 1), 0.01, 0.78);

  const pressureRoll = rng();
  const pressured = pressureRoll < pPressure;
  const sackRoll = pressured ? rng() : -1;
  const sacked = pressured && sackRoll < pSack;
  const timePenaltySec = pressured ? clamp(0.35 + (1 - pPressure) * 0.5 + input.context.depthYds * 0.015, 0.2, 1.1) : 0;
  const resultTags: ResultTag[] = [];
  if (pressured) resultTags.push({ kind: "PRESSURE", text: `EDGE_PRESSURE:${delta.toFixed(2)}` });
  if (sacked) resultTags.push({ kind: "PRESSURE", text: "SACK_CONVERTED" });

  return { pressured, sacked, timePenaltySec, resultTags, debug: { pressureScore, blockScore, anglePenalty, chipHelpPenalty, delta, pPressure, pSack, pressureRoll, sackRoll } };
}
