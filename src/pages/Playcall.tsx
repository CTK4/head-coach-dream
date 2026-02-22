import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { recommendFourthDown } from "@/engine/gameSim";
import type { AggressionLevel, DefensiveLook, GameSim, PlayType, ResultTag, TempoMode } from "@/engine/gameSim";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Play catalog ──────────────────────────────────────────────────────────

type PlayDef = { id: PlayType; label: string; icon: string; desc: string };

const RUN_PLAYS: PlayDef[] = [
  { id: "INSIDE_ZONE", label: "Inside Zone", icon: "🏃", desc: "Hit the interior gap; effective vs light box" },
  { id: "OUTSIDE_ZONE", label: "Outside Zone", icon: "↪️", desc: "Attack the perimeter; exploits over-pursuit" },
  { id: "POWER", label: "Power", icon: "💪", desc: "Lead blocker through the hole; short-yardage staple" },
];

const PASS_PLAYS: PlayDef[] = [
  { id: "QUICK_GAME", label: "Quick Game", icon: "⚡", desc: "Hot routes & slants; beats blitz and man press" },
  { id: "DROPBACK", label: "Dropback Pass", icon: "📡", desc: "Full route tree; needs pass protection" },
  { id: "PLAY_ACTION", label: "Play Action", icon: "🎭", desc: "Fake run to open downfield; beats single-high" },
  { id: "SCREEN", label: "Screen", icon: "🔄", desc: "Slow-developing cutback; destroys blitz" },
];

const SPECIAL_PLAYS: PlayDef[] = [
  { id: "PUNT", label: "Punt", icon: "🦶", desc: "Flip the field" },
  { id: "FG", label: "Field Goal", icon: "🥅", desc: "Attempt 3 points" },
  { id: "SPIKE", label: "Spike", icon: "⏱️", desc: "Stop clock (incomplete)" },
  { id: "KNEEL", label: "Kneel", icon: "🧎", desc: "Bleed time safely" },
];

// ─── Utility ────────────────────────────────────────────────────────────────

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shellLabel(s: DefensiveLook["shell"]): string {
  return s === "TWO_HIGH" ? "Two-High" : "Single-High";
}
function boxLabel(b: DefensiveLook["box"]): string {
  return b === "LIGHT" ? "Light Box" : b === "HEAVY" ? "Heavy Box" : "Normal Box";
}
function blitzLabel(b: DefensiveLook["blitz"]): string {
  return b === "NONE" ? "No Blitz" : b === "POSSIBLE" ? "Blitz Possible" : "Blitz Likely";
}
function blitzVariant(b: DefensiveLook["blitz"]): "default" | "destructive" | "outline" | "secondary" {
  return b === "LIKELY" ? "destructive" : b === "POSSIBLE" ? "default" : "outline";
}

function tagIcon(kind: ResultTag["kind"]): string {
  const icons: Record<string, string> = {
    PRESSURE: "⚡", COVERAGE: "🛡️", BOX: "📦", MISMATCH: "🎯", EXECUTION: "⚙️", MISTAKE: "❌", SITUATION: "📍",
  };
  return icons[kind] ?? "•";
}

function statLine(g: GameSim): string {
  const h = g.stats.home;
  const a = g.stats.away;
  return `Home: ${h.rushYards} rush ${h.passYards} pass ${h.turnovers} TO | Away: ${a.rushYards} rush ${a.passYards} pass ${a.turnovers} TO`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DefLookPanel({ look }: { look: DefensiveLook }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Defense:</span>
      <Badge variant="outline">{shellLabel(look.shell)}</Badge>
      <Badge variant="outline">{boxLabel(look.box)}</Badge>
      <Badge variant={blitzVariant(look.blitz)}>{blitzLabel(look.blitz)}</Badge>
    </div>
  );
}

function ResultRibbon({ tags }: { tags: ResultTag[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {tags.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {tagIcon(t.kind)} {t.text}
        </span>
      ))}
    </div>
  );
}

function PlayCard({ play, onClick }: { play: PlayDef; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onClick}>
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm flex items-center gap-1">
            <span>{play.icon}</span>
            <span>{play.label}</span>
          </span>
          <Badge variant="outline" className="text-xs">{play.id.replace(/_/g, " ")}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{play.desc}</p>
      </CardContent>
    </Card>
  );
}

