import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/context/GameContext";

import AIR_RAID from "./playbooks/offense/AIR_RAID";
import SHANAHAN_WIDE_ZONE from "./playbooks/offense/SHANAHAN_WIDE_ZONE";
import VERTICAL_PASSING from "./playbooks/offense/VERTICAL_PASSING";
import PRO_STYLE_BALANCED from "./playbooks/offense/PRO_STYLE_BALANCED";
import POWER_GAP from "./playbooks/offense/POWER_GAP";
import ERHARDT_PERKINS from "./playbooks/offense/ERHARDT_PERKINS";
import RUN_AND_SHOOT from "./playbooks/offense/RUN_AND_SHOOT";
import SPREAD_RPO from "./playbooks/offense/SPREAD_RPO";
import WEST_COAST from "./playbooks/offense/WEST_COAST";
import AIR_CORYELL from "./playbooks/offense/AIR_CORYELL";
import MODERN_TRIPLE_OPTION from "./playbooks/offense/MODERN_TRIPLE_OPTION";
import CHIP_KELLY_RPO from "./playbooks/offense/CHIP_KELLY_RPO";
import TWO_TE_POWER_I from "./playbooks/offense/TWO_TE_POWER_I";
import MOTION_BASED_MISDIRECTION from "./playbooks/offense/MOTION_BASED_MISDIRECTION";
import POWER_SPREAD from "./playbooks/offense/POWER_SPREAD";

import THREE_FOUR_TWO_GAP from "./playbooks/defense/THREE_FOUR_TWO_GAP";
import FOUR_TWO_FIVE from "./playbooks/defense/FOUR_TWO_FIVE";
import SEATTLE_COVER_3 from "./playbooks/defense/SEATTLE_COVER_3";
import COVER_SIX from "./playbooks/defense/COVER_SIX";
import FANGIO_TWO_HIGH from "./playbooks/defense/FANGIO_TWO_HIGH";
import TAMPA_2 from "./playbooks/defense/TAMPA_2";
import MULTIPLE_HYBRID from "./playbooks/defense/MULTIPLE_HYBRID";
import CHAOS_FRONT from "./playbooks/defense/CHAOS_FRONT";
import PHILLIPS_BASE_THREE_FOUR from "./playbooks/defense/PHILLIPS_BASE_THREE_FOUR";
import LEBEAU_ZONE_BLITZ_THREE_FOUR from "./playbooks/defense/LEBEAU_ZONE_BLITZ_THREE_FOUR";
import BEARS_FOUR_SIX from "./playbooks/defense/BEARS_FOUR_SIX";
import FOUR_THREE_OVER from "./playbooks/defense/FOUR_THREE_OVER";
import SINGLE_HIGH_COVER_3 from "./playbooks/defense/SINGLE_HIGH_COVER_3";
import SABAN_COVER_4_MATCH from "./playbooks/defense/SABAN_COVER_4_MATCH";
import RYAN_NICKEL_PRESSURE from "./playbooks/defense/RYAN_NICKEL_PRESSURE";

type Side = "OFFENSE" | "DEFENSE";

type OffenseSchemeId =
  | "AIR_RAID"
  | "SHANAHAN_WIDE_ZONE"
  | "VERTICAL_PASSING"
  | "PRO_STYLE_BALANCED"
  | "POWER_GAP"
  | "ERHARDT_PERKINS"
  | "RUN_AND_SHOOT"
  | "SPREAD_RPO"
  | "WEST_COAST"
  | "AIR_CORYELL"
  | "MODERN_TRIPLE_OPTION"
  | "CHIP_KELLY_RPO"
  | "TWO_TE_POWER_I"
  | "MOTION_BASED_MISDIRECTION"
  | "POWER_SPREAD";

