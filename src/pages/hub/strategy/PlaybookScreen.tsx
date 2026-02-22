import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/context/GameContext";
import AirRaidPlaybook from "./playbooks/AirRaidPlaybook";
import ShanahanWideZonePlaybook from "./playbooks/ShanahanWideZonePlaybook";

type Side = "OFFENSE" | "DEFENSE";

export type OffenseSchemeId =
  | "SHANAHAN_WIDE_ZONE"
  | "AIR_RAID"
  | "WEST_COAST"
  | "POWER_GAP"
  | "SPREAD_RPO";

export type DefenseSchemeId =
  | "FANGIO_TWO_HIGH"
  | "COVER_3_CARROLL"
  | "TAMPA_2"
  | "THREE_FOUR_TWO_GAP";

function PlaceholderPlaybook({ title, system }: { title: string; system: string }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Detailed install content for <span className="font-medium text-foreground">{system}</span> is coming soon.
        </p>
      </CardContent>
    </Card>
  );
}

function normalizeSystem(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function firstNonEmpty(...vals: unknown[]): string {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function deepGet(obj: any, path: string): unknown {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur) return undefined;
    cur = cur[p];
  }
  return cur;
}

function findCoordinatorSystem(state: any, side: Side): { systemRaw: string; source: string; coachName: string } {
  const role = side === "OFFENSE" ? "OC" : "DC";

  const candidates: Array<{ source: string; value: unknown; name?: unknown }> = [
    { source: `staff.coordinators.${role}.system`, value: deepGet(state, `staff.coordinators.${role}.system`), name: deepGet(state, `staff.coordinators.${role}.name`) },
    { source: `staff.coordinators.${role}.scheme`, value: deepGet(state, `staff.coordinators.${role}.scheme`), name: deepGet(state, `staff.coordinators.${role}.name`) },
    { source: `staff.coordinators.${role}.systemId`, value: deepGet(state, `staff.coordinators.${role}.systemId`), name: deepGet(state, `staff.coordinators.${role}.name`) },
    { source: side === "OFFENSE" ? "staff.oc.system" : "staff.dc.system", value: deepGet(state, side === "OFFENSE" ? "staff.oc.system" : "staff.dc.system"), name: deepGet(state, side === "OFFENSE" ? "staff.oc.name" : "staff.dc.name") },
    { source: side === "OFFENSE" ? "staff.offenseCoordinator.system" : "staff.defenseCoordinator.system", value: deepGet(state, side === "OFFENSE" ? "staff.offenseCoordinator.system" : "staff.defenseCoordinator.system"), name: deepGet(state, side === "OFFENSE" ? "staff.offenseCoordinator.name" : "staff.defenseCoordinator.name") },
    { source: `staff.hires.${role}.system`, value: deepGet(state, `staff.hires.${role}.system`), name: deepGet(state, `staff.hires.${role}.name`) },
    { source: `staff.hires.${role}.scheme`, value: deepGet(state, `staff.hires.${role}.scheme`), name: deepGet(state, `staff.hires.${role}.name`) },
    { source: `staff.hired.${role}.system`, value: deepGet(state, `staff.hired.${role}.system`), name: deepGet(state, `staff.hired.${role}.name`) },
    { source: `staff.roles.${role}.system`, value: deepGet(state, `staff.roles.${role}.system`), name: deepGet(state, `staff.roles.${role}.name`) },
    { source: `staff.staffByRole.${role}.system`, value: deepGet(state, `staff.staffByRole.${role}.system`), name: deepGet(state, `staff.staffByRole.${role}.name`) },
    { source: side === "OFFENSE" ? "staff.ocSystem" : "staff.dcSystem", value: deepGet(state, side === "OFFENSE" ? "staff.ocSystem" : "staff.dcSystem"), name: undefined },
  ];

  for (const c of candidates) {
    const raw = firstNonEmpty(c.value);
    if (raw) {
      return {
        systemRaw: raw,
        source: c.source,
        coachName: firstNonEmpty(c.name, side === "OFFENSE" ? "Offensive Coordinator" : "Defensive Coordinator"),
      };
    }
  }

  const fallback = side === "OFFENSE" ? deepGet(state, "scheme.offense.style") : deepGet(state, "scheme.defense.style");
  return {
    systemRaw: firstNonEmpty(fallback, side === "OFFENSE" ? "Air Raid" : "Fangio Two-High"),
    source: side === "OFFENSE" ? "scheme.offense.style" : "scheme.defense.style",
    coachName: side === "OFFENSE" ? "Offensive Coordinator" : "Defensive Coordinator",
  };
}

