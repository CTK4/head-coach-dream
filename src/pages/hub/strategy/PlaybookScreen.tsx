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
import {
  getSchemeDisplayName,
  type DefenseSchemeId,
  type OffenseSchemeId,
} from "./playbooks/schemeDisplay";

import { DEFENSE_SCHEMES, OFFENSE_SCHEMES, canonicalSchemeId, type Side } from "@/lib/schemeCatalog";

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
  const { state, dispatch } = useGame();
  const [side, setSide] = useState<Side>("OFFENSE");

  const coordinator = useMemo(() => findCoordinatorSystem(state, side), [state, side]);
  const coordinatorScheme = useMemo(() => canonicalSchemeId(coordinator.systemRaw, side), [coordinator.systemRaw, side]);
  const activeScheme = useMemo(() => {
    if (side === "OFFENSE") return (state.playbooks?.offensePlaybookId as OffenseSchemeId | undefined) ?? coordinatorScheme;
    return (state.playbooks?.defensePlaybookId as DefenseSchemeId | undefined) ?? coordinatorScheme;
  }, [coordinatorScheme, side, state.playbooks?.defensePlaybookId, state.playbooks?.offensePlaybookId]);
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
                  Active Scheme: <span className="font-semibold text-slate-100">{getSchemeDisplayName(activeScheme)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected ID: <span className="font-mono">{side === "OFFENSE" ? state.playbooks?.offensePlaybookId ?? "(unset)" : state.playbooks?.defensePlaybookId ?? "(unset)"}</span>
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
                      {isActive ? <Badge className="bg-accent text-black">ACTIVE</Badge> : <button className="rounded border border-white/20 px-2 py-0.5 text-[10px]" onClick={() => dispatch({ type: "SET_PLAYBOOK", payload: { side, playbookId: scheme.id } })}>SELECT</button>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{scheme.description}</div>
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
