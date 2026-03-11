import { COMBINE_DAY_POSITION_BUCKETS } from "@/engine/scouting/combineConstants";

export function normalizeCombinePosition(pos: string): string {
  const p = String(pos || "").toUpperCase();
  if (["DE", "OLB"].includes(p)) return "EDGE";
  if (["DT", "NT"].includes(p)) return "DT";
  if (["ILB", "MLB"].includes(p)) return "LB";
  if (["FS", "SS"].includes(p)) return "S";
  if (["G"].includes(p)) return "OG";
  if (["T"].includes(p)) return "OT";
  return p;
}

export function combineDayForPosition(pos: string): 1 | 2 | 3 | 4 {
  const normalized = normalizeCombinePosition(pos);
  for (const [day, bucket] of Object.entries(COMBINE_DAY_POSITION_BUCKETS)) {
    if ((bucket.positions as readonly string[]).includes(normalized)) return Number(day) as 1 | 2 | 3 | 4;
  }
  return 2;
}
