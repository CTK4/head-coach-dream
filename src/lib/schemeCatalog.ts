import { getSchemeDisplayName, type DefenseSchemeId, type OffenseSchemeId, type SchemeId } from "@/pages/hub/strategy/playbooks/schemeDisplay";

export type Side = "OFFENSE" | "DEFENSE";

type SchemeMetaBase = {
  label: string;
  description: string;
  tags: string[];
};

export type SchemeMeta = SchemeMetaBase & {
  id: SchemeId;
  playMix?: { run: number; pass: number };
};

export const OFFENSE_SCHEMES: Array<SchemeMeta & { id: OffenseSchemeId }> = [
  { id: "AIR_RAID", label: getSchemeDisplayName("AIR_RAID"), description: "Spread passing system with quick rhythm and spacing.", tags: ["Pass Heavy", "Tempo", "Spacing"], playMix: { pass: 30, run: 10 } },
  { id: "SHANAHAN_WIDE_ZONE", label: getSchemeDisplayName("SHANAHAN_WIDE_ZONE"), description: "Outside-zone core with heavy motion and layered play-action.", tags: ["Wide Zone", "Motion", "Play-Action"], playMix: { run: 20, pass: 20 } },
  { id: "VERTICAL_PASSING", label: getSchemeDisplayName("VERTICAL_PASSING"), description: "Downfield route structures that stress safeties and leverage.", tags: ["Shot Plays", "Deep Routes", "Protection"] },
  { id: "PRO_STYLE_BALANCED", label: getSchemeDisplayName("PRO_STYLE_BALANCED"), description: "Traditional under-center and gun blend with balanced sequencing.", tags: ["Balanced", "Multiple Personnel"] },
  { id: "POWER_GAP", label: getSchemeDisplayName("POWER_GAP"), description: "Gap/power run identity with complementary play-action concepts.", tags: ["Gap Runs", "Physical", "Play-Action"], playMix: { run: 25, pass: 15 } },
  { id: "ERHARDT_PERKINS", label: getSchemeDisplayName("ERHARDT_PERKINS"), description: "Concept-based terminology and flexible route adjustments.", tags: ["Concept Language", "Adjustments"] },
  { id: "RUN_AND_SHOOT", label: getSchemeDisplayName("RUN_AND_SHOOT"), description: "Wide spread with option routes and post-snap receiver adjustments.", tags: ["Option Routes", "Spread"] },
  { id: "SPREAD_RPO", label: getSchemeDisplayName("SPREAD_RPO"), description: "Conflict-defender reads blending run game and quick passing.", tags: ["RPO", "Spread", "Reads"], playMix: { run: 20, pass: 20 } },
  { id: "WEST_COAST", label: getSchemeDisplayName("WEST_COAST"), description: "Timing and rhythm passing with run-game complements.", tags: ["Timing", "YAC", "Rhythm"], playMix: { pass: 25, run: 15 } },
  { id: "AIR_CORYELL", label: getSchemeDisplayName("AIR_CORYELL"), description: "Route tree built around vertical stretches and deep-intermediate timing.", tags: ["Vertical", "Intermediate", "Route Tree"] },
  { id: "MODERN_TRIPLE_OPTION", label: getSchemeDisplayName("MODERN_TRIPLE_OPTION"), description: "Gun option framework with QB run conflict and perimeter stress.", tags: ["Option", "QB Run", "Constraint Plays"] },
  { id: "CHIP_KELLY_RPO", label: getSchemeDisplayName("CHIP_KELLY_RPO"), description: "Tempo-driven spread menu with packaged plays and fast pace.", tags: ["Tempo", "RPO", "Space"] },
  { id: "TWO_TE_POWER_I", label: getSchemeDisplayName("TWO_TE_POWER_I"), description: "Heavy personnel downhill run system with max-protection shots.", tags: ["Heavy Personnel", "Power I"] },
  { id: "MOTION_BASED_MISDIRECTION", label: getSchemeDisplayName("MOTION_BASED_MISDIRECTION"), description: "Pre-snap movement and eye candy to create leverage.", tags: ["Motion", "Misdirection", "Shifts"] },
  { id: "POWER_SPREAD", label: getSchemeDisplayName("POWER_SPREAD"), description: "Spread spacing married to power-run answers and constraint tags.", tags: ["Spread", "Power", "Constraint"] },
];

