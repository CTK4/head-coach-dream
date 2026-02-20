import type { Prospect } from "@/context/GameContext";
import type { GmScoutTraits } from "@/engine/gmScouting";
import { gmAccuracyScore } from "@/engine/gmScouting";

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const clamp01 = (x: number) => clamp(x, 0, 1);

export type ProspectEval = {
  value: number;
  roundBand: string;
  sigma: number;
  bias: number;
};

export function valueToRoundBand(v: number) {
  if (v >= 92) return "Top 5";
  if (v >= 88) return "1st";
  if (v >= 84) return "2nd";
  if (v >= 80) return "3rd";
  if (v >= 76) return "4th";
  if (v >= 72) return "5th";
  if (v >= 68) return "6th";
  return "7th/UDFA";
}

export function evalProspectForGm(args: {
  prospect: Prospect;
  gm: GmScoutTraits;
  seedRand: () => number;
  spentPoints: number;
  teamNeedAtPos01: number;
}) {
  const { prospect, gm, seedRand, spentPoints, teamNeedAtPos01 } = args;

  const V_true = clamp(Math.round(prospect.grade), 0, 100);

  const pos = String(prospect.pos || "").toUpperCase();
  const isDefense = ["CB", "S", "LB", "DL", "EDGE"].includes(pos);
  const isTrenches = ["DL", "EDGE", "OL"].includes(pos);

  const eliteTraitSignal = clamp01((V_true - 88) / 12);
  const rasSignal = clamp01((clamp(prospect.ras ?? 50, 0, 100) - 50) / 50);
  const trenchesSignal = isTrenches ? 1 : 0;
  const defenseSignal = isDefense ? 1 : 0;

  const riskSignal = 0;
  const ceilingSignal = rasSignal;

  let bias = 0;
  bias += (gm.bias_star - 50) * eliteTraitSignal * 0.06;
  bias += (gm.bias_athleticism - 50) * rasSignal * 0.05;
  bias += (gm.bias_trenches - 50) * trenchesSignal * 0.05;
  bias += (gm.bias_defense - 50) * defenseSignal * 0.04;
  bias -= (gm.discipline - 50) * riskSignal * 0.05;
  bias += (gm.aggression - 50) * ceilingSignal * 0.04;
  bias += (gm.urgency_bias - 50) * teamNeedAtPos01 * 0.03;
  bias = clamp(bias, -6, 6);

  const acc = gmAccuracyScore(gm);
  const sigma_base = 9.0 + (2.5 - 9.0) * (acc / 100);
  const denom = 35 + gm.film_process * 0.3;
  const sigma = clamp(sigma_base * Math.exp(-spentPoints / denom), 2.25, 9.0);

  const u1 = Math.max(1e-9, seedRand());
  const u2 = Math.max(1e-9, seedRand());
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const value = clamp(Math.round(V_true + bias + z * sigma), 0, 100);

  return { value, roundBand: valueToRoundBand(value), sigma, bias } satisfies ProspectEval;
}