type DefenseSchemeId =
  | "THREE_FOUR_TWO_GAP"
  | "FOUR_TWO_FIVE"
  | "SEATTLE_COVER_3"
  | "COVER_SIX"
  | "FANGIO_TWO_HIGH"
  | "TAMPA_2"
  | "MULTIPLE_HYBRID"
  | "CHAOS_FRONT"
  | "PHILLIPS_BASE_THREE_FOUR"
  | "LEBEAU_ZONE_BLITZ_THREE_FOUR"
  | "BEARS_FOUR_SIX"
  | "FOUR_THREE_OVER"
  | "SINGLE_HIGH_COVER_3"
  | "SABAN_COVER_4_MATCH"
  | "RYAN_NICKEL_PRESSURE";

type SchemeMeta = {
  id: OffenseSchemeId | DefenseSchemeId;
  label: string;
  description: string;
  tags: string[];
  playMix?: { run: number; pass: number };
};

const OFFENSE_SCHEMES: SchemeMeta[] = [
  { id: "AIR_RAID", label: "Air Raid", description: "Spread passing system with quick rhythm and spacing.", tags: ["Pass Heavy", "Tempo", "Spacing"], playMix: { pass: 30, run: 10 } },
  { id: "SHANAHAN_WIDE_ZONE", label: "Shanahan Wide Zone", description: "Outside-zone core with heavy motion and layered play-action.", tags: ["Wide Zone", "Motion", "Play-Action"], playMix: { run: 20, pass: 20 } },
  { id: "VERTICAL_PASSING", label: "Vertical Passing", description: "Downfield route structures that stress safeties and leverage.", tags: ["Shot Plays", "Deep Routes", "Protection"], playMix: undefined },
  { id: "PRO_STYLE_BALANCED", label: "Pro Style Balanced", description: "Traditional under-center and gun blend with balanced sequencing.", tags: ["Balanced", "Multiple Personnel"], playMix: undefined },
  { id: "POWER_GAP", label: "Power Gap", description: "Gap/power run identity with complementary play-action concepts.", tags: ["Gap Runs", "Physical", "Play-Action"], playMix: { run: 25, pass: 15 } },
  { id: "ERHARDT_PERKINS", label: "Erhardt-Perkins", description: "Concept-based terminology and flexible route adjustments.", tags: ["Concept Language", "Adjustments"], playMix: undefined },
  { id: "RUN_AND_SHOOT", label: "Run and Shoot", description: "Wide spread with option routes and post-snap receiver adjustments.", tags: ["Option Routes", "Spread"], playMix: undefined },
  { id: "SPREAD_RPO", label: "Spread RPO", description: "Conflict-defender reads blending run game and quick passing.", tags: ["RPO", "Spread", "Reads"], playMix: { run: 20, pass: 20 } },
  { id: "WEST_COAST", label: "West Coast", description: "Timing and rhythm passing with run-game complements.", tags: ["Timing", "YAC", "Rhythm"], playMix: { pass: 25, run: 15 } },
  { id: "AIR_CORYELL", label: "Air Coryell", description: "Route tree built around vertical stretches and deep-intermediate timing.", tags: ["Vertical", "Intermediate", "Route Tree"], playMix: undefined },
  { id: "MODERN_TRIPLE_OPTION", label: "Modern Triple Option", description: "Gun option framework with QB run conflict and perimeter stress.", tags: ["Option", "QB Run", "Constraint Plays"], playMix: undefined },
  { id: "CHIP_KELLY_RPO", label: "Chip Kelly RPO", description: "Tempo-driven spread menu with packaged plays and fast pace.", tags: ["Tempo", "RPO", "Space"], playMix: undefined },
  { id: "TWO_TE_POWER_I", label: "Two TE Power I", description: "Heavy personnel downhill run system with max-protection shots.", tags: ["Heavy Personnel", "Power I"], playMix: undefined },
  { id: "MOTION_BASED_MISDIRECTION", label: "Motion-Based Misdirection", description: "Pre-snap movement and eye candy to create leverage.", tags: ["Motion", "Misdirection", "Shifts"], playMix: undefined },
  { id: "POWER_SPREAD", label: "Power Spread", description: "Spread sets paired with physical downhill run concepts.", tags: ["Spread", "Power", "Hybrid"], playMix: undefined },
];