function canonicalSchemeId(raw: unknown, side: Side): string {
  const s = normalizeSystem(raw);
  if (!s) return side === "OFFENSE" ? "AIR_RAID" : "FANGIO_TWO_HIGH";

  const mapOff: Record<string, OffenseSchemeId> = {
    AIR_RAID: "AIR_RAID",
    AIRRAID: "AIR_RAID",
    AIR_RAID_OFFENSE: "AIR_RAID",
    SHANAHAN: "SHANAHAN_WIDE_ZONE",
    SHANAHAN_WIDE_ZONE: "SHANAHAN_WIDE_ZONE",
    WIDE_ZONE: "SHANAHAN_WIDE_ZONE",
    OUTSIDE_ZONE: "SHANAHAN_WIDE_ZONE",
    POWER_ZONE_HYBRID: "SHANAHAN_WIDE_ZONE",
    WEST_COAST: "WEST_COAST",
    WESTCOAST: "WEST_COAST",
    WALSH: "WEST_COAST",
    CLASSIC_WALSH: "WEST_COAST",
    POWER_GAP: "POWER_GAP",
    POWER: "POWER_GAP",
    GAP: "POWER_GAP",
    GAP_POWER: "POWER_GAP",
    SPREAD_RPO: "SPREAD_RPO",
    RPO: "SPREAD_RPO",
    SPREAD: "SPREAD_RPO",
  };

  const mapDef: Record<string, DefenseSchemeId> = {
    FANGIO: "FANGIO_TWO_HIGH",
    FANGIO_TWO_HIGH: "FANGIO_TWO_HIGH",
    TWO_HIGH: "FANGIO_TWO_HIGH",
    "2_HIGH": "FANGIO_TWO_HIGH",
    COVER_3: "COVER_3_CARROLL",
    COVER3: "COVER_3_CARROLL",
    CARROLL: "COVER_3_CARROLL",
    COVER_3_CARROLL: "COVER_3_CARROLL",
    TAMPA_2: "TAMPA_2",
    TAMPA2: "TAMPA_2",
    THREE_FOUR: "THREE_FOUR_TWO_GAP",
    "3_4": "THREE_FOUR_TWO_GAP",
    THREE_FOUR_TWO_GAP: "THREE_FOUR_TWO_GAP",
    TWO_GAP: "THREE_FOUR_TWO_GAP",
  };

  if (side === "OFFENSE") return mapOff[s] ?? "AIR_RAID";
  return mapDef[s] ?? "FANGIO_TWO_HIGH";
}