export const DEFENSE_SCHEMES: Array<SchemeMeta & { id: DefenseSchemeId }> = [
  { id: "THREE_FOUR_TWO_GAP", label: getSchemeDisplayName("THREE_FOUR_TWO_GAP"), description: "Odd-front control structure built on two-gapping interior defenders.", tags: ["3-4", "Two-Gap", "Control"] },
  { id: "FOUR_TWO_FIVE", label: getSchemeDisplayName("FOUR_TWO_FIVE"), description: "Nickel base built for spread offenses and flexible coverage rotations.", tags: ["4-2-5", "Nickel", "Spread Answers"] },
  { id: "SEATTLE_COVER_3", label: getSchemeDisplayName("SEATTLE_COVER_3"), description: "Single-high zone foundation with fast flow and pattern leverage.", tags: ["Cover 3", "Single High", "Zone"] },
  { id: "COVER_SIX", label: getSchemeDisplayName("COVER_SIX"), description: "Quarter-quarter-half split-field coverage with matchup flexibility.", tags: ["Split Field", "Cover 6", "Matchups"] },
  { id: "FANGIO_TWO_HIGH", label: getSchemeDisplayName("FANGIO_TWO_HIGH"), description: "Two-high shell with disguise, match zones, and explosive-play prevention.", tags: ["Two-High", "Disguise", "Match Zones"] },
  { id: "TAMPA_2", label: getSchemeDisplayName("TAMPA_2"), description: "Cover-2 structure with MLB vertical carry and rally tackling.", tags: ["Tampa 2", "Zone Drops", "Rally"] },
  { id: "MULTIPLE_HYBRID", label: getSchemeDisplayName("MULTIPLE_HYBRID"), description: "Gameplan-driven multiplicity toggling fronts and coverages by opponent.", tags: ["Multiple", "Hybrid", "Gameplan"] },
  { id: "CHAOS_FRONT", label: getSchemeDisplayName("CHAOS_FRONT"), description: "Movement-heavy front designed to create negative plays and confusion.", tags: ["Movement", "Pressure", "Disruption"] },
  { id: "PHILLIPS_BASE_THREE_FOUR", label: getSchemeDisplayName("PHILLIPS_BASE_THREE_FOUR"), description: "Classic one-gap 3-4 with edge pressure principles.", tags: ["3-4", "One-Gap", "Edge Pressure"] },
  { id: "LEBEAU_ZONE_BLITZ_THREE_FOUR", label: getSchemeDisplayName("LEBEAU_ZONE_BLITZ_THREE_FOUR"), description: "Fire-zone pressure package from odd fronts with simulated rush looks.", tags: ["Zone Blitz", "Fire Zones", "Pressure"] },
  { id: "BEARS_FOUR_SIX", label: getSchemeDisplayName("BEARS_FOUR_SIX"), description: "Loaded box run-denial system emphasizing force and leverage.", tags: ["4-6", "Run Fits", "Loaded Box"] },
  { id: "FOUR_THREE_OVER", label: getSchemeDisplayName("FOUR_THREE_OVER"), description: "Even-front structure tilting strength and run-fit clarity.", tags: ["4-3", "Over Front", "Run Fits"] },
  { id: "SINGLE_HIGH_COVER_3", label: getSchemeDisplayName("SINGLE_HIGH_COVER_3"), description: "Middle-closed coverage with simple rotations and fast trigger rules.", tags: ["Single High", "Cover 3", "Middle Closed"] },
  { id: "SABAN_COVER_4_MATCH", label: getSchemeDisplayName("SABAN_COVER_4_MATCH"), description: "Pattern-match quarters with leverage rules and route distribution checks.", tags: ["Cover 4", "Match", "Pattern Rules"] },
  { id: "RYAN_NICKEL_PRESSURE", label: getSchemeDisplayName("RYAN_NICKEL_PRESSURE"), description: "Aggressive pressure identity from nickel personnel and overload looks.", tags: ["Nickel", "Pressure", "Overloads"] },
];

const SCHEME_META_BY_ID: Record<SchemeId, SchemeMetaBase> = [...OFFENSE_SCHEMES, ...DEFENSE_SCHEMES].reduce((acc, scheme) => {
  acc[scheme.id] = { label: scheme.label, description: scheme.description, tags: scheme.tags };
  return acc;
}, {} as Record<SchemeId, SchemeMetaBase>);

