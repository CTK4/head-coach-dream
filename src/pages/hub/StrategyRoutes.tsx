import { useMemo } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useGame, type GmMode, type PriorityPos } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlaybookScreen from "@/pages/hub/strategy/PlaybookScreen";

const POS_GROUPS: PriorityPos[] = ["QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S", "K", "P"];

const GM_MODES: { value: GmMode; label: string; desc: string }[] = [
  { value: "REBUILD", label: "Rebuild", desc: "Draft-heavy, cap-conservative. Favors youth & upside." },
  { value: "RELOAD", label: "Reload", desc: "Balanced mix of FA signings and youth development." },
  { value: "CONTEND", label: "Contend", desc: "FA-aggressive, trade for veterans. Win now." },
];

function StrategyHome() {
  const { state, dispatch } = useGame();
  const gmMode = state.strategy?.gmMode ?? "CONTEND";

  return (
    <div className="min-w-0">
      <ScreenHeader title="FRANCHISE STRATEGY" subtitle="Identity + Priorities" />
      <div className="space-y-3 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Franchise Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {GM_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => dispatch({ type: "SET_GM_MODE", payload: { gmMode: m.value } })}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    gmMode === m.value
                      ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <div className="font-semibold text-sm">{m.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{m.desc}</div>
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              Affects draft board sorting, FA offer aggression, and trade acceptance thresholds.
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link to="identity" className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <div className="font-semibold">Team Identity</div>
            <div className="text-xs text-slate-400">Offense/Defense style & tempo</div>
          </Link>
          <Link to="priorities" className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <div className="font-semibold">Draft / FA Priorities</div>
            <div className="text-xs text-slate-400">Set position targets</div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <Link to="tag" className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Franchise Tag</div>
                <div className="text-xs text-slate-400">Open Tag Center</div>
              </div>
              <Badge variant="secondary">Hub</Badge>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function IdentityScreen() {
  const { state, dispatch } = useGame();

  const offenseStyle = state.scheme?.offense?.style ?? "BALANCED";
  const offenseTempo = state.scheme?.offense?.tempo ?? "NORMAL";
  const defenseStyle = state.scheme?.defense?.style ?? "MIXED";
  const defenseAgg = state.scheme?.defense?.aggression ?? "NORMAL";

  return (
    <div className="min-w-0">
      <ScreenHeader title="TEAM IDENTITY" subtitle="Scheme & Tendencies" showBack />
      <div className="space-y-3 p-4">
        <Link
          to="/strategy/playbooks"
          className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Playbooks</div>
              <div className="text-xs text-muted-foreground">Offense &amp; Defense (driven by coordinator system)</div>
            </div>
            <span className="text-sm text-accent">Open →</span>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Offense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="text-xs text-slate-400">Style</div>
              <Select
                value={offenseStyle}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_SCHEME",
                    payload: { offense: { style: v as never, tempo: offenseTempo as never }, defense: { style: defenseStyle as never, aggression: defenseAgg as never } },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BALANCED">Balanced</SelectItem>
                  <SelectItem value="RUN_HEAVY">Run Heavy</SelectItem>
                  <SelectItem value="PASS_HEAVY">Pass Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-xs text-slate-400">Tempo</div>
              <Select
                value={offenseTempo}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_SCHEME",
                    payload: { offense: { style: offenseStyle as never, tempo: v as never }, defense: { style: defenseStyle as never, aggression: defenseAgg as never } },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SLOW">Slow</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="FAST">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="text-xs text-slate-400">Coverage</div>
              <Select
                value={defenseStyle}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_SCHEME",
                    payload: { offense: { style: offenseStyle as never, tempo: offenseTempo as never }, defense: { style: v as never, aggression: defenseAgg as never } },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAN">Man</SelectItem>
                  <SelectItem value="ZONE">Zone</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-xs text-slate-400">Aggression</div>
              <Select
                value={defenseAgg}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_SCHEME",
                    payload: { offense: { style: offenseStyle as never, tempo: offenseTempo as never }, defense: { style: defenseStyle as never, aggression: v as never } },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-slate-400">
          These settings are saved in your career file and can be used later for staff fit, playcalling, and roster logic.
        </div>
      </div>
    </div>
  );
}

function PrioritiesScreen() {
  const { state, dispatch } = useGame();
  const priorities = state.strategy?.draftFaPriorities ?? ["QB", "OL", "EDGE"];

  const toggle = (pos: PriorityPos) => {
    const next = priorities.includes(pos) ? priorities.filter((x) => x !== pos) : [...priorities, pos];
    dispatch({ type: "SET_STRATEGY_PRIORITIES", payload: { positions: next } });
  };

  const top3 = useMemo(() => priorities.slice(0, 3), [priorities]);

  return (
    <div className="min-w-0">
      <ScreenHeader title="DRAFT / FA PRIORITIES" subtitle="Targets & Focus" showBack />
      <div className="space-y-3 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {top3.length ? top3.map((p) => <Badge key={p}>{p}</Badge>) : <span className="text-sm text-slate-400">None selected</span>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {POS_GROUPS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    priorities.includes(p) ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              Saved to your career file. Used for team-mode draft board sorting and AI-assisted FA offers when coach autonomy is low.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StrategyRoutes() {
  return (
    <Routes>
      <Route index element={<StrategyHome />} />
      <Route path="identity" element={<IdentityScreen />} />
      <Route path="priorities" element={<PrioritiesScreen />} />
      <Route path="playbooks" element={<PlaybookScreen />} />
      <Route path="tag" element={<Navigate to="/hub/tag-center" replace />} />
      <Route path="*" element={<Navigate to="/strategy" replace />} />
    </Routes>
  );
}
