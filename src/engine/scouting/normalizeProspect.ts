import { normalizeProspectPosition } from "@/lib/prospectPosition";

export type NormalizedDraftProspect = {
  id: string;
  name: string;
  pos: string;
  school: string;
  age?: string | number;
  height?: string;
  weight?: string;
  archetype?: string;
  grade?: number;
  rank?: number;
  ras?: number;
  interview?: number;
  forty?: number | string;
  vert?: number | string;
  shuttle?: number | string;
  threeCone?: number | string;
  bench?: number | string;
};

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

export function normalizeDraftProspect(raw: Record<string, unknown>, fallbackIndex = 0): NormalizedDraftProspect {
  const id =
    toText(raw.prospectId) ??
    toText(raw.id) ??
    toText(raw["Player ID"]) ??
    `UP_${String(fallbackIndex + 1).padStart(4, "0")}`;

  const posRaw = toText(raw.pos) ?? toText(raw.POS) ?? "UNK";

  return {
    id,
    name: toText(raw.name) ?? toText(raw.Name) ?? "Unknown Prospect",
    pos: normalizeProspectPosition(posRaw, "SCOUTING"),
    school: toText(raw.school) ?? toText(raw.college) ?? toText(raw.School) ?? toText(raw.College) ?? "Unknown School",
    age: toText(raw.age) ?? toText(raw.Age) ?? toNumber(raw.age) ?? toNumber(raw.Age),
    height: toText(raw.height) ?? toText(raw.Hgt) ?? toText(raw.heightIn),
    weight: toText(raw.weight) ?? toText(raw.Wgt) ?? toText(raw.weightLb),
    archetype: toText(raw.archetype) ?? toText(raw.DraftTier) ?? toText(raw.tier),
    grade: toNumber(raw.grade) ?? toNumber(raw.Grade),
    rank: toNumber(raw.rank) ?? toNumber(raw.Rank),
    ras: toNumber(raw.ras) ?? toNumber(raw.RAS) ?? toNumber(raw.RAS_Score),
    interview: toNumber(raw.interview) ?? toNumber(raw.Interview),
    forty: (raw.forty as number | string | undefined) ?? (raw["40"] as number | string | undefined),
    vert: (raw.vert as number | string | undefined) ?? (raw.Vert as number | string | undefined),
    shuttle: (raw.shuttle as number | string | undefined) ?? (raw.Shuttle as number | string | undefined),
    threeCone: (raw.threeCone as number | string | undefined) ?? (raw.ThreeCone as number | string | undefined),
    bench: (raw.bench as number | string | undefined) ?? (raw.Bench as number | string | undefined),
  };
}