function tokenize(raw: unknown): string {
  if (typeof raw === "string") return raw.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  if (raw && typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const first = rec.system ?? rec.scheme ?? rec.systemId ?? rec.id;
    if (typeof first === "string") return first.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  }
  return "";
}

function includesAny(s: string, values: string[]): boolean {
  return values.some((v) => s.includes(v));
}

export function canonicalSchemeId(raw: unknown, side: Side): SchemeId {
  const s = tokenize(raw);

  if (side === "OFFENSE") {
    if (includesAny(s, ["AIR_RAID", "AIRRAID"])) return "AIR_RAID";
    if (includesAny(s, ["SHANAHAN", "WIDE_ZONE", "OUTSIDE_ZONE"])) return "SHANAHAN_WIDE_ZONE";
    if (s.includes("VERTICAL")) return "VERTICAL_PASSING";
    if (s.includes("PRO_STYLE") || s.includes("PROSTYLE") || s.includes("BALANCED")) return "PRO_STYLE_BALANCED";
    if (s.includes("POWER_GAP") || (s.includes("POWER") && s.includes("GAP"))) return "POWER_GAP";
    if (s.includes("ERHARDT") || s.includes("PERKINS")) return "ERHARDT_PERKINS";
    if (s.includes("RUN_AND_SHOOT") || (s.includes("RUN") && s.includes("SHOOT"))) return "RUN_AND_SHOOT";
    if (s.includes("SPREAD") && s.includes("RPO")) return "SPREAD_RPO";
    if (s.includes("WEST_COAST") || s.includes("WALSH")) return "WEST_COAST";
    if (s.includes("CORYELL")) return "AIR_CORYELL";
    if (s.includes("TRIPLE_OPTION")) return "MODERN_TRIPLE_OPTION";
    if (s.includes("CHIP") || (s.includes("KELLY") && s.includes("RPO"))) return "CHIP_KELLY_RPO";
    if (s.includes("TWO") && s.includes("TE") && (s.includes("POWER") || s.includes("I"))) return "TWO_TE_POWER_I";
    if (s.includes("MOTION") && (s.includes("MISDIRECTION") || s.includes("SHIFT"))) return "MOTION_BASED_MISDIRECTION";
    if (s.includes("POWER") && s.includes("SPREAD")) return "POWER_SPREAD";
    return "PRO_STYLE_BALANCED";
  }

  if (s.includes("SEATTLE") || s.includes("CARROLL")) return "SEATTLE_COVER_3";
  if (s.includes("SINGLE") || s.includes("SINGLE_HIGH")) return "SINGLE_HIGH_COVER_3";
  if (s.includes("COVER_3") || s.includes("COVER3")) return "SINGLE_HIGH_COVER_3";
  if (s.includes("FANGIO") || s.includes("TWO_HIGH") || s.includes("2_HIGH")) return "FANGIO_TWO_HIGH";
  if (s.includes("COVER_6") || s.includes("COVER6") || s.includes("SIX")) return "COVER_SIX";
  if (s.includes("TAMPA") && s.includes("2")) return "TAMPA_2";
  if (s.includes("RYAN") || s.includes("NICKEL_PRESSURE")) return "RYAN_NICKEL_PRESSURE";
  if (s.includes("SABAN") || s.includes("MATCH") || s.includes("COVER_4")) return "SABAN_COVER_4_MATCH";
  if (s.includes("LEBEAU") || s.includes("ZONE_BLITZ")) return "LEBEAU_ZONE_BLITZ_THREE_FOUR";
  if (s.includes("PHILLIPS")) return "PHILLIPS_BASE_THREE_FOUR";
  if (s.includes("CHAOS")) return "CHAOS_FRONT";
  if (s.includes("MULTIPLE") || s.includes("HYBRID")) return "MULTIPLE_HYBRID";
  if (s.includes("4_6") || s.includes("BEARS")) return "BEARS_FOUR_SIX";
  if (s.includes("4_3") && s.includes("OVER")) return "FOUR_THREE_OVER";
  if (s.includes("4_2_5") || s.includes("425")) return "FOUR_TWO_FIVE";
  if (s.includes("3_4") && (s.includes("TWO_GAP") || s.includes("TWOGAP"))) return "THREE_FOUR_TWO_GAP";
  return "MULTIPLE_HYBRID";
}

export function getSchemeMeta(schemeId: SchemeId): { label: string; tags: string[]; description: string } {
  return SCHEME_META_BY_ID[schemeId];
}
