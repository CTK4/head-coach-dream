import type { Prospect } from "@/engine/offseasonData";

export type MedicalTier = "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";
export type CharacterTier = "BLUE" | "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";

export type HiddenProspectIntel = {
  medicalTier: MedicalTier;
  characterTier: CharacterTier;
  eliteTraitSignal: number;
  trenchesSignal: number;
  defenseSignal: number;
  rasSignal: number;
  ceilingSignal: number;
  riskSignal: number;
};

export type CombineResult = {
  forty: number;
  shuttle: number;
  vert: number;
  bench: number;
  ras: number;
  grades: { forty: string; shuttle: string; vert: string; bench: string };
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

const letter = (z: number) => {
  if (z >= 1.5) return "A+";
  if (z >= 1.0) return "A";
  if (z >= 0.6) return "A-";
  if (z >= 0.2) return "B+";
  if (z >= -0.2) return "B";
  if (z >= -0.6) return "B-";
  if (z >= -1.0) return "C+";
  if (z >= -1.4) return "C";
  if (z >= -1.8) return "C-";
  if (z >= -2.2) return "D";
  return "F";
};

export function hiddenIntelForProspect(detRand: (key: string) => number, p: Prospect): HiddenProspectIntel {
  const pos = p.pos;
  const trenches = pos === "OL" || pos === "DL" || pos === "EDGE";
  const defense = pos === "DL" || pos === "EDGE" || pos === "LB" || pos === "CB" || pos === "S";

  const rMed = detRand(`intel:med:${p.id}`);
  const medicalTier: MedicalTier = rMed < 0.62 ? "GREEN" : rMed < 0.82 ? "YELLOW" : rMed < 0.93 ? "ORANGE" : rMed < 0.985 ? "RED" : "BLACK";

  const rChar = detRand(`intel:char:${p.id}`);
  const characterTier: CharacterTier =
    rChar < 0.08 ? "BLUE" : rChar < 0.72 ? "GREEN" : rChar < 0.86 ? "YELLOW" : rChar < 0.94 ? "ORANGE" : rChar < 0.985 ? "RED" : "BLACK";

  const base = typeof (p as any).trueValue === "number" ? (p as any).trueValue : 75 + detRand(`intel:tv:${p.id}`) * 20;
  const eliteTraitSignal = clamp((base - 88) / 12, 0, 1);
  const ceilingSignal = clamp((base - 82) / 18, 0, 1);

  const medRisk = medicalTier === "GREEN" ? 0.05 : medicalTier === "YELLOW" ? 0.18 : medicalTier === "ORANGE" ? 0.38 : medicalTier === "RED" ? 0.7 : 0.95;
  const charRisk =
    characterTier === "BLUE" ? 0.02 : characterTier === "GREEN" ? 0.06 : characterTier === "YELLOW" ? 0.2 : characterTier === "ORANGE" ? 0.42 : characterTier === "RED" ? 0.7 : 0.95;

  return {
    medicalTier,
    characterTier,
    eliteTraitSignal,
    trenchesSignal: trenches ? 1 : 0,
    defenseSignal: defense ? 1 : 0,
    rasSignal: detRand(`intel:ras:${p.id}`),
    ceilingSignal,
    riskSignal: clamp((medRisk + charRisk) * 0.5, 0, 1),
  };
}

export function generateCombineResult(detRand: (key: string) => number, p: Prospect): CombineResult {
  const pos = p.pos;
  const r1 = detRand(`combine:${p.id}:1`);
  const r2 = detRand(`combine:${p.id}:2`);
  const r3 = detRand(`combine:${p.id}:3`);
  const r4 = detRand(`combine:${p.id}:4`);

  const isSkill = pos === "WR" || pos === "RB" || pos === "CB" || pos === "S";
  const isBig = pos === "OL" || pos === "DL";
  const isEdge = pos === "EDGE" || pos === "LB";

  const fortyMean = isSkill ? 4.52 : isEdge ? 4.66 : isBig ? 5.05 : pos === "QB" ? 4.8 : 4.72;
  const shuttleMean = isSkill ? 4.18 : isEdge ? 4.3 : isBig ? 4.75 : 4.4;
  const vertMean = isSkill ? 36 : isEdge ? 34 : isBig ? 28.5 : 32;
  const benchMean = isSkill ? 14 : isEdge ? 20 : isBig ? 28 : 18;

  const forty = clamp(fortyMean + (r1 - 0.5) * (isBig ? 0.3 : 0.18), 4.28, 5.45);
  const shuttle = clamp(shuttleMean + (r2 - 0.5) * (isBig ? 0.3 : 0.2), 3.85, 5.1);
  const vert = clamp(vertMean + (r3 - 0.5) * (isBig ? 8 : 10), 22, 44);
  const bench = Math.round(clamp(benchMean + (r4 - 0.5) * (isSkill ? 10 : 14), 5, 45));

  const zForty = clamp((fortyMean - forty) / 0.12, -3, 3);
  const zShuttle = clamp((shuttleMean - shuttle) / 0.12, -3, 3);
  const zVert = clamp((vert - vertMean) / 4, -3, 3);
  const zBench = clamp((bench - benchMean) / 6, -3, 3);

  const ras = clamp((clamp(zForty, -2.5, 2.5) + clamp(zShuttle, -2.5, 2.5) + clamp(zVert, -2.5, 2.5) + clamp(zBench, -2.5, 2.5) + 10) * 0.5, 0, 10);

  return {
    forty: Math.round(forty * 100) / 100,
    shuttle: Math.round(shuttle * 100) / 100,
    vert: Math.round(vert * 10) / 10,
    bench,
    ras: Math.round(ras * 10) / 10,
    grades: { forty: letter(zForty), shuttle: letter(zShuttle), vert: letter(zVert), bench: letter(zBench) },
  };
}
