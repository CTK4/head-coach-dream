import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { recommendFourthDown } from "@/engine/gameSim";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PLAYS = [
  { id: "RUN", label: "Run", icon: "🏃", desc: "Low risk, steady yards" },
  { id: "SHORT_PASS", label: "Short Pass", icon: "📡", desc: "Medium risk, reliable gains" },
  { id: "DEEP_PASS", label: "Deep Pass", icon: "🚀", desc: "High risk, big reward" },
  { id: "PLAY_ACTION", label: "Play Action", icon: "🎭", desc: "Deception-based, variable" },
  { id: "SPIKE", label: "Spike", icon: "⏱️", desc: "Stops clock (incomplete)" },
  { id: "KNEEL", label: "Kneel", icon: "🧎", desc: "Bleed time (safe)" },
  { id: "PUNT", label: "Punt", icon: "🦶", desc: "Flip field" },
  { id: "FG", label: "Field Goal", icon: "🥅", desc: "3 points attempt" },
] as const;

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function recLabel(id: string): string {
  return id === "RUN" ? "Go" : id;
}

function recVariant(id: string, best: string): "default" | "outline" {
  return id === best ? "default" : "outline";
}

const Playcall = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [, force] = useState(0);

  const teamId = state.acceptedOffer?.teamId;
  const g = state.game;

  const team = teamId ? getTeamById(teamId) : null;
  const opp = g.awayTeamId && g.awayTeamId !== "AWAY" ? getTeamById(g.awayTeamId) : null;

  const invalid = !teamId || !opp || !g.weekType || !g.weekNumber;
  const canShowPlay = useMemo(() => !invalid && !(g.clock.quarter === 4 && g.clock.timeRemainingSec === 0), [invalid, g.clock.quarter, g.clock.timeRemainingSec]);

  const rec = useMemo(
    () =>
      g.down === 4
        ? recommendFourthDown(g)
        : null,
    [g]
  );

  const handlePlay = (playType: (typeof PLAYS)[number]["id"]) => {
    dispatch({ type: "RESOLVE_PLAY", payload: { playType } });
    force((x) => x + 1);
  };

  const exit = () => {
    dispatch({ type: "EXIT_GAME" });
    navigate("/hub");
  };

  if (invalid) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">No active game.</p>
            <Button onClick={() => navigate("/hub")}>Back to Hub</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{team?.name}</h2>
                <span className="text-muted-foreground">vs</span>
                <h2 className="text-xl font-bold">{opp?.name}</h2>
                <Badge variant="outline" className="ml-2">
                  {g.weekType} W{g.weekNumber}
                </Badge>
              </div>
              <Button variant="ghost" onClick={exit}>
                Exit
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="secondary">Q{g.clock.quarter} {fmtClock(g.clock.timeRemainingSec)}</Badge>
              <Badge variant="outline">{g.homeScore} - {g.awayScore}</Badge>
              <Badge variant="outline">{g.possession} ball</Badge>
              <Badge variant="outline">{g.down}&amp;{g.distance} @ {g.ballOn}</Badge>
              <Badge variant="outline">{g.clock.clockRunning ? "Clock: RUN" : "Clock: STOP"} ({g.clock.restartMode})</Badge>
            </div>

            {rec ? (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="secondary">Recommended</Badge>
                {rec.ranked.map((r) => (
                  <Button
                    key={r.playType}
                    size="sm"
                    variant={recVariant(r.playType, rec.best)}
                    onClick={() =>
                      r.playType === "RUN"
                        ? handlePlay(g.distance <= 3 ? "RUN" : g.distance <= 7 ? "SHORT_PASS" : "DEEP_PASS")
                        : handlePlay(r.playType)
                    }
                  >
                    {recLabel(r.playType)}
                  </Button>
                ))}
                <Badge variant="outline">Breakeven {Math.round(rec.breakevenGoRate * 100)}%</Badge>
              </div>
            ) : null}

            {g.lastResult ? <p className="text-sm text-muted-foreground pt-2">{g.lastResult}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Drive Log</div>
              <Badge variant="outline">{g.driveLog.length}</Badge>
            </div>
            <div className="max-h-[360px] overflow-auto space-y-2 pr-1">
              {g.driveLog.length === 0 ? (
                <div className="text-sm text-muted-foreground">No plays yet.</div>
              ) : (
                g.driveLog.map((e, i) => (
                  <div key={`${e.drive}-${e.play}-${i}`} className="rounded-md border p-3 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary">D{e.drive}·P{e.play}</Badge>
                      <Badge variant="outline">Q{e.quarter} {fmtClock(e.clockSec)}</Badge>
                      <Badge variant="outline">{e.possession}</Badge>
                      <Badge variant="outline">{e.down}&amp;{e.distance} @ {e.ballOn}</Badge>
                      <Badge variant="outline">{e.homeScore}-{e.awayScore}</Badge>
                      <Badge variant="outline">{e.playType}</Badge>
                    </div>
                    <div className="text-sm">{e.result}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {canShowPlay ? (
          <div className="grid md:grid-cols-2 gap-4">
            {PLAYS.map((p) => (
              <Card key={p.id} className="cursor-pointer hover:border-primary" onClick={() => handlePlay(p.id)}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <Badge variant="outline">{p.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="font-semibold">Final</p>
              <p className="text-sm text-muted-foreground">{team?.name} {g.homeScore} — {opp?.name} {g.awayScore}</p>
              <Button onClick={() => navigate("/hub")}>Back to Hub</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Playcall;