const OFFENSE_SCHEMES: { id: OffenseSchemeId; label: string; description: string; balance: string; tags: string[] }[] = [
  {
    id: "SHANAHAN_WIDE_ZONE",
    label: "Shanahan Wide Zone",
    description: "Balanced zone runs + play-action; heavy motion; outside-zone emphasis.",
    balance: "Run 20 / Pass 20",
    tags: ["Motion", "Outside Zone", "Play-Action", "Balanced"],
  },
  {
    id: "AIR_RAID",
    label: "Air Raid",
    description: "Pass-heavy, quick reads, spacing, tempo; simplified run to enable pass.",
    balance: "Pass 30 / Run 10",
    tags: ["Tempo", "Spacing", "Quick Reads", "Pass Heavy"],
  },
  {
    id: "WEST_COAST",
    label: "West Coast (Walsh)",
    description: "Timing routes; short-to-intermediate progressions; YAC emphasis.",
    balance: "Pass 25 / Run 15",
    tags: ["Timing", "YAC", "Progressions"],
  },
  {
    id: "POWER_GAP",
    label: "Power/Gap",
    description: "Traditional gap-power run concepts; play-action off run success.",
    balance: "Run 25 / Pass 15",
    tags: ["Gap", "Power", "Play-Action", "Run Heavy"],
  },
  {
    id: "SPREAD_RPO",
    label: "Spread RPO",
    description: "Run/pass decision at the line; spacing + tempo; balanced.",
    balance: "Run 20 / Pass 20",
    tags: ["RPO", "Tempo", "Spacing", "Reads"],
  },
];

const DEFENSE_SCHEMES: { id: DefenseSchemeId; label: string; description: string; tags: string[] }[] = [
  {
    id: "FANGIO_TWO_HIGH",
    label: "Fangio Two-High",
    description: "Two-deep shells; zone integrity; run support; explosive prevention.",
    tags: ["Two-High", "Zone", "Explosive Control"],
  },
  {
    id: "COVER_3_CARROLL",
    label: "Cover 3 (Carroll)",
    description: "Three deep zones; strong perimeter rules; explosive reduction.",
    tags: ["Cover 3", "Perimeter", "Explosive Control"],
  },
  {
    id: "TAMPA_2",
    label: "Tampa 2",
    description: "Two deep + MLB hole player; strong run-fit zones; ball disruption.",
    tags: ["Tampa 2", "MLB Hole", "Run Fits"],
  },
  {
    id: "THREE_FOUR_TWO_GAP",
    label: "3–4 Two-Gap",
    description: "Two-gap control up front; internal anchors free linebackers.",
    tags: ["3-4", "Two-Gap", "Front Control"],
  },
];

function resolveOffense(systemIdRaw: string) {
  const systemId = systemIdRaw as OffenseSchemeId;
  const meta = OFFENSE_SCHEMES.find((s) => s.id === systemId);
  return (
    meta ?? {
      id: systemId as any,
      label: systemIdRaw || "UNKNOWN",
      description: "Unknown/legacy offense system.",
      balance: "—",
      tags: [],
    }
  );
}

function resolveDefense(systemIdRaw: string) {
  const systemId = systemIdRaw as DefenseSchemeId;
  const meta = DEFENSE_SCHEMES.find((s) => s.id === systemId);
  return (
    meta ?? {
      id: systemId as any,
      label: systemIdRaw || "UNKNOWN",
      description: "Unknown/legacy defense system.",
      tags: [],
    }
  );
}

function renderOffensePlaybook(systemId: OffenseSchemeId) {
  switch (systemId) {
    case "AIR_RAID":
      return <AirRaidPlaybook />;
    case "SHANAHAN_WIDE_ZONE":
      return <ShanahanWideZonePlaybook />;
    case "WEST_COAST":
    case "POWER_GAP":
    case "SPREAD_RPO":
    default:
      return <PlaceholderPlaybook title="Offense playbook" system={systemId} />;
  }
}

function renderDefensePlaybook(systemId: DefenseSchemeId) {
  return <PlaceholderPlaybook title="Defense playbook" system={systemId} />;
}

function parseBalance(balance: string | undefined): { run: number; pass: number } | null {
  if (!balance) return null;
  const b = balance.toUpperCase();
  const runMatch = b.match(/RUN\s*(\d+)/);
  const passMatch = b.match(/PASS\s*(\d+)/);
  const run = runMatch ? Number(runMatch[1]) : NaN;
  const pass = passMatch ? Number(passMatch[1]) : NaN;
  if (!Number.isFinite(run) || !Number.isFinite(pass)) return null;
  return { run, pass };
}

