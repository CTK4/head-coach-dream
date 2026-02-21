import { useEffect, useMemo, useRef, useState } from "react";
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
import { hapticTap } from "@/lib/haptics";

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

function groupLabel(group: string | null): string {
  if (!group) return "Unknown group";
  const map: Record<string, string> = {
    QB: "Quarterbacks",
    RB: "Running Backs",
    WR: "Wide Receivers",
    TE: "Tight Ends",
    OL: "Offensive Line",
    DL: "Defensive Line",
    EDGE: "Edge Rushers",
    LB: "Linebackers",
    CB: "Cornerbacks",
    S: "Safeties",
    K: "Kicker",
    P: "Punter",
  };
  return map[group] ?? group;
}

function getCenterRect(el: Element): { cx: number; cy: number; r: DOMRect } {
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r };
}

function distance2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getBestSnapTarget(args: {
  clientX: number;
  clientY: number;
  fromSlot: string;
  lockedBySlot?: Record<string, boolean | undefined>;
}): { slot: string | null; snap: { x: number; y: number } | null; valid: boolean } {
  const { clientX, clientY, fromSlot, lockedBySlot } = args;
  const locked = lockedBySlot ?? {};
  const fromGroup = slotGroup(fromSlot);
  if (!fromGroup) return { slot: null, snap: null, valid: true };

  const groupSlots = GROUPS[fromGroup] ?? [];
  const nodes = Array.from(document.querySelectorAll("[data-depth-slot]")) as HTMLElement[];

  let best: { slot: string; d2: number; snap: { x: number; y: number } } | null = null;
  for (const el of nodes) {
    const slot = el.getAttribute("data-depth-slot");
    if (!slot) continue;
    if (!groupSlots.includes(slot)) continue;
    if (locked[slot]) continue;
    const { cx, cy, r } = getCenterRect(el);
    const inYBand = clientY >= r.top - 80 && clientY <= r.bottom + 80;
    if (!inYBand) continue;
    const d2 = distance2(clientX, clientY, cx, cy);
    if (!best || d2 < best.d2) best = { slot, d2, snap: { x: cx, y: r.top + 18 } };
  }

  if (!best) return { slot: null, snap: null, valid: true };
  return { slot: best.slot, snap: best.snap, valid: true };
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
  const [draggingSlot, setDraggingSlot] = useState<string | null>(null);
  const [dropSlot, setDropSlot] = useState<string | null>(null);
  const [dropValid, setDropValid] = useState<boolean>(true);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [repelPulse, setRepelPulse] = useState<boolean>(false);
  const ghostLabelRef = useRef<{ fromSlot: string; groupKey: string | null; line1: string; line2: string } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const dropTargetRef = useRef<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const rafScrollRef = useRef<number | null>(null);

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

  const sectionGroups = useMemo(() => {
    const section = SECTIONS.find((s) => s.key === unit) ?? SECTIONS[0];
    const slotSet = new Set(section.slots);
    const groups: { key: string; slots: string[] }[] = [];
    const seen = new Set<string>();
    for (const slot of section.slots) {
      const g = slotGroup(slot);
      if (!g || seen.has(g)) continue;
      seen.add(g);
      groups.push({ key: g, slots: GROUPS[g].filter((s) => slotSet.has(s)) });
    }
    return groups;
  }, [unit]);

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

  const applyBulkStarters = (next: Record<string, string | undefined>) => {
    for (const [slot, pid] of Object.entries(next)) {
      dispatch({ type: "SET_STARTER", payload: { slot, playerId: pid ?? "AUTO" } });
    }
  };

  const handleDrop = async (toSlot: string, explicitFromSlot?: string | null) => {
    const fromSlot = explicitFromSlot ?? dragFromSlot.current;
    dragFromSlot.current = null;
    if (!fromSlot || fromSlot === toSlot) return;
    const gA = slotGroup(fromSlot);
    const gB = slotGroup(toSlot);
    if (!gA || !gB || gA !== gB) {
      setRepelPulse(true);
      await hapticTap("medium");
      window.setTimeout(() => setRepelPulse(false), 220);
      return;
    }

    const next = reorderUnlockedOnly({
      startersByPos: state.depthChart.startersByPos,
      lockedBySlot: state.depthChart.lockedBySlot,
      groupSlots: GROUPS[gA],
      fromSlot,
      toSlot,
    });
    if (!next) return;
    await hapticTap("light");
    applyBulkStarters(next);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const endPointerDrag = () => {
    clearPressTimer();
    pointerIdRef.current = null;
    dragFromSlot.current = null;
    setDraggingSlot(null);
    dropTargetRef.current = null;
    setDropSlot(null);
    setDropValid(true);
    setGhostPos(null);
    setRepelPulse(false);
    ghostLabelRef.current = null;
    if (rafScrollRef.current) {
      cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = null;
    }
  };

  const onHandlePointerDown = (slot: string, locked: boolean, sel: ReturnType<typeof chosenPlayer>) => async (e: React.PointerEvent) => {
    if (locked) return;
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    pointerIdRef.current = e.pointerId;
    dropTargetRef.current = slot;
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(async () => {
      dragFromSlot.current = slot;
      setDraggingSlot(slot);
      setDropSlot(slot);
      setDropValid(true);
      setGhostPos({ x: e.clientX, y: e.clientY });
      ghostLabelRef.current = {
        fromSlot: slot,
        groupKey: slotGroup(slot),
        line1: sel ? `${sel.name} (${sel.pos} ${sel.ovr})` : "Auto (top OVR)",
        line2: sel ? playerMeta(sel.raw) : "—",
      };
      await hapticTap("light");
    }, 250);
  };


  const applyGhostPos = (target: { x: number; y: number }, pointer: { x: number; y: number }, invalid: boolean) => {
    setGhostPos((prev) => {
      if (!prev) return target;
      const next = { x: lerp(prev.x, target.x, 0.35), y: lerp(prev.y, target.y, 0.35) };
      if (!invalid) return next;
      const dx = next.x - pointer.x;
      const dy = next.y - pointer.y;
      const mag = Math.max(1, Math.hypot(dx, dy));
      const push = 18;
      return { x: next.x + (dx / mag) * push, y: next.y + (dy / mag) * push };
    });
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!draggingSlot) return;
    if (pointerIdRef.current !== e.pointerId) return;

    const from = dragFromSlot.current ?? draggingSlot;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const hovered = el?.closest?.("[data-depth-slot]")?.getAttribute?.("data-depth-slot") ?? null;
    const hoverValid = hovered ? slotGroup(from) === slotGroup(hovered) : true;

    const snap = getBestSnapTarget({
      clientX: e.clientX,
      clientY: e.clientY,
      fromSlot: from,
      lockedBySlot: state.depthChart.lockedBySlot,
    });

    const target = snap.snap ?? { x: e.clientX, y: e.clientY };
    applyGhostPos(target, { x: e.clientX, y: e.clientY }, !hoverValid);

    dropTargetRef.current = hovered ?? snap.slot;
    setDropSlot(hovered ?? snap.slot);
    setDropValid(hoverValid && snap.valid);

    const root = scrollAreaRef.current;
    const viewport = root?.querySelector?.("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    if (!viewport) return;
    const r = viewport.getBoundingClientRect();
    const y = e.clientY;
    const edge = 48;
    const maxSpeed = 18;
    let delta = 0;

    if (y < r.top + edge) {
      const t = Math.max(0, (r.top + edge - y) / edge);
      delta = -Math.round(maxSpeed * t);
    } else if (y > r.bottom - edge) {
      const t = Math.max(0, (y - (r.bottom - edge)) / edge);
      delta = Math.round(maxSpeed * t);
    }

    if (!delta) return;
    if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
    rafScrollRef.current = requestAnimationFrame(() => {
      viewport.scrollTop += delta;
      rafScrollRef.current = null;
    });
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const from = draggingSlot;
    const to = dropTargetRef.current;
    endPointerDrag();
    if (from && to) void handleDrop(to);
  };

  const onHandlePointerCancel = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    endPointerDrag();
  };

  useEffect(() => {
    return () => endPointerDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragFromSlot.current) return;
      const from = dragFromSlot.current;
      const snap = getBestSnapTarget({
        clientX: e.clientX,
        clientY: e.clientY,
        fromSlot: from,
        lockedBySlot: state.depthChart.lockedBySlot,
      });
      const target = snap.snap ?? { x: e.clientX, y: e.clientY };
      applyGhostPos(target, { x: e.clientX, y: e.clientY }, false);
      dropTargetRef.current = snap.slot;
      setDropSlot(snap.slot);
      setDropValid(snap.valid);
    };
    window.addEventListener("dragover", onMove);
    return () => window.removeEventListener("dragover", onMove);
  }, [state.depthChart.lockedBySlot]);

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

            <ScrollArea ref={scrollAreaRef} className="h-[70vh] pr-2">
              <div className="space-y-2">
                <div className="sticky top-0 z-10 -mx-1 border-b bg-background/95 px-1 py-2 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{activeSection.title}</div>
                    <Badge variant="outline">{completion.set}/{completion.total} set</Badge>
                  </div>
                </div>

                {sectionGroups.map(({ key: group, slots: groupSlots }) => (
                  <Card key={group} className="border">
                    <CardHeader className="px-4 pb-2 pt-3">
                      <CardTitle className="text-base">{groupLabel(group)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 px-4 pb-3 pt-0">
                      {groupSlots.map((slot, depthIdx) => {
                        const pid = state.depthChart.startersByPos[slot];
                        const isAuto = !pid;
                        const locked = !!state.depthChart.lockedBySlot?.[slot];

                        const used = usedPlayerIds(state.depthChart);
                        used.delete(String(pid ?? ""));
                        const options = eligibleRosterForSlot(slot, roster, pid, used);
                        const sel = chosenPlayer(pid);

                        if (draggingSlot === slot) {
                          ghostLabelRef.current = {
                            fromSlot: `${group} #${depthIdx + 1}`,
                            groupKey: group,
                            line1: sel ? `${sel.name} (${sel.pos} ${sel.ovr})` : "Auto (top OVR)",
                            line2: sel ? playerMeta(sel.raw) : "—",
                          };
                        }

                        return (
                          <div
                            key={slot}
                            data-depth-slot={slot}
                            className={`relative flex flex-col gap-2 rounded-lg border px-3 py-2 md:flex-row md:items-center
                              ${dropSlot === slot && draggingSlot ? (dropValid ? "ring-2 ring-accent" : "ring-2 ring-red-500") : ""}`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const from = e.dataTransfer.getData("text/depth-slot") || dragFromSlot.current;
                              handleDrop(slot, from);
                            }}
                          >
                            {draggingSlot && dropSlot === slot ? (
                              <div className={`pointer-events-none absolute inset-0 rounded-lg ${dropValid ? "bg-accent/10" : "bg-red-500/10"}`} />
                            ) : null}

                            {draggingSlot === slot ? <div className="pointer-events-none absolute inset-0 rounded-lg border border-dashed border-accent/60 bg-white/5" /> : null}

                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <div className="w-5 shrink-0 text-center text-sm font-semibold text-muted-foreground select-none">{depthIdx + 1}</div>

                              <div
                                className={`rounded-md border border-white/10 bg-white/5 p-1.5 select-none touch-none ${
                                  locked ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
                                } ${draggingSlot === slot ? "ring-2 ring-accent" : ""}`}
                                draggable={!locked}
                                onDragStart={(e) => {
                                  if (locked) return;
                                  dragFromSlot.current = slot;
                                  setDraggingSlot(slot);
                                  setGhostPos(null);
                                  e.dataTransfer.setData("text/depth-slot", slot);
                                  e.dataTransfer.effectAllowed = "move";
                                  ghostLabelRef.current = {
                                    fromSlot: `${group} #${depthIdx + 1}`,
                                    groupKey: group,
                                    line1: sel ? `${sel.name} (${sel.pos} ${sel.ovr})` : "Auto (top OVR)",
                                    line2: sel ? playerMeta(sel.raw) : "—",
                                  };
                                }}
                                onDragEnd={() => {
                                  dragFromSlot.current = null;
                                  setDraggingSlot(null);
                                  setGhostPos(null);
                                  ghostLabelRef.current = null;
                                }}
                                title={locked ? "Locked slots cannot move" : "Drag to reorder within this position group"}
                                onPointerDown={onHandlePointerDown(slot, locked)}
                                onPointerMove={onHandlePointerMove}
                                onPointerUp={onHandlePointerUp}
                                onPointerCancel={onHandlePointerCancel}
                              >
                                <GripVertical className="h-4 w-4 opacity-70" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">
                                  {sel ? `${sel.name} (${sel.pos} ${sel.ovr})` : "Auto (top OVR)"} {locked ? "• Locked" : ""}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">{sel ? playerMeta(sel.raw) : "—"}</div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {draggingSlot && ghostPos && ghostLabelRef.current ? (
        <div className="pointer-events-none fixed z-[80]" style={{ left: ghostPos.x, top: ghostPos.y, transform: "translate(-50%, -110%)" }}>
          <div className={`w-[320px] rounded-xl border border-white/10 bg-slate-950/95 shadow-xl backdrop-blur ${repelPulse ? "animate-pulse" : ""}`}>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{ghostLabelRef.current.fromSlot}</div>
                <div className="truncate text-[11px] text-slate-400">{groupLabel(ghostLabelRef.current.groupKey)}</div>
              </div>
              <div className="truncate text-sm text-slate-100">{ghostLabelRef.current.line1}</div>
              <div className="truncate text-[11px] text-slate-400">{ghostLabelRef.current.line2}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  {dropSlot ? (dropValid ? `Dropping into ${dropSlot}` : `Invalid target (${dropSlot})`) : "Choose a target slot"}
                </div>
              </div>
              <div className={`mt-2 h-1 rounded-full ${dropValid ? "bg-accent/70" : "bg-red-500/70"}`} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