const DEFENSE_SCHEMES: SchemeMeta[] = [
  { id: "THREE_FOUR_TWO_GAP", label: "3-4 Two-Gap", description: "Two-gapping front mechanics designed to keep linebackers clean.", tags: ["3-4", "Two-Gap", "Front Control"] },
  { id: "FOUR_TWO_FIVE", label: "4-2-5", description: "Nickel base with speed on the field and versatile overhang usage.", tags: ["Nickel", "Speed", "Versatility"] },
  { id: "SEATTLE_COVER_3", label: "Seattle Cover 3", description: "Single-high zone family with strong perimeter run support rules.", tags: ["Cover 3", "Single High", "Run Support"] },
  { id: "COVER_SIX", label: "Cover 6", description: "Quarter-quarter-half split-field coverages for matchup control.", tags: ["Split Field", "Quarters", "Halves"] },
  { id: "FANGIO_TWO_HIGH", label: "Fangio Two-High", description: "Two-high shell structure with disguised rotations and leverage.", tags: ["Two-High", "Match Zones", "Disguise"] },
  { id: "TAMPA_2", label: "Tampa 2", description: "Classic two-deep shell with MLB seam-drop responsibilities.", tags: ["Tampa", "Middle Run Through", "Zone"] },
  { id: "MULTIPLE_HYBRID", label: "Multiple Hybrid", description: "Flexible front/coverage menu tailored by opponent game plans.", tags: ["Multiple", "Hybrid", "Gameplan"] },
  { id: "CHAOS_FRONT", label: "Chaos Front", description: "Movement-driven fronts and pressure looks to stress protections.", tags: ["Movement", "Pressure", "Disruption"] },
  { id: "PHILLIPS_BASE_THREE_FOUR", label: "Phillips Base 3-4", description: "One-gap 3-4 principles with aggressive edge play.", tags: ["Phillips", "3-4", "One-Gap"] },
  { id: "LEBEAU_ZONE_BLITZ_THREE_FOUR", label: "LeBeau Zone Blitz 3-4", description: "Fire-zone concepts with simulated pressures from 3-4 roots.", tags: ["Zone Blitz", "Fire Zone", "3-4"] },
  { id: "BEARS_FOUR_SIX", label: "Bears 4-6", description: "Pressure-heavy bear front package for downhill disruption.", tags: ["Bear Front", "Pressure", "Run Fits"] },
  { id: "FOUR_THREE_OVER", label: "4-3 Over", description: "Traditional 4-3 over alignment with strong-side front declarations.", tags: ["4-3", "Over Front", "Structure"] },
  { id: "SINGLE_HIGH_COVER_3", label: "Single-High Cover 3", description: "Generic single-high Cover 3 bucket when Seattle-specific tags are absent.", tags: ["Cover 3", "Single High"] },
  { id: "SABAN_COVER_4_MATCH", label: "Saban Cover 4 Match", description: "Pattern-match quarters with matchup conversion rules.", tags: ["Match", "Quarters", "Pattern Read"] },
  { id: "RYAN_NICKEL_PRESSURE", label: "Ryan Nickel Pressure", description: "Pressure-oriented nickel ecosystem with overload and mug looks.", tags: ["Nickel", "Pressure", "Sim Pressures"] },
];

const OFFENSE_COMPONENTS: Record<OffenseSchemeId, () => JSX.Element> = {
  AIR_RAID,
  SHANAHAN_WIDE_ZONE,
  VERTICAL_PASSING,
  PRO_STYLE_BALANCED,
  POWER_GAP,
  ERHARDT_PERKINS,
  RUN_AND_SHOOT,
  SPREAD_RPO,
  WEST_COAST,
  AIR_CORYELL,
  MODERN_TRIPLE_OPTION,
  CHIP_KELLY_RPO,
  TWO_TE_POWER_I,
  MOTION_BASED_MISDIRECTION,
  POWER_SPREAD,
};

