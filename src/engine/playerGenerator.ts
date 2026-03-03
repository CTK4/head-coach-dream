import nameBank from "@/data/nameBank.json";
import {
  ARCHETYPES,
  BASE_DEV_WEIGHTS,
  CLASS_QUALITY_TABLE,
  POSITION_BASELINE,
  POSITION_OVR_WEIGHTS,
  POSITION_STDDEV,
  type ClassYear,
  type PlayerArchetype,
  type Position,
} from "@/data/playerGeneratorConfig";
import { clamp, mulberry32 } from "@/engine/rand";

export type DevTrait = "generational" | "elite" | "impact" | "normal";

export type GeneratedPlayer = {
  playerId: string;
  classYear: ClassYear;
  position: Position;
  archetype: PlayerArchetype;
  attrs: Record<string, number>;
  potential: Record<string, number>;
  ovr: number;
  devTrait: DevTrait;
  potentialOvr: number;
  draftRound: number;
  name: string;
};

export type GeneratorOptions = {
  classYear: ClassYear;
  position: Position;
  seed: number;
  draftRound?: number;
  archetype?: string;
  overrides?: Partial<Record<string, number>>;
};

type NameRow = { name?: string; weight?: number };

export function gaussianSample(rng: () => number, mean: number, stddev: number): number {
  let u = 0;
  let v = 0;
  while (u <= Number.EPSILON) u = rng();
  while (v <= Number.EPSILON) v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stddev;
}

export function triangularSample(rng: () => number, min: number, mode: number, max: number): number {
  if (max <= min) return min;
  const safeMode = Math.max(min, Math.min(mode, max));
  const u = rng();
  const c = (safeMode - min) / (max - min);
  if (u < c) return min + Math.sqrt(u * (max - min) * (safeMode - min));
  return max - Math.sqrt((1 - u) * (max - min) * (max - safeMode));
}

export function weightedRandom<T extends string>(rng: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const total = entries.reduce((sum, [, w]) => sum + Math.max(0, Number(w ?? 0)), 0);
  if (total <= 0) return entries[entries.length - 1][0];

  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= Math.max(0, Number(weight ?? 0));
    if (roll <= 0) return key;
  }

  return entries[entries.length - 1][0];
}

function pickWeightedName(rng: () => number, rows: NameRow[]): string {
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.weight ?? 1)), 0);
  if (total <= 0) return "";
  let roll = rng() * total;
  for (const row of rows) {
    roll -= Math.max(1, Number(row.weight ?? 1));
    if (roll <= 0) return String(row.name ?? "").trim();
  }
  return String(rows[rows.length - 1]?.name ?? "").trim();
}

