import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import { ARCHETYPE_LABELS, safeLabel } from "@/lib/displayLabels";

const CATEGORY_ICON = (source: string) => {
  if (source.toLowerCase().includes("credibility") || source.toLowerCase().includes("culture") || source.toLowerCase().includes("identity")) return "◆";
  if (source.toLowerCase().includes("reputation") || source.toLowerCase().includes("leader") || source.toLowerCase().includes("confidence")) return "◈";
  return "●";
};

function playoffBadge(result: string): { label: string; className: string } {
  if (result === "champion") return { label: "CHAMPION 🏆", className: "bg-amber-400/20 text-amber-200 border-amber-400/50" };
  if (result === "superbowlLoss") return { label: "SUPER BOWL", className: "bg-slate-300/20 text-slate-100 border-slate-300/50" };
  if (result === "conference") return { label: "CONFERENCE", className: "bg-blue-400/20 text-white border-blue-400/50" };
  if (result === "divisional") return { label: "DIVISIONAL", className: "bg-blue-400/20 text-white border-blue-400/50" };
  if (result === "wildCard") return { label: "WILD CARD", className: "bg-blue-400/20 text-white border-blue-400/50" };
  return { label: "MISSED PLAYOFFS", className: "bg-slate-500/20 text-slate-300 border-slate-500/40" };
}

export default function SeasonAwards() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const summary = state.lastSeasonSummary;
  const tenureYear = Number(state.coach.tenureYear ?? 1);
  const seasonalEntries = useMemo(
    () => (state.coach.perkPointLog ?? []).filter((entry) => Number(entry.season) === tenureYear),
    [state.coach.perkPointLog, tenureYear],
  );

  const [visibleCount, setVisibleCount] = useState(0);
  const [showRight, setShowRight] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!summary) return;
    setVisibleCount(0);
    setShowRight(false);
    setShowBottom(false);
    setShowButton(false);

    const timers: number[] = [];
    const totalRows = Math.max(1, seasonalEntries.length);
    for (let i = 1; i <= totalRows; i += 1) {
      timers.push(window.setTimeout(() => setVisibleCount(i), i * 150));
    }
    timers.push(window.setTimeout(() => setShowRight(true), totalRows * 150 + 220));
    timers.push(window.setTimeout(() => setShowBottom(true), totalRows * 150 + 420));
    timers.push(window.setTimeout(() => setShowButton(true), totalRows * 150 + 620));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [summary, seasonalEntries.length]);

  if (!summary) return null;

  const badge = playoffBadge(summary.playoffResult);
  const displayEntries = seasonalEntries.length
    ? seasonalEntries
    : [{ source: "Season Completion", amount: 3, season: tenureYear }];
  const totalEarned = displayEntries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);

  const onContinue = () => {
    dispatch({ type: "DISMISS_SEASON_AWARDS" });
    navigate("/hub", { replace: true });
  };

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl min-h-[85vh] flex-col justify-between gap-5">
        <Card className="border-slate-700 bg-slate-900/80 text-center">
          <CardHeader>
            <CardTitle className="text-3xl tracking-wide">SEASON {summary.tenureYear} COMPLETE</CardTitle>
            <p className="text-5xl font-extrabold text-indigo-200">{summary.wins} - {summary.losses}</p>
            <div className="flex justify-center"><Badge className={`border ${badge.className}`}>{badge.label}</Badge></div>
            <p className="text-sm text-slate-300">{state.coach.name} · {ARCHETYPE_LABELS[state.coach.archetypeId] ?? safeLabel(state.coach.archetypeId)}</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-slate-700 bg-slate-900/70">
            <CardHeader><CardTitle className="text-lg">Points Earned This Season</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {displayEntries.map((entry, idx) => (
                <div
                  key={`${entry.source}-${idx}`}
                  className={`flex items-center justify-between rounded border border-slate-700 bg-slate-800/60 px-3 py-2 transition-all duration-300 ${idx < visibleCount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                >
                  <span className="text-sm text-slate-200">{CATEGORY_ICON(entry.source)} {entry.source}</span>
                  <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-100">+{entry.amount}</Badge>
                </div>
              ))}
              {!seasonalEntries.length ? <p className="text-xs text-slate-400">Strong seasons unlock additional milestones.</p> : null}
              <div className="mt-3 border-t border-slate-700 pt-2 text-right font-semibold text-indigo-200">Total Earned: +{totalEarned} points</div>
            </CardContent>
          </Card>

          <Card className={`border-slate-700 bg-slate-900/70 transition-all duration-500 ${showRight ? "opacity-100" : "opacity-0"}`}>
            <CardHeader><CardTitle className="text-lg">Available Points</CardTitle></CardHeader>
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-5xl font-bold text-indigo-200">⬡ {state.coach.perkPoints ?? 0}</p>
              <p className="text-slate-300">Points Available</p>
              <p className="text-sm text-slate-400">Spend in Coach Development →</p>
            </CardContent>
          </Card>
        </div>

        <Card className={`border-slate-700 bg-slate-900/70 transition-all duration-500 ${showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <CardHeader><CardTitle className="text-base">Reputation Movement</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {Object.entries(summary.reputationDeltas).map(([key, value]) => {
              const n = Number(value ?? 0);
              const txt = n === 0 ? "–" : `${n > 0 ? "+" : ""}${n}`;
              const color = n === 0 ? "text-slate-400" : n > 0 ? "text-emerald-300" : "text-red-300";
              return (
                <div key={key} className="rounded border border-slate-700 bg-slate-800/60 p-2 text-center">
                  <p className="text-xs text-slate-400">{key}</p>
                  <p className={`text-sm font-semibold ${color}`}>{txt}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${showButton ? "opacity-100" : "opacity-0"}`}>
          <Button onClick={onContinue} className="w-full max-w-md">Enter Offseason →</Button>
          <Button variant="link" onClick={() => navigate("/skill-tree")}>View Skill Tree</Button>
        </div>
      </div>
    </section>
  );
}