const DEFENSE_COMPONENTS: Record<DefenseSchemeId, () => JSX.Element> = {
  THREE_FOUR_TWO_GAP,
  FOUR_TWO_FIVE,
  SEATTLE_COVER_3,
  COVER_SIX,
  FANGIO_TWO_HIGH,
  TAMPA_2,
  MULTIPLE_HYBRID,
  CHAOS_FRONT,
  PHILLIPS_BASE_THREE_FOUR,
  LEBEAU_ZONE_BLITZ_THREE_FOUR,
  BEARS_FOUR_SIX,
  FOUR_THREE_OVER,
  SINGLE_HIGH_COVER_3,
  SABAN_COVER_4_MATCH,
  RYAN_NICKEL_PRESSURE,
};

function tokenize(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[\u2013\u2014-]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function includesAny(s: string, values: string[]): boolean {
  return values.some((v) => s.includes(v));
}

function canonicalSchemeId(raw: unknown, side: Side): OffenseSchemeId | DefenseSchemeId {
  const s = tokenize(raw);

  if (side === "OFFENSE") {
    if (includesAny(s, ["AIR_RAID", "AIRRAID"])) return "AIR_RAID";
    if (includesAny(s, ["SHANAHAN", "WIDE_ZONE", "OUTSIDE_ZONE"])) return "SHANAHAN_WIDE_ZONE";
    if (s.includes("VERTICAL")) return "VERTICAL_PASSING";
    if (s.includes("PRO_STYLE") || (s.includes("PRO") && s.includes("BALANCED"))) return "PRO_STYLE_BALANCED";
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

function deepGet(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

function toNonEmptyString(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  return value.length ? value : undefined;
}

function getSystemString(value: unknown): string | undefined {
  if (typeof value === "string") return toNonEmptyString(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return toNonEmptyString(record.system) ?? toNonEmptyString(record.scheme) ?? toNonEmptyString(record.systemId);
  }
  return undefined;
}

function getCoachName(value: unknown): string | undefined {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return toNonEmptyString(record.name) ?? toNonEmptyString(record.coachName);
  }
  return undefined;
}

function findCoordinatorSystem(state: unknown, side: Side): { systemRaw: string; source: string; coachName: string } {
  const role = side === "OFFENSE" ? "OC" : "DC";
  const defaultName = side === "OFFENSE" ? "Offensive Coordinator" : "Defensive Coordinator";

  const checks: Array<{ systemPath: string; namePath?: string }> = [
    { systemPath: `staff.coordinators.${role}.system`, namePath: `staff.coordinators.${role}.name` },
    { systemPath: `staff.coordinators.${role}.scheme`, namePath: `staff.coordinators.${role}.name` },
    { systemPath: `staff.coordinators.${role}.systemId`, namePath: `staff.coordinators.${role}.name` },
    { systemPath: `staff.hires.${role}.system`, namePath: `staff.hires.${role}.name` },
    { systemPath: `staff.hires.${role}.scheme`, namePath: `staff.hires.${role}.name` },
    { systemPath: `staff.hires.${role}.systemId`, namePath: `staff.hires.${role}.name` },
    { systemPath: `staff.staffByRole.${role}.system`, namePath: `staff.staffByRole.${role}.name` },
    { systemPath: `staff.staffByRole.${role}.scheme`, namePath: `staff.staffByRole.${role}.name` },
    { systemPath: `staff.staffByRole.${role}.systemId`, namePath: `staff.staffByRole.${role}.name` },
    { systemPath: side === "OFFENSE" ? "staff.ocSystem" : "staff.dcSystem" },
  ];

  for (const check of checks) {
    const raw = getSystemString(deepGet(state, check.systemPath));
    if (raw) {
      const coachName = toNonEmptyString(check.namePath ? deepGet(state, check.namePath) : undefined) ?? defaultName;
      return { systemRaw: raw, source: check.systemPath, coachName };
    }
  }

  const containerPaths = [`staff.coordinators.${role}`, `staff.hires.${role}`, `staff.staffByRole.${role}`];
  for (const containerPath of containerPaths) {
    const container = deepGet(state, containerPath);
    const raw = getSystemString(container);
    if (raw) {
      return { systemRaw: raw, source: containerPath, coachName: getCoachName(container) ?? defaultName };
    }
  }

  const fallbackPath = side === "OFFENSE" ? "scheme.offense.style" : "scheme.defense.style";
  return {
    systemRaw: toNonEmptyString(deepGet(state, fallbackPath)) ?? (side === "OFFENSE" ? "PRO_STYLE_BALANCED" : "MULTIPLE_HYBRID"),
    source: fallbackPath,
    coachName: defaultName,
  };
}

function MixBar({ run, pass }: { run: number; pass: number }) {
  const total = Math.max(1, run + pass);
  const runPct = Math.round((run / total) * 100);
  const passPct = 100 - runPct;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Run {run}</span>
        <span>Pass {pass}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-2 bg-emerald-500" style={{ width: `${runPct}%` }} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-2 bg-sky-500" style={{ width: `${passPct}%` }} />
      </div>
    </div>
  );
}

export default function PlaybookScreen() {
  const { state } = useGame();
  const [side, setSide] = useState<Side>("OFFENSE");

  const coordinator = useMemo(() => findCoordinatorSystem(state, side), [state, side]);
  const activeScheme = useMemo(() => canonicalSchemeId(coordinator.systemRaw, side), [coordinator.systemRaw, side]);
  const schemes = side === "OFFENSE" ? OFFENSE_SCHEMES : DEFENSE_SCHEMES;
  const meta = schemes.find((scheme) => scheme.id === activeScheme) ?? schemes[0];

  const playbookNode = useMemo(() => {
    if (side === "OFFENSE") {
      const Component = OFFENSE_COMPONENTS[activeScheme as OffenseSchemeId];
      return <Component />;
    }
    const Component = DEFENSE_COMPONENTS[activeScheme as DefenseSchemeId];
    return <Component />;
  }, [activeScheme, side]);

  return (
    <div className="min-w-0">
      <ScreenHeader title="PLAYBOOKS" subtitle="Coordinator-driven canonical playbook library" showBack />
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <Tabs value={side} onValueChange={(value) => setSide(value as Side)}>
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="OFFENSE">
                  Offense
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="DEFENSE">
                  Defense
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  Canonical ID: <span className="font-mono text-slate-100">{activeScheme}</span>
                </div>
                <div>
                  {side === "OFFENSE" ? "OC" : "DC"}: <span className="font-semibold">{coordinator.coachName}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Source: <span className="font-mono">{coordinator.source}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Raw system: <span className="font-mono">{coordinator.systemRaw}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Coordinator Notes</CardTitle>
                  <Badge variant="secondary">{meta.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{meta.description}</p>
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {side === "OFFENSE" ? (
                  <div>
                    <div className="mb-1 text-xs font-semibold">Play Mix Target</div>
                    {meta.playMix ? <MixBar run={meta.playMix.run} pass={meta.playMix.pass} /> : <div className="text-xs text-muted-foreground">—</div>}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-2 md:grid-cols-2">
              {schemes.map((scheme) => {
                const isActive = scheme.id === activeScheme;
                return (
                  <div
                    key={scheme.id}
                    className={`rounded-lg border p-3 ${isActive ? "border-accent bg-accent/10" : "border-white/10 bg-white/5"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm">{scheme.label}</div>
                      {isActive ? <Badge className="bg-accent text-black">ACTIVE</Badge> : null}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">{scheme.id}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">{playbookNode}</div>
      </div>
    </div>
  );
}
