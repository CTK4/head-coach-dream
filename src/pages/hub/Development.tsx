import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { computeDevArrow, computeDevRisk } from "@/engine/devCalculators";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const POS_GROUPS = ["QB", "OL", "WR", "RB", "TE", "DL", "EDGE", "LB", "CB", "S"] as const;
type PosGroup = (typeof POS_GROUPS)[number];
type FocusLevel = "LOW" | "NORMAL" | "HIGH";

const FOCUS_LABELS: Record<FocusLevel, string> = { LOW: "Low", NORMAL: "Normal", HIGH: "High" };

const FOCUS_TRADEOFFS: Record<PosGroup, string> = {
  QB: "↑ accuracy growth · ↑ injury risk",
  OL: "↑ run blocking · ↑ fatigue",
  WR: "↑ route running · ↑ morale",
  RB: "↑ burst/power · ↑ injury risk",
  TE: "↑ blocking/routes · fatigue",
  DL: "↑ pass rush · ↑ fatigue",
  EDGE: "↑ burst/leverage · fatigue",
  LB: "↑ coverage/tackle · normal",
  CB: "↑ press/man · injury risk",
  S: "↑ range/zone · normal",
};

const DEV_ARROW_COLOR: Record<string, string> = {
  "↑": "text-emerald-400",
  "→": "text-slate-300",
  "↓": "text-rose-400",
};

