export type ProspectPositionTaxonomy = "SCOUTING" | "DRAFT";

function tokenizePosition(rawPos: string): string[] {
  return String(rawPos ?? "")
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
}

export function normalizeProspectPosition(rawPos: string, taxonomy: ProspectPositionTaxonomy = "SCOUTING"): string {
  const tokens = tokenizePosition(rawPos);
  const tokenSet = new Set(tokens);
  const compact = tokens.join("");

  const hasAny = (...values: string[]) => values.some((v) => tokenSet.has(v));

  let normalized = tokens[0] ?? "ATH";

  if (hasAny("HB", "FB", "RB")) normalized = "RB";
  else if (hasAny("WR")) normalized = "WR";
  else if (hasAny("TE")) normalized = "TE";
  else if (hasAny("QB")) normalized = "QB";
  else if (hasAny("C", "OC", "OG", "G", "IOL", "INTERIOROL")) normalized = "IOL";
  else if (hasAny("OT", "T", "LT", "RT", "OLT")) normalized = "OT";
  else if (hasAny("EDGE", "DE", "RUSH", "ER", "OLBEDGE", "ED")) normalized = "EDGE";
  else if (hasAny("DT", "NT", "IDL", "DI", "INTERIORDL", "IDLINEMAN")) normalized = "DT";
  else if (hasAny("LB", "MLB", "ILB", "OLB")) normalized = "LB";
  else if (hasAny("CB", "DB")) normalized = "CB";
  else if (hasAny("FS", "SS", "SAFETY", "S")) normalized = "S";
  else if (hasAny("K")) normalized = "K";
  else if (hasAny("P")) normalized = "P";

  if (taxonomy === "DRAFT" && (normalized === "OT" || normalized === "IOL")) {
    return "OL";
  }

  return normalized;
}

