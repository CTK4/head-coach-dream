import { useMemo, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getTeamRosterPlayers } from "@/data/leagueDb";
import { eligibleRosterForSlot, usedPlayerIds } from "@/engine/depthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical } from "lucide-react";

type Unit = "OFFENSE" | "DEFENSE" | "ST";
type Section = { key: Unit; title: string; slots: string[] };

const SECTIONS: Section[] = [
  { key: "OFFENSE", title: "Offense", slots: ["QB1", "QB2", "QB3", "RB1", "RB2", "RB3", "WR1", "WR2", "WR3", "WR4", "WR5", "TE1", "TE2", "TE3", "LT", "LG", "C", "RG", "RT", "OL6", "OL7"] },
  { key: "DEFENSE", title: "Defense", slots: ["DT1", "DT2", "DL3", "DL4", "EDGE1", "EDGE2", "EDGE3", "LB1", "LB2", "LB3", "CB1", "CB2", "CB3", "CB4", "FS", "SS", "S3"] },
  { key: "ST", title: "Special Teams", slots: ["K", "P"] },
];

const GROUPS: Record<string, string[]> = {
  QB: ["QB1", "QB2", "QB3"],
  RB: ["RB1", "RB2", "RB3"],
  WR: ["WR1", "WR2", "WR3", "WR4", "WR5"],
  TE: ["TE1", "TE2", "TE3"],
  OL: ["LT", "LG", "C", "RG", "RT", "OL6", "OL7"],
  DL: ["DT1", "DT2", "DL3", "DL4"],
  EDGE: ["EDGE1", "EDGE2", "EDGE3"],
  LB: ["LB1", "LB2", "LB3"],
  CB: ["CB1", "CB2", "CB3", "CB4"],
  S: ["FS", "SS", "S3"],
  K: ["K"],
  P: ["P"],
};

function slotGroup(slot: string): string | null {
  for (const [g, slots] of Object.entries(GROUPS)) if (slots.includes(slot)) return g;
  return null;
}

function playerMeta(p: any): string {
  const age = Number(p.age ?? 0);
  const pro = Number(p.years_pro ?? p.yearsPro ?? 0);
  const arch = String(p.Archetype ?? p.archetype_bucket ?? p.archetype ?? "").trim();
  const traits = String(p.Traits ?? p.traits ?? "")
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean)
    .slice(0, 2);
  const bits: string[] = [];
  if (age) bits.push(`Age ${age}`);
  bits.push(`${pro}y pro`);
  if (arch) bits.push(arch);
  if (traits.length) bits.push(traits.join(" · "));
  return bits.join(" · ");
}

function reorderUnlockedOnly(args: {
  startersByPos: Record<string, string | undefined>;
  lockedBySlot?: Record<string, boolean | undefined>;
  groupSlots: string[];
  fromSlot: string;
  toSlot: string;
}): Record<string, string | undefined> | null {
  const { startersByPos, lockedBySlot, groupSlots, fromSlot, toSlot } = args;
  const locked = lockedBySlot ?? {};
  const unlockedSlots = groupSlots.filter((s) => !locked[s]);
  if (!unlockedSlots.includes(fromSlot) || !unlockedSlots.includes(toSlot)) return null;

  const fromIdx = unlockedSlots.indexOf(fromSlot);
  const toIdx = unlockedSlots.indexOf(toSlot);
  if (fromIdx === toIdx) return null;

  const ids = unlockedSlots.map((s) => startersByPos[s]);
  const [moved] = ids.splice(fromIdx, 1);
  ids.splice(toIdx, 0, moved);

  const next = { ...startersByPos };
  for (let i = 0; i < unlockedSlots.length; i += 1) next[unlockedSlots[i]] = ids[i];
  return next;
}

