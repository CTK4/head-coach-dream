import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageScreen } from "@/components/layout/PageScreen";

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 rounded bg-surface-3 overflow-hidden">
      <div className={`h-2 rounded ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function meterColor(v: number) {
  if (v < 35) return "bg-red-500";
  if (v < 60) return "bg-amber-500";
  return "bg-emerald-500";
}

function pressureColor(v: number) {
  if (v > 70) return "bg-red-500";
  if (v > 45) return "bg-amber-500";
  return "bg-emerald-500";
}

const ROUND_LABELS: Record<string, string> = {
  MISS: "Miss Playoffs",
  WILD_CARD: "Wild Card",
  DIVISIONAL: "Divisional Round",
  CONF_TITLE: "Conference Title",
  CHAMPION: "Championship",
};

export default function OwnerRelations() {
  const { state } = useGame();
  const [open, setOpen] = useState(false);
  const hs = state.hotSeatStatus;
  const ownerState = state.ownerState;
  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";

  const toneClass =
    hs.level === "CRITICAL"
      ? "border-red-500"
      : hs.level === "HOT"
        ? "border-orange-500"
        : hs.level === "WARM"
          ? "border-yellow-500"
          : "border-emerald-500/40";

  const teamRow = state.currentStandings.find((s) => String(s.teamId) === String(teamId));
  const currentWins = teamRow?.wins ?? 0;
  const minWins = ownerState?.currentGoals?.minWins ?? 9;
  const playoffTarget = ownerState?.currentGoals?.playoffRoundTarget ?? "WILD_CARD";
  const topUnitTarget = ownerState?.currentGoals?.topUnitTarget;
  const activeUltimatums = (ownerState?.ultimatums ?? []).filter((u) => !u.resolved);

  return (
    <PageScreen>
      <div className="mx-auto max-w-screen-sm space-y-3 px-4 pt-4 text-sm">
        <h1 className="text-xl font-bold">Owner Relations</h1>

        {/* Job Security */}
        <Card className={`border ${toneClass} bg-surface-1`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Job Security</span>
              <Badge
                variant="outline"
                className={
                  hs.level === "CRITICAL"
                    ? "border-red-500 text-red-400"
                    : hs.level === "HOT"
                      ? "border-orange-500 text-orange-400"
                      : hs.level === "WARM"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-emerald-500 text-emerald-400"
                }
              >
                {hs.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Meter value={hs.score} color={hs.score > 65 ? "bg-red-500" : hs.score > 40 ? "bg-amber-500" : "bg-emerald-500"} />
            <p className="text-xs text-muted-foreground">{hs.primaryDriver}</p>
            <button className="text-xs text-blue-400 underline" onClick={() => setOpen((v) => !v)}>
              {open ? "Hide factors" : "Why?"}
            </button>
            {open && (
              <ul className="space-y-1">
                {hs.factors.length === 0 && <li className="text-xs text-muted-foreground">No factors recorded.</li>}
                {hs.factors.map((f) => (
                  <li key={f.label} className="flex justify-between text-xs">
                    <span>{f.label}</span>
                    <span className={f.contribution > 0 ? "text-red-400" : "text-emerald-400"}>
                      {f.contribution > 0 ? `+${f.contribution}` : f.contribution}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Owner Sentiment */}
        <Card className="border-white/10 bg-surface-1">
          <CardHeader>
            <CardTitle>Owner Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Approval</span>
                <span>{ownerState?.approval ?? 60}</span>
              </div>
              <Meter value={ownerState?.approval ?? 60} color={meterColor(ownerState?.approval ?? 60)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Pressure</span>
                <span>{ownerState?.pressure ?? 40}</span>
              </div>
              <Meter value={ownerState?.pressure ?? 40} color={pressureColor(ownerState?.pressure ?? 40)} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Trust</span>
                <span>{ownerState?.trust ?? 55}</span>
              </div>
              <Meter value={ownerState?.trust ?? 55} color={meterColor(ownerState?.trust ?? 55)} />
            </div>
            {ownerState?.lastEvaluation && (
              <div className="rounded border border-white/10 bg-surface-2 p-2 text-xs text-muted-foreground">
                <span className="font-medium text-white">Last evaluation (Year {ownerState.lastEvaluation.year}): </span>
                {ownerState.lastEvaluation.summary}
                <span className={ownerState.lastEvaluation.delta >= 0 ? " text-emerald-400" : " text-red-400"}>
                  {" "}({ownerState.lastEvaluation.delta >= 0 ? "+" : ""}{ownerState.lastEvaluation.delta})
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Season Goals */}
        <Card className="border-white/10 bg-surface-1">
          <CardHeader>
            <CardTitle>Season Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Win target</span>
                <span>
                  <span className={currentWins >= minWins ? "text-emerald-400" : "text-amber-400"}>{currentWins}</span>
                  <span className="text-muted-foreground"> / {minWins}</span>
                </span>
              </div>
              <Meter value={(currentWins / Math.max(1, minWins)) * 100} color={currentWins >= minWins ? "bg-emerald-500" : "bg-amber-500"} />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">Playoff target: {ROUND_LABELS[playoffTarget] ?? playoffTarget}</Badge>
              {topUnitTarget && (
                <Badge variant="outline">
                  {topUnitTarget.unit} rank top {topUnitTarget.rankMax}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Ultimatums */}
        <Card className="border-white/10 bg-surface-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Ultimatums</span>
              {activeUltimatums.length > 0 && (
                <Badge variant="destructive">{activeUltimatums.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeUltimatums.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active ultimatums.</p>
            ) : (
              <ul className="space-y-2">
                {activeUltimatums.map((u, i) => (
                  <li key={i} className="rounded border border-red-500/40 bg-red-950/30 p-2 text-xs">
                    <span className="font-medium text-red-400">Year {u.year}: </span>
                    {u.trigger}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageScreen>
  );
}