export function generatePlayer(opts: GeneratorOptions): GeneratedPlayer {
  const draftRound = clamp(Math.round(opts.draftRound ?? 4), 1, 7);
  const q = CLASS_QUALITY_TABLE[opts.classYear] ?? 1.0;
  const rng = mulberry32(opts.seed >>> 0 || 1);

  const positionArchetypes = ARCHETYPES.filter((a) => a.position === opts.position);
  const archetype = opts.archetype
    ? (() => {
      const found = positionArchetypes.find((a) => a.id === opts.archetype);
      if (!found) throw new Error(`Archetype ${opts.archetype} not found for position ${opts.position}`);
      return found;
    })()
    : positionArchetypes[Math.floor(rng() * positionArchetypes.length)];

  if (!archetype) throw new Error(`No archetypes configured for position ${opts.position}`);

  const attrs: Record<string, number> = {};
  const potential: Record<string, number> = {};
  const baseline = POSITION_BASELINE[opts.position];

  for (const attr of Object.keys(baseline)) {
    const mean = baseline[attr] * q;
    const stddev = POSITION_STDDEV[opts.position][attr] ?? 8;
    const bias = archetype.attrBias[attr] ?? 0;
    const raw = gaussianSample(rng, mean, stddev) + bias;
    attrs[attr] = clamp(Math.round(raw), 0, 99);
  }

  for (const [attr, value] of Object.entries(opts.overrides ?? {})) {
    if (value == null) continue;
    attrs[attr] = clamp(Math.round(value), 0, 99);
  }

  for (const attr of Object.keys(baseline)) {
    const potentialGap = triangularSample(rng, 0, Math.max(0, 12 - (draftRound - 1) * 2.5), Math.max(0, 22 - (draftRound - 1) * 3));
    potential[attr] = clamp(attrs[attr] + Math.round(potentialGap), attrs[attr], 99);
  }

  const weights = POSITION_OVR_WEIGHTS[opts.position];
  const ovr = clamp(Math.round(Object.entries(weights).reduce((sum, [attr, weight]) => sum + attrs[attr] * (weight ?? 0), 0)), 40, 99);
  const potentialOvr = clamp(Math.round(Object.entries(weights).reduce((sum, [attr, weight]) => sum + potential[attr] * (weight ?? 0), 0)), ovr, 99);

  const scaled = {
    generational: BASE_DEV_WEIGHTS.generational + Math.max(0, q - 1.1) * 0.02,
    elite: BASE_DEV_WEIGHTS.elite + Math.max(0, q - 1.05) * 0.06,
    impact: BASE_DEV_WEIGHTS.impact,
    normal: 0,
  };
  scaled.normal = Math.max(0, 1 - scaled.generational - scaled.elite - scaled.impact);
  const devTrait = weightedRandom<DevTrait>(rng, scaled);

  const sheets = (nameBank as { sheets?: Record<string, NameRow[]> }).sheets ?? {};
  const firstName = pickWeightedName(rng, sheets.firstNames_players ?? []);
  const lastName = pickWeightedName(rng, sheets.lastNames_players ?? []);
  const name = `${firstName} ${lastName}`.trim() || "Generated Player";

  return {
    playerId: `GEN_${opts.classYear}_${opts.position}_${opts.seed}`,
    classYear: opts.classYear,
    position: opts.position,
    archetype,
    attrs,
    potential,
    ovr,
    devTrait,
    potentialOvr,
    draftRound,
    name,
  };
}

const DEFAULT_POSITION_COUNTS: Record<Position, number> = {
  QB: 22, RB: 28, WR: 42, TE: 18,
  OT: 22, IOL: 20,
  EDGE: 22, IDL: 18, LB: 22,
  CB: 26, S: 18,
  K: 8, P: 8,
};

export function generateDraftClass(
  classYear: ClassYear,
  classSeed: number,
  config?: { totalPlayers?: number; positionCounts?: Partial<Record<Position, number>> },
): GeneratedPlayer[] {
  const totalPlayers = config?.totalPlayers ?? 256;
  const mergedCounts: Record<Position, number> = {
    ...DEFAULT_POSITION_COUNTS,
    ...(config?.positionCounts ?? {}),
  };

  const positions = Object.keys(mergedCounts) as Position[];
  const generated: GeneratedPlayer[] = [];

  for (let posIndex = 0; posIndex < positions.length; posIndex += 1) {
    const position = positions[posIndex];
    const count = mergedCounts[position];
    for (let playerIndex = 0; playerIndex < count; playerIndex += 1) {
      const seed = (classSeed ^ Math.imul(posIndex, 0x9e3779b9) ^ playerIndex) >>> 0;
      generated.push(generatePlayer({ classYear, position, seed, draftRound: 4 }));
    }
  }

  const sortedByOvr = [...generated].sort((a, b) => b.ovr - a.ovr);
  for (let i = 0; i < sortedByOvr.length; i += 1) {
    const rank = i + 1;
    let round: number;
    if (rank <= 32) round = 1;
    else if (rank <= 64) round = 2;
    else if (rank <= 96) round = 3;
    else if (rank <= 144) round = 4;
    else if (rank <= 192) round = 5;
    else if (rank <= 240) round = 6;
    else round = 7;

    const regenSeed = (classSeed ^ 0xa5a5a5a5 ^ i) >>> 0;
    const regenerated = generatePlayer({
      classYear,
      position: sortedByOvr[i].position,
      seed: regenSeed,
      draftRound: round,
      archetype: sortedByOvr[i].archetype.id,
      overrides: sortedByOvr[i].attrs,
    });

    sortedByOvr[i] = {
      ...sortedByOvr[i],
      draftRound: round,
      potential: regenerated.potential,
      potentialOvr: regenerated.potentialOvr,
      devTrait: regenerated.devTrait,
    };
  }

  return sortedByOvr.slice(0, totalPlayers).sort((a, b) => b.ovr - a.ovr);
}
