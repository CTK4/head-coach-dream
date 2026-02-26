import nameBank from "@/data/nameBank.json";
import type { Prospect } from "@/engine/draftSim";

type NameRow = { name?: string; weight?: number };

function xorshift32(seed: number) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function pickWeighted(rows: NameRow[], rand: () => number) {
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.weight ?? 1)), 0);
  let roll = rand() * total;
  for (const row of rows) {
    roll -= Math.max(1, Number(row.weight ?? 1));
    if (roll <= 0) return String(row.name ?? "");
  }
  return String(rows[rows.length - 1]?.name ?? "");
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function normalish(rand: () => number, mean: number, std: number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * std;
}

const POSITIONS = ["QB", "RB", "WR", "TE", "OT", "OG", "C", "DE", "DT", "LB", "CB", "S", "K", "P"];
const POS_WEIGHTS = [7, 12, 18, 8, 10, 8, 4, 10, 8, 11, 12, 10, 1, 1];

export function generateDraftClass(params: { year: number; count: number; leagueSeed: number; saveSlotId: number }): Prospect[] {
  const seed = (params.leagueSeed ^ Math.imul(params.year, 2654435761) ^ (params.saveSlotId << 8)) >>> 0;
  const rand = xorshift32(seed || 1);
  const sheets = (nameBank as any).sheets ?? {};
  const firstNames = (sheets.firstNames_players ?? []) as NameRow[];
  const lastNames = (sheets.lastNames_players ?? []) as NameRow[];
  const usedNames = new Set<string>();
  const prospects: Prospect[] = [];
  const blueChipIdx = new Set<number>();

  while (blueChipIdx.size < Math.min(5, params.count)) blueChipIdx.add(Math.floor(rand() * params.count));

  for (let i = 0; i < params.count; i += 1) {
    let fullName = "";
    for (let tries = 0; tries < 5; tries += 1) {
      const f = pickWeighted(firstNames, rand);
      const l = pickWeighted(lastNames, rand);
      fullName = `${f} ${l}`.trim();
      if (!usedNames.has(fullName)) break;
    }
    usedNames.add(fullName);

    const wTotal = POS_WEIGHTS.reduce((a, b) => a + b, 0);
    let roll = rand() * wTotal;
    let pos = POSITIONS[0];
    for (let k = 0; k < POSITIONS.length; k += 1) {
      roll -= POS_WEIGHTS[k];
      if (roll <= 0) {
        pos = POSITIONS[k];
        break;
      }
    }

    let rating = Math.round(normalish(rand, 72, 8));
    if (blueChipIdx.has(i)) rating = Math.max(rating, 84 + Math.floor(rand() * 7));
    rating = clamp(rating, 55, 90);

    prospects.push({
      prospectId: `PROSPECT_${params.year}_${i + 1}_${Math.floor(rand() * 0xffffffff).toString(16)}`,
      rank: i + 1,
      name: fullName || `Prospect ${i + 1}`,
      pos,
      college: "Unknown",
      tier: rating >= 84 ? "Tier 1" : rating >= 78 ? "Tier 2" : rating >= 70 ? "Tier 3" : "Tier 4",
      age: 21 + Math.floor(rand() * 3),
      forty: null,
    });
  }

  return prospects.sort((a, b) => a.rank - b.rank);
}