function PostgamePanel({ g, homeName, awayName }: { g: GameSim; homeName: string; awayName: string }) {
  const h = g.stats.home;
  const a = g.stats.away;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Final Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-center">
          {homeName} {g.homeScore} — {awayName} {g.awayScore}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">{homeName}</p>
            <p>Rushing: {h.rushAttempts} att, {h.rushYards} yds</p>
            <p>Passing: {h.completions}/{h.passAttempts}, {h.passYards} yds</p>
            <p>TDs: {h.tds} | Turnovers: {h.turnovers}</p>
            <p>Sacks allowed: {h.sacks}</p>
            {h.topRusherYards > 0 && <p>Top rusher: {h.topRusherYards} yds</p>}
            {h.topReceiverYards > 0 && <p>Top receiver: {h.topReceiverYards} yds</p>}
          </div>
          <div>
            <p className="font-semibold mb-1">{awayName}</p>
            <p>Rushing: {a.rushAttempts} att, {a.rushYards} yds</p>
            <p>Passing: {a.completions}/{a.passAttempts}, {a.passYards} yds</p>
            <p>TDs: {a.tds} | Turnovers: {a.turnovers}</p>
            <p>Sacks allowed: {a.sacks}</p>
            {a.topRusherYards > 0 && <p>Top rusher: {a.topRusherYards} yds</p>}
            {a.topReceiverYards > 0 && <p>Top receiver: {a.topReceiverYards} yds</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

const Playcall = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [, force] = useState(0);
  const [aggression, setAggression] = useState<AggressionLevel>("NORMAL");
  const [tempo, setTempo] = useState<TempoMode>("NORMAL");

  const teamId = state.acceptedOffer?.teamId;
  const g = state.game;

  const team = teamId ? getTeamById(teamId) : null;
  const opp = g.awayTeamId && g.awayTeamId !== "AWAY" ? getTeamById(g.awayTeamId) : null;

  const invalid = !teamId || !opp || !g.weekType || !g.weekNumber;
  const isOver = g.clock.quarter === 4 && g.clock.timeRemainingSec === 0;
  const canShowPlay = useMemo(() => !invalid && !isOver, [invalid, isOver]);

  const rec = useMemo(
    () => (g.down === 4 ? recommendFourthDown(g) : null),
    [g]
  );

  const handlePlay = (playType: PlayType) => {
    dispatch({ type: "RESOLVE_PLAY", payload: { playType, aggression, tempo } });
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

  const homeName = team?.name ?? "Home";
  const awayName = opp?.name ?? "Away";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* ── Scoreboard ── */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{homeName}</h2>
                <span className="text-muted-foreground">vs</span>
                <h2 className="text-xl font-bold">{awayName}</h2>
                <Badge variant="outline" className="ml-2">
                  {g.weekType} W{g.weekNumber}
                </Badge>
              </div>
              <Button variant="ghost" onClick={exit}>Exit</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="secondary">Q{g.clock.quarter} {fmtClock(g.clock.timeRemainingSec)}</Badge>
              <Badge variant="outline" className="font-bold text-base">{g.homeScore} – {g.awayScore}</Badge>
              <Badge variant="outline">{g.possession} ball</Badge>
              <Badge variant="outline">{g.down}&amp;{g.distance} @ {g.ballOn}</Badge>
              <Badge variant="outline">{g.clock.clockRunning ? "⏱ Running" : "⏱ Stopped"}</Badge>
            </div>

            {/* Defensive look */}
            {g.defLook && canShowPlay && <DefLookPanel look={g.defLook} />}

            {/* Last result + tags */}
            {g.lastResult && (
              <div className="pt-1 space-y-1">
                <p className="text-sm font-medium">{g.lastResult}</p>
                {g.lastResultTags && g.lastResultTags.length > 0 && <ResultRibbon tags={g.lastResultTags} />}
              </div>
            )}

            {/* 4th down recommendation */}
            {rec && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary">Recommended</Badge>
                {rec.ranked.map((r) => (
                  <Button key={r.playType} size="sm" variant={r.playType === rec.best ? "default" : "outline"}
                    onClick={() => handlePlay(r.playType === "RUN" ? "INSIDE_ZONE" : r.playType)}>
                    {r.playType === "RUN" ? "Go" : r.playType}
                  </Button>
                ))}
                <Badge variant="outline">Breakeven {Math.round(rec.breakevenGoRate * 100)}%</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {canShowPlay ? (
          <>
            {/* ── Aggression / Tempo toggles ── */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aggression</p>
                    <div className="flex gap-1">
                      {(["CONSERVATIVE", "NORMAL", "AGGRESSIVE"] as AggressionLevel[]).map((a) => (
                        <Button key={a} size="sm" variant={aggression === a ? "default" : "outline"}
                          onClick={() => setAggression(a)}>
                          {a === "CONSERVATIVE" ? "Conserv." : a === "AGGRESSIVE" ? "Aggress." : "Normal"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tempo</p>
                    <div className="flex gap-1">
                      {(["NORMAL", "HURRY_UP"] as TempoMode[]).map((t) => (
                        <Button key={t} size="sm" variant={tempo === t ? "default" : "outline"}
                          onClick={() => setTempo(t)}>
                          {t === "HURRY_UP" ? "Hurry-Up" : "Normal"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Play call grid ── */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Run Plays</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {RUN_PLAYS.map((p) => <PlayCard key={p.id} play={p} onClick={() => handlePlay(p.id)} />)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pass Plays</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PASS_PLAYS.map((p) => <PlayCard key={p.id} play={p} onClick={() => handlePlay(p.id)} />)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Specials</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPECIAL_PLAYS.map((p) => <PlayCard key={p.id} play={p} onClick={() => handlePlay(p.id)} />)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <PostgamePanel g={g} homeName={homeName} awayName={awayName} />
        )}

        {/* ── Drive Log ── */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Drive Log</div>
              <Badge variant="outline">{g.driveLog.length}</Badge>
            </div>
            {!isOver && (
              <p className="text-xs text-muted-foreground">{statLine(g)}</p>
            )}
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
                      <Badge variant="outline">{e.playType.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="text-sm">{e.result}</div>
                    {e.resultTags.length > 0 && <ResultRibbon tags={e.resultTags} />}
                  </div>
                ))
              )}
            </div>
            {isOver && (
              <Button onClick={() => navigate("/hub")}>Back to Hub</Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Playcall;