export default function DepthChart() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? (state as any).teamId;
  const activeIds = state.rosterMgmt.active;
  const [unit, setUnit] = useState<Unit>("OFFENSE");
  const dragFromSlot = useRef<string | null>(null);

  const roster = useMemo(() => {
    if (!teamId) return [];
    return getTeamRosterPlayers(teamId)
      .filter((p) => {
        const pid = String((p as any).playerId);
        const hasActive = Object.keys(activeIds ?? {}).length > 0;
        return hasActive ? !!activeIds[pid] : true;
      })
      .map((p) => ({
        id: String((p as any).playerId),
        name: String((p as any).fullName),
        pos: String((p as any).pos ?? "UNK").toUpperCase(),
        ovr: Number((p as any).overall ?? 0),
        raw: p as any,
      }))
      .sort((a, b) => b.ovr - a.ovr);
  }, [teamId, activeIds]);

  if (!teamId) return <HubEmptyState title="Roster not loaded" description="Assign a team to configure your depth chart." action={{ label: "Back to Hub", to: "/hub" }} />;

  const activeSection = SECTIONS.find((s) => s.key === unit) ?? SECTIONS[0];
  const dupes = (() => {
    const counts = new Map<string, number>();
    for (const v of Object.values(state.depthChart.startersByPos)) {
      if (!v) continue;
      counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    return [...counts.values()].filter((c) => c > 1).length;
  })();

  const chosenPlayer = (pid?: string) => roster.find((r) => r.id === String(pid));
  const completion = (() => {
    const set = activeSection.slots.reduce((n, s) => n + (state.depthChart.startersByPos[s] ? 1 : 0), 0);
    return { set, total: activeSection.slots.length };
  })();

  const handleDrop = (toSlot: string) => {
    const fromSlot = dragFromSlot.current;
    dragFromSlot.current = null;
    if (!fromSlot || fromSlot === toSlot) return;
    const gA = slotGroup(fromSlot);
    const gB = slotGroup(toSlot);
    if (!gA || !gB || gA !== gB) return;

    const next = reorderUnlockedOnly({
      startersByPos: state.depthChart.startersByPos,
      lockedBySlot: state.depthChart.lockedBySlot,
      groupSlots: GROUPS[gA],
      fromSlot,
      toSlot,
    });
    if (!next) return;
    dispatch({ type: "DEPTH_BULK_SET", payload: { startersByPos: next } });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Depth Chart</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: "AUTOFILL_DEPTH_CHART" })}>Auto-Fill Empty</Button>
            <Button onClick={() => dispatch({ type: "DEPTH_RESET_TO_BEST" })}>Reset to Best</Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Tabs value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <TabsList className="w-full">
                <TabsTrigger value="OFFENSE" className="flex-1">Offense</TabsTrigger>
                <TabsTrigger value="DEFENSE" className="flex-1">Defense</TabsTrigger>
                <TabsTrigger value="ST" className="flex-1">Special Teams</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center justify-between">
              <Badge variant="outline">{completion.set}/{completion.total} set</Badge>
              {dupes ? <div className="text-xs text-destructive">Warning: duplicate players assigned to multiple slots.</div> : null}
            </div>

            <ScrollArea className="h-[70vh] pr-2">
              <div className="space-y-2">
                <div className="sticky top-0 z-10 -mx-1 border-b bg-background/95 px-1 py-2 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{activeSection.title}</div>
                    <Badge variant="outline">{completion.set}/{completion.total} set</Badge>
                  </div>
                </div>

                {activeSection.slots.map((slot) => {
                  const pid = state.depthChart.startersByPos[slot];
                  const isAuto = !pid;
                  const locked = !!state.depthChart.lockedBySlot?.[slot];

                  const used = usedPlayerIds(state.depthChart);
                  used.delete(String(pid ?? ""));
                  const options = eligibleRosterForSlot(slot, roster, pid, used);
                  const sel = chosenPlayer(pid);

                  return (
                    <div
                      key={slot}
                      className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(slot)}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-1 rounded-lg border border-white/10 bg-white/5 p-2 ${locked ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"}`}
                          draggable={!locked}
                          onDragStart={() => {
                            if (locked) return;
                            dragFromSlot.current = slot;
                          }}
                          title={locked ? "Locked slots cannot move" : "Drag to reorder within this position group"}
                        >
                          <GripVertical className="h-4 w-4 opacity-70" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-lg font-semibold leading-tight">{slot}</div>
                          <div className="truncate text-sm font-medium text-slate-200">
                            {sel ? `${sel.name} (${sel.pos} ${sel.ovr})` : "Auto (top OVR)"} {locked ? "• Locked" : ""}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{sel ? playerMeta(sel.raw) : "—"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={locked ? "default" : "secondary"}
                          disabled={isAuto}
                          title={isAuto ? "Lock requires a manual selection" : ""}
                          onClick={() => dispatch({ type: "TOGGLE_DEPTH_SLOT_LOCK", payload: { slot } })}
                        >
                          {locked ? "Locked" : "Lock"}
                        </Button>

                        <Select
                          value={pid ?? "AUTO"}
                          onValueChange={(v) => dispatch({ type: "SET_STARTER", payload: { slot, playerId: v as string | "AUTO" } })}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AUTO">Auto (top OVR)</SelectItem>
                            {options.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.pos} {p.ovr})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Badge variant="outline">{pid ? "Manual" : "Auto"}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
