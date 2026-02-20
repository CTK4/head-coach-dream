import type { Prospect } from "@/context/GameContext";
import type { GmScoutTraits } from "@/engine/gmScouting";
import { hiddenIntelForProspect } from "@/engine/prospectIntel";
import type { PlayerIntel } from "@/engine/scoutingCapacity";
import type { ProspectScoutProfile } from "@/engine/scouting/types";

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

export type ProspectEval = { value: number; roundBand: string; sigma: number; bias: number };

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

function computeRiskSignal(detRand: (key: string) => number, prospect: Prospect, intel?: PlayerIntel | ProspectScoutProfile) {
  if (intel?.revealed?.medicalTier === "BLACK" || intel?.revealed?.characterTier === "BLACK") return 1;
  if (intel?.revealed?.medicalTier === "RED" || intel?.revealed?.characterTier === "RED") return 0.75;
  if (intel?.revealed?.medicalTier === "ORANGE" || intel?.revealed?.characterTier === "ORANGE") return 0.45;
  if (intel?.revealed?.medicalTier === "YELLOW" || intel?.revealed?.characterTier === "YELLOW") return 0.2;
  if (intel?.revealed?.medicalTier || intel?.revealed?.characterTier) return 0.08;
  const hidden = hiddenIntelForProspect(detRand, prospect);
  return hidden.riskSignal * 0.35;
}

function computeSignals(detRand: (key: string) => number, prospect: Prospect) {
  const hidden = hiddenIntelForProspect(detRand, prospect);
  return {
    eliteTraitSignal: hidden.eliteTraitSignal,
    rasSignal: hidden.rasSignal,
    trenchesSignal: hidden.trenchesSignal,
    defenseSignal: hidden.defenseSignal,
    ceilingSignal: hidden.ceilingSignal,
  };
}

export function evalProspectForGm(args: {
  prospect: Prospect;
  gm: GmScoutTraits;
  seedRand: () => number;
  spentPoints: number;
  teamNeedAtPos01: number;
  detRand?: (key: string) => number;
  intel?: PlayerIntel | ProspectScoutProfile;
}) {
  const { prospect, gm, seedRand, spentPoints, teamNeedAtPos01 } = args;
  const det = args.detRand ?? ((k: string) => seedRand() + (k.length % 7) * 0.001);

  const V_true = clamp(Math.round(prospect.grade), 0, 100);
  const sig = computeSignals(det, prospect);
  const riskSignal = computeRiskSignal(det, prospect, args.intel);

  let bias = 0;
  bias += (gm.bias_star - 50) * sig.eliteTraitSignal * 0.06;
  bias += (gm.bias_athleticism - 50) * sig.rasSignal * 0.05;
  bias += (gm.bias_trenches - 50) * sig.trenchesSignal * 0.05;
  bias += (gm.bias_defense - 50) * sig.defenseSignal * 0.04;
  bias -= (gm.discipline - 50) * riskSignal * 0.05;
  bias += (gm.aggression - 50) * sig.ceilingSignal * 0.04;
  bias += (gm.urgency_bias - 50) * teamNeedAtPos01 * 0.03;
  bias = clamp(bias, -6, 6);

  let sigma_base = 6.5;
  sigma_base -= gm.analytics_orientation * 0.03;
  sigma_base -= gm.film_process * 0.02;
  sigma_base -= gm.intel_network * 0.01;
  sigma_base += gm.urgency_bias * 0.015;
  const sigma = clamp(sigma_base, 2.5, 9.0);
  const sigma_effective = sigma * Math.exp(-spentPoints / (35 + gm.film_process * 0.3));

  const u1 = Math.max(1e-9, seedRand());
  const u2 = Math.max(1e-9, seedRand());
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const value = clamp(Math.round(V_true + bias + z * sigma_effective), 0, 100);

  return { value, roundBand: valueToRoundBand(value), sigma: sigma_effective, bias } satisfies ProspectEval;
}