function MixBar(props: { run: number; pass: number }) {
  const total = Math.max(1, props.run + props.pass);
  const runPct = Math.round((props.run / total) * 100);
  const passPct = 100 - runPct;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="tabular-nums">Run {props.run} ({runPct}%)</span>
        <span className="tabular-nums">Pass {props.pass} ({passPct}%)</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div className="h-full bg-emerald-400/80" style={{ width: `${runPct}%` }} />
        <div className="h-full bg-sky-400/80" style={{ width: `${passPct}%` }} />
      </div>
    </div>
  );
}

export default function PlaybookScreen() {
  const { state } = useGame();
  const [side, setSide] = useState<Side>("OFFENSE");
  const coordinator = useMemo(() => findCoordinatorSystem(state as any, side), [state, side]);
  const systemId = useMemo(() => canonicalSchemeId(coordinator.systemRaw, side), [coordinator.systemRaw, side]);

  const offenseMeta = useMemo(() => resolveOffense(systemId), [systemId]);
  const defenseMeta = useMemo(() => resolveDefense(systemId), [systemId]);

  const meta = side === "OFFENSE" ? offenseMeta : defenseMeta;
  const list = side === "OFFENSE" ? OFFENSE_SCHEMES : DEFENSE_SCHEMES;

  const playbookNode = useMemo(() => {
    if (side === "OFFENSE") return renderOffensePlaybook(systemId as OffenseSchemeId);
    return renderDefensePlaybook(systemId as DefenseSchemeId);
  }, [side, systemId]);

  const mix = useMemo(() => ("balance" in meta ? parseBalance((meta as any).balance) : null), [meta]);

  return (
    <div className="min-w-0">
      <ScreenHeader title="PLAYBOOKS" subtitle="Coordinator-driven systems" />
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Tabs value={side} onValueChange={(v) => setSide(v as Side)}>
              <TabsList className="w-full">
                <TabsTrigger value="OFFENSE" className="flex-1">
                  Offense
                </TabsTrigger>
                <TabsTrigger value="DEFENSE" className="flex-1">
                  Defense
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">Active System</div>
                <div className="text-xs text-muted-foreground truncate">
                  From coordinator: <span className="font-semibold text-slate-200">{systemId}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-1">
                  {side === "OFFENSE" ? "OC" : "DC"}: <span className="font-semibold text-slate-200">{coordinator.coachName}</span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate mt-1">
                  Source: <span className="font-mono">{coordinator.source}</span>
                </div>
              </div>
              <Badge variant="outline">{meta.label}</Badge>
            </div>

            <div className="text-sm text-slate-200">{meta.description}</div>
            {"balance" in meta ? (
              <div className="text-xs text-muted-foreground">Play balance target: {(meta as any).balance}</div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Coordinator Notes</div>
                <Badge variant="secondary">{side === "OFFENSE" ? "OFFENSE" : "DEFENSE"}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(meta as any).tags?.length ? (
                  (meta as any).tags.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-slate-950/40 px-2 py-1 text-[11px] text-slate-200"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No notes yet for this scheme.</span>
                )}
              </div>

              {"balance" in meta ? (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-200 mb-1">Play Mix Target</div>
                  {mix ? <MixBar run={mix.run} pass={mix.pass} /> : <div className="text-xs text-muted-foreground">—</div>}
                </div>
              ) : null}

              <div className="mt-2 text-xs text-muted-foreground">
                MVP rule: playbook display is driven by your coordinator’s system selection.
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {list.map((s) => {
                const active = s.id === (systemId as any);
                return (
                  <div
                    key={s.id}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      active ? "border-accent bg-accent/10" : "border-white/10 bg-white/5"
                    }`}
                    title={active ? "Selected by your coordinator" : "Placeholder (not selectable yet)"}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{s.label}</div>
                      {active ? <Badge className="bg-accent text-black">ACTIVE</Badge> : null}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{"balance" in s ? (s as any).balance : null}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-white/10 overflow-hidden">{playbookNode}</div>
      </div>
    </div>
  );
}