const RISK_CLASS: Record<string, string> = {
  LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  MED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  HIGH: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const DEV_ARROW_LABEL: Record<string, string> = {
  "↑": "Developing",
  "→": "Stable",
  "↓": "Declining",
};

const DEV_ARROW_DESC: Record<string, string> = {
  "↑": "Young player with growth potential.",
  "→": "Minimal change projected.",
  "↓": "Age-related regression expected.",
};

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function devGradeLetter(avgOvr: number) {
  if (avgOvr >= 82) return "A";
  if (avgOvr >= 76) return "B";
  if (avgOvr >= 70) return "C";
  return "D";
}

// ──────────────────────────────────────────────────────────
// Player row type (stable shape derived once via useMemo)
// ──────────────────────────────────────────────────────────

type DevPlayer = {
  playerId: string;
  name: string;
  pos: string;
  age: number;
  ovr: number;
  potential: number;
  dev: number;
  archetype: string;
  traits: string;
  morale: number;
};

// ──────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────

export default function Development() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? state.teamId ?? "";

  // ── Stable player list (no heavy recompute per render) ──
  const players = useMemo<DevPlayer[]>(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, teamId)
      .map((p: Record<string, unknown>) => ({
        playerId: String(p.playerId ?? ""),
        name: String(p.fullName ?? "Unknown"),
        pos: normalizePos(String(p.pos ?? "UNK")),
        age: Number(p.age ?? 0),
        ovr: clamp100(Number(p.overall ?? 0)),
        potential: Number(p.potential ?? 0),
        dev: Number(p.dev ?? 0),
        archetype: String(p.Archetype ?? p.archetype ?? ""),
        traits: String(p.Traits ?? p.traits ?? ""),
        morale: Number(state.playerMorale?.[String(p.playerId)] ?? 75),
      }))
      .sort((a, b) => b.ovr - a.ovr);
  }, [state, teamId]);

  // ── Overview stats ───────────────────────────────────────
  const stats = useMemo(() => {
    if (!players.length) return { devGrade: "—", youthCount: 0, regressionCount: 0 };
    const young = players.filter((p) => p.age <= 25);
    const avgYoungOvr = young.length ? young.reduce((s, p) => s + p.ovr, 0) / young.length : 0;
    return {
      devGrade: young.length ? devGradeLetter(Math.round(avgYoungOvr)) : "—",
      youthCount: young.length,
      regressionCount: players.filter((p) => p.age >= 30).length,
    };
  }, [players]);

  // ── Training focus (local draft before committing) ──────
  const savedFocus = state.trainingFocus?.posGroupFocus as Partial<Record<PosGroup, FocusLevel>> | undefined;
  const [draftFocus, setDraftFocus] = useState<Partial<Record<PosGroup, FocusLevel>>>(savedFocus ?? {});
  const [focusSaved, setFocusSaved] = useState(false);

  function setGroupLevel(pos: PosGroup, lvl: FocusLevel) {
    setDraftFocus((prev) => ({ ...prev, [pos]: lvl }));
    setFocusSaved(false);
  }

  function handleSetFocus() {
    dispatch({ type: "SET_TRAINING_FOCUS", payload: { posGroupFocus: draftFocus } });
    setFocusSaved(true);
  }

  // ── Player drawer ────────────────────────────────────────
  const seasonDevDeltas = useMemo(() => {
    const events = (state.memoryLog ?? []).filter((e) => e.type === "SEASON_DEVELOPMENT");
    const latest = events.length ? (events[events.length - 1].payload as any) : null;
    return (latest?.deltas ?? {}) as Record<string, number>;
  }, [state.memoryLog]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPlayer = useMemo(
    () => players.find((p) => p.playerId === selectedId) ?? null,
    [players, selectedId],
  );

  // ── Loading / empty guard ────────────────────────────────
  if (!teamId) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No team selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ScreenHeader title="DEVELOPMENT" subtitle="Player growth &amp; training" />

      <Tabs defaultValue="overview" className="w-full">
        {/* ── Tab strip ─────────────────────────────────── */}
        <TabsList className="w-full rounded-none border-b border-white/10 bg-slate-950 p-0 h-auto">
          {(["overview", "focus", "progress"] as const).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="flex-1 rounded-none border-b-2 border-transparent py-3 text-xs font-semibold tracking-widest uppercase text-slate-400 data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-300 data-[state=active]:bg-transparent"
            >
              {t === "overview" ? "Overview" : t === "focus" ? "Training Focus" : "Player Progress"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ──────────────────────────────────── */}
        <TabsContent value="overview" className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-extrabold text-emerald-300">{stats.devGrade}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wider uppercase">Dev Grade</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-extrabold text-sky-300">{stats.youthCount}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wider uppercase">Youth ≤25</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-extrabold text-rose-300">{stats.regressionCount}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wider uppercase">Reg. Risk</div>
              </CardContent>
            </Card>
          </div>

          {players.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No roster data available.</p>
          ) : (
            <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm tracking-wider text-slate-300">TEAM SNAPSHOT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-3 pb-3">
                {players.slice(0, 10).map((p) => {
                  const arrow = computeDevArrow(p);
                  const risk = computeDevRisk(p);
                  return (
                    <button
                      key={p.playerId}
                      onClick={() => setSelectedId(p.playerId)}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className={`w-5 text-center text-lg font-bold ${DEV_ARROW_COLOR[arrow]}`}>{arrow}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{p.pos}</span>
                      <span className="shrink-0 text-xs text-slate-400">A{p.age}</span>
                      <span className="shrink-0 text-xs font-bold text-emerald-300">{p.ovr}</span>
                      {risk !== "LOW" ? (
                        <Badge variant="outline" className={`shrink-0 px-1 py-0 text-[9px] ${RISK_CLASS[risk]}`}>
                          {risk}
                        </Badge>
                      ) : null}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Training Focus ────────────────────────────── */}
        <TabsContent value="focus" className="p-4 space-y-3">
          <p className="text-xs text-slate-400">
            Set position-group training intensity. Projected benefits and tradeoffs shown per group. Saved focus
            persists to your game state.
          </p>
          <div className="space-y-2">
            {POS_GROUPS.map((pos) => {
              const level: FocusLevel = draftFocus[pos] ?? "NORMAL";
              return (
                <Card key={pos} className="rounded-2xl border-white/10 bg-white/[0.04]">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="w-12 shrink-0 text-sm font-bold text-slate-200">{pos}</div>
                    <div className="flex flex-1 gap-1">
                      {(["LOW", "NORMAL", "HIGH"] as FocusLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setGroupLevel(pos, lvl)}
                          className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${
                            level === lvl
                              ? "bg-emerald-500/90 text-black"
                              : "bg-white/10 text-slate-400 hover:bg-white/15"
                          }`}
                        >
                          {FOCUS_LABELS[lvl]}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                  <div className="px-4 pb-2 text-[10px] text-slate-500">{FOCUS_TRADEOFFS[pos]}</div>
                </Card>
              );
            })}
          </div>
          <Button
            className="w-full rounded-xl bg-emerald-500/90 text-black font-semibold hover:bg-emerald-500"
            onClick={handleSetFocus}
          >
            {focusSaved ? "✓ Focus Saved" : "Set Focus"}
          </Button>
        </TabsContent>

        {/* ── Player Progress ───────────────────────────── */}
        <TabsContent value="progress" className="p-4 space-y-2">
          <Card className="rounded-2xl border-white/10 bg-white/[0.04]">
            <CardHeader className="pb-2"><CardTitle className="text-sm tracking-wider text-slate-300">SEASON DEVELOPMENT RESULTS</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Pos</TableHead>
                    <TableHead>Projected</TableHead>
                    <TableHead>Actual Δ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((p) => {
                    const arrow = computeDevArrow(p, state.coach);
                    const actual = Number(seasonDevDeltas[p.playerId] ?? 0);
                    return (
                      <TableRow key={p.playerId} onClick={() => setSelectedId(p.playerId)} className="cursor-pointer">
                        <TableCell className="font-semibold">{p.name}</TableCell>
                        <TableCell>{p.pos}</TableCell>
                        <TableCell className={DEV_ARROW_COLOR[arrow]}>{arrow}</TableCell>
                        <TableCell className={actual > 0 ? "text-emerald-300" : actual < 0 ? "text-rose-300" : "text-slate-300"}>{actual > 0 ? `+${actual}` : `${actual}`}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Player Drawer (bottom sheet) ──────────────────── */}
      <Sheet
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-white/10 bg-slate-900 text-slate-100 max-h-[80vh] overflow-y-auto"
        >
          {selectedPlayer ? (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-left">
                  <span className="text-lg font-extrabold">{selectedPlayer.name}</span>
                  <span className="ml-2 text-sm text-slate-400">
                    {selectedPlayer.pos} · Age {selectedPlayer.age} · OVR {selectedPlayer.ovr}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                {/* Dev arrow + label */}
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-extrabold ${DEV_ARROW_COLOR[computeDevArrow(selectedPlayer)]}`}>
                    {computeDevArrow(selectedPlayer)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{DEV_ARROW_LABEL[computeDevArrow(selectedPlayer)]}</div>
                    <div className="text-xs text-slate-400">{DEV_ARROW_DESC[computeDevArrow(selectedPlayer)]}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-auto shrink-0 ${RISK_CLASS[computeDevRisk(selectedPlayer)]}`}
                  >
                    {computeDevRisk(selectedPlayer)} RISK
                  </Badge>
                </div>

                {/* Archetype / dev trait */}
                {selectedPlayer.archetype ? (
                  <Card className="rounded-xl border-white/10 bg-white/[0.04]">
                    <CardContent className="p-3">
                      <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">Archetype / Dev Trait</div>
                      <div className="text-sm font-semibold">{selectedPlayer.archetype}</div>
                      {selectedPlayer.traits ? (
                        <div className="mt-1 text-xs text-slate-400">{selectedPlayer.traits}</div>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}

                {/* Attribute delta (snap-based — placeholder until sim is wired) */}
                <Card className="rounded-xl border-white/10 bg-white/[0.04]">
                  <CardContent className="p-3">
                    <div className="mb-2 text-xs uppercase tracking-wider text-slate-400">Attribute Delta</div>
                    <div className="text-xs italic text-slate-500">
                      Snap-based growth tracking not yet available — deltas will appear after game simulation.
                    </div>
                  </CardContent>
                </Card>

                {/* Morale indicator */}
                <Card className="rounded-xl border-white/10 bg-white/[0.04]">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Morale</div>
                    <div
                      className={`text-base font-bold ${
                        selectedPlayer.morale >= 80
                          ? "text-emerald-300"
                          : selectedPlayer.morale >= 60
                          ? "text-slate-300"
                          : "text-rose-400"
                      }`}
                    >
                      {selectedPlayer.morale}
                    </div>
                  </CardContent>
                </Card>

                {/* Coaching / staff modifiers (placeholder) */}
                <Card className="rounded-xl border-white/10 bg-white/[0.04]">
                  <CardContent className="p-3">
                    <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">Coaching Modifiers</div>
                    <div className="text-xs italic text-slate-500">
                      Staff coaching bonuses will display here when staff system is wired.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
