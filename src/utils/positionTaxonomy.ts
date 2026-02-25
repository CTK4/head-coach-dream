const EDGE_VARIANTS = new Set([
  "EDGE",
  "DE",
  "LE",
  "RE",
  "RUSH",
  "RUSHLB",
  "RUSH-LB",
  "OLB/EDGE",
  "EDGE/OLB",
  "DE/OLB",
  "OLB-DE",
]);

const DT_VARIANTS = new Set(["DT", "IDL", "DI", "NT", "NOSE", "DL", "DLT"]);

export function normalizeScoutingDraftPosition(rawPos: string): string {
  const pos = String(rawPos ?? "").trim().toUpperCase();
  if (!pos) return "UNK";

  if (pos === "HB" || pos === "FB") return "RB";
  if (["OG", "G", "C", "IOL", "OC"].includes(pos)) return "IOL";
  if (["OT", "T", "LT", "RT"].includes(pos)) return "OT";
  if (["OL", "OLINE"].includes(pos)) return "OL";
  if (["FS", "SS", "SAF", "SAFETY"].includes(pos)) return "S";

  if (DT_VARIANTS.has(pos)) return "DT";
  if (EDGE_VARIANTS.has(pos) || pos.includes("EDGE") || pos === "OLB") return "EDGE";

  return pos;
}

