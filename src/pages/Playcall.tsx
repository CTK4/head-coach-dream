import { useCallback, useEffect, useMemo, useState } from "react";
import type { DefensiveCall } from "@/engine/defense/defensiveCalls";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { autoPickPlay, evaluatePlayConcepts, recommendFourthDown, type SituationBucket } from "@/engine/gameSim";
import { formatWeatherSummary } from "@/engine/weather/generateGameWeather";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { resolveQbArchetypeTag } from "@/engine/qb/qbArchetype";
import { FATIGUE_THRESHOLDS, HIGH_WORKLOAD_THRESHOLD } from "@/engine/fatigue";
import { PERSONNEL_PACKAGE_DEFINITIONS, getDefensiveReaction, type DefensivePackage, type PersonnelPackage } from "@/engine/personnel";
import type { AggressionLevel, DefensiveLook, GameSim, PlayType, ResultTag, TempoMode } from "@/engine/gameSim";
import {
  filterEligiblePlayConcepts,
  getOffensePlaybookConcepts,
  hasDefensePlaybook,
  type PlayFormation,
} from "@/engine/playbooks/playbookCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameLog from "@/components/GameLog/GameLog";
import { adaptDriveLog } from "@/components/GameLog/adaptDriveLog";
import PlayRibbon from "@/components/game/PlayRibbon";
import DefensiveCallDrawer from "@/components/game/DefensiveCallDrawer";

// ─── Play catalog ──────────────────────────────────────────────────────────

type PlayDef = { id: PlayType; label: string; icon: string; desc: string };

const RUN_PLAYS: PlayDef[] = [
  { id: "INSIDE_ZONE", label: "Inside Zone", icon: "🏃", desc: "Hit the interior gap; effective vs light box" },
  { id: "OUTSIDE_ZONE", label: "Outside Zone", icon: "↪️", desc: "Attack the perimeter; exploits over-pursuit" },
  { id: "POWER", label: "Power", icon: "💪", desc: "Lead blocker through the hole; short-yardage staple" },
];

const PASS_PLAYS: PlayDef[] = [
  { id: "RPO_READ", label: "RPO Read", icon: "🧠", desc: "Read conflict defender; throw or keep" },
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

const PLAYBOOK: PlayDef[] = [...RUN_PLAYS, ...PASS_PLAYS, ...SPECIAL_PLAYS];

const FORMATION_LABELS: Record<PlayFormation, string> = {
  UNDER_CENTER: "Under Center",
  SHOTGUN: "Shotgun",
  PISTOL: "Pistol",
  HEAVY: "Heavy",
  SPECIAL_TEAMS: "Special Teams",
};

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

function tagIcon(kind: ResultTag["kind"]): string {
  const icons: Record<string, string> = {
    PRESSURE: "⚡", COVERAGE: "🛡️", BOX: "📦", MISMATCH: "🎯", EXECUTION: "⚙️", MISTAKE: "❌", SITUATION: "📍",
  };
  return icons[kind] ?? "•";
}


function fatigueTone(v: number): string {
  if (v >= FATIGUE_THRESHOLDS.INJURY) return "bg-red-500";
  if (v >= FATIGUE_THRESHOLDS.SPEED) return "bg-orange-500";
  if (v >= FATIGUE_THRESHOLDS.ACCURACY) return "bg-yellow-500";
  return "bg-green-500";
}


function personnelToneClass(code: PersonnelPackage): string {
  const tone = PERSONNEL_PACKAGE_DEFINITIONS[code].toneClass;
  if (tone === "light") return "bg-sky-100 text-sky-900";
  if (tone === "heavy") return "bg-slate-800 text-slate-100";
  return "bg-indigo-100 text-indigo-900";
}

function FatigueBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full rounded bg-muted h-2 overflow-hidden">
      <div className={`${fatigueTone(safe)} h-2 transition-all duration-300`} style={{ width: `${safe}%` }} />
    </div>
  );
}

function statLine(g: GameSim): string {
  const h = g.stats.home;
  const a = g.stats.away;
  return `Home: ${h.rushYards} rush ${h.passYards} pass ${h.turnovers} TO | Away: ${a.rushYards} rush ${a.passYards} pass ${a.turnovers} TO`;
}

const PERSONNEL_BY_DEF_PACKAGE: Record<DefensivePackage, string> = {
  Base: "Base 4-3",
  Nickel: "Nickel 4-2-5",
  Dime: "Dime 4-1-6",
  GoalLine: "Goal Line",
};

const FRONT_BY_DEF_PACKAGE: Record<DefensivePackage, string> = {
  Base: "Even front",
  Nickel: "Over front",
  Dime: "Mug front",
  GoalLine: "Bear front",
};

const BOX_COUNT_BY_PACKAGE: Record<DefensivePackage, Record<DefensiveLook["box"], number>> = {
  Base: { LIGHT: 6, NORMAL: 7, HEAVY: 8 },
  Nickel: { LIGHT: 5, NORMAL: 6, HEAVY: 7 },
  Dime: { LIGHT: 5, NORMAL: 6, HEAVY: 7 },
  GoalLine: { LIGHT: 7, NORMAL: 8, HEAVY: 9 },
};

function toSituationLabel(bucket?: SituationBucket): string {
  if (!bucket) return "Unknown";
  return bucket === "3RD_8_PLUS" ? "3rd & 8+" : bucket.replace(/_/g, " ").replace("3RD", "3rd").replace("4TH", "4th");
}

function compactCallLabel(signature: string): string {
  const [pkg, shell, , blitz] = signature.split(":");
  const shellShort = shell === "SINGLE_HIGH" ? "1H" : shell === "TWO_HIGH" ? "2H" : "--";
  const blitzShort = blitz === "LIKELY" ? "B+" : blitz === "POSSIBLE" ? "B?" : "B0";
  return `${pkg} ${shellShort} ${blitzShort}`;
}

function possessionLabel(g: GameSim): string {
  const teamId = g.possession === "HOME" ? g.homeTeamId : g.awayTeamId;
  return `● ${teamId} ball`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DefensiveIntelPanel({ g }: { g: GameSim }) {
  const defensivePackage = g.selectedDefensivePackage ?? "Nickel";
  const look = g.defLook;
  const windowBuckets = g.situationWindowCounts ?? {};
  const windowTotals = Object.values(windowBuckets).reduce((acc, item) => {
    if (!item) return acc;
    acc.total += item.total;
    acc.blitzLikely += item.blitzLikely;
    return acc;
  }, { total: 0, blitzLikely: 0 });
  const blitzRate = windowTotals.total > 0 ? (windowTotals.blitzLikely / windowTotals.total) * 100 : 0;
  const recentDefensiveCalls = g.recentDefensiveCalls ?? [];
  const currentSituation = recentDefensiveCalls[0]?.situationBucket;
  const currentSituationCounts = currentSituation ? windowBuckets[currentSituation] : undefined;
  const tendencyEntries = Object.entries(currentSituationCounts?.callsBySignature ?? {}).sort((a, b) => b[1] - a[1]);
  const topCall = tendencyEntries[0];
  const topCallPct = currentSituationCounts && currentSituationCounts.total > 0 && topCall
    ? (topCall[1] / currentSituationCounts.total) * 100
    : 0;
  const defendingRatings = g.possession === "HOME" ? g.awayRatings : g.homeRatings;
  const pressureScore = ((defendingRatings?.blitzImpact ?? 68) / 100) * 0.55 + (blitzRate / 100) * 0.45;
  const pressureLabel = pressureScore >= 0.78 ? "High" : pressureScore >= 0.62 ? "Moderate" : "Low";
  const observedSnaps = g.observedSnaps ?? 0;
  const CONFIDENCE_WINDOW = 12;
  const MAX_CONFIDENCE_DOTS = 6;
  const confidence = Math.min(100, Math.round((observedSnaps / CONFIDENCE_WINDOW) * 100));
  const confidenceDots = Math.min(
    MAX_CONFIDENCE_DOTS,
    Math.round((confidence / 100) * MAX_CONFIDENCE_DOTS),
  );

  return (
    <Card className="border-slate-700/70 bg-slate-950/60 text-slate-100">
      <CardContent className="p-4 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-1 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Defense</p>
          <p>- {PERSONNEL_BY_DEF_PACKAGE[defensivePackage]}</p>
          <p>- {look ? shellLabel(look.shell) : "Unknown shell"}</p>
          <p>- {FRONT_BY_DEF_PACKAGE[defensivePackage]}</p>
          <p>- {look ? `${BOX_COUNT_BY_PACKAGE[defensivePackage][look.box]} in box` : "Unknown box"}</p>
        </div>
        <div className="hidden md:block w-px bg-slate-700/80" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Blitz</span><span className="font-semibold">{Math.round(blitzRate)}%</span></div>
          <div className="flex justify-between gap-3"><span>Last calls</span><span className="font-semibold text-right">{recentDefensiveCalls.map((c) => compactCallLabel(c.callSignature)).join(" / ") || "N/A"}</span></div>
          <div className="rounded border border-slate-700/80 px-2 py-1">
            <span className="font-semibold">{toSituationLabel(currentSituation)}</span>
            <span className="text-slate-300"> → {topCall ? `${compactCallLabel(topCall[0])} (${Math.round(topCallPct)}%)` : "No tendency yet"}</span>
          </div>
          <div className="flex justify-between"><span>Pressure on {toSituationLabel(currentSituation)}</span><span className="font-semibold">{pressureLabel}</span></div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-amber-300">◔ {Math.round(confidence)}%</span>
            <span className="flex items-center gap-1" aria-label="confidence-meter">
              {Array.from({ length: 6 }).map((_, idx) => (
                <span key={idx} className={`h-2 w-2 rounded-full ${idx < confidenceDots ? "bg-amber-300" : "bg-slate-600"}`} />
              ))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
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

function compactPct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

type OffensiveUserMode = "FULL_AUTO" | "KEY_SITUATIONS" | "FULL_PLAYCALLING";

function resolveOffensiveUserMode(controlMode: GameSim["controlMode"]): OffensiveUserMode {
  if (controlMode === "COACH") return "FULL_AUTO";
  if (controlMode === "HYBRID") return "KEY_SITUATIONS";
  return "FULL_PLAYCALLING";
}

function isKeySituation(g: GameSim): boolean {
  const isLateHalf = (g.clock.quarter === 2 || g.clock.quarter === 4) && g.clock.timeRemainingSec <= 120;
  const isRedZone = g.ballOn >= 80;
  const isHighLeverageDown = g.down >= 3;
  const isGoalToGo = g.ballOn >= 90 && g.distance <= 3;
  return isLateHalf || isRedZone || isHighLeverageDown || isGoalToGo;
}

function gradeFromScore(score: number): string {
  if (score >= 0.62) return "A";
  if (score >= 0.5) return "B";
  if (score >= 0.4) return "C";
  return "D";
}

function FieldPreview({ ballOn, distance, selectedPlay, defensiveLook }: { ballOn: number; distance: number; selectedPlay?: PlayType; defensiveLook?: DefensiveLook }) {
  const width = 360;
  const xForYardline = (yard: number) => 20 + Math.max(0, Math.min(100, yard)) * 3.2;
  const losX = xForYardline(ballOn);
  const firstDownX = xForYardline(Math.min(100, ballOn + distance));
  const stem = selectedPlay ? (selectedPlay.includes("ZONE") || selectedPlay === "POWER" ? "RUN" : selectedPlay === "PUNT" || selectedPlay === "FG" ? "SPECIAL" : "PASS") : "PASS";
  const path = stem === "RUN"
    ? `M ${losX} 64 C ${losX + 18} 58, ${losX + 26} 44, ${losX + 44} 40`
    : stem === "SPECIAL"
      ? `M ${losX} 64 C ${losX + 22} 46, ${losX + 48} 30, ${losX + 86} 18`
      : `M ${losX} 64 C ${losX + 20} 58, ${losX + 34} 34, ${losX + 64} 28`;

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zone 3 · Field Preview</p>
        <svg viewBox={`0 0 ${width} 84`} className="w-full rounded border bg-emerald-950/90">
          <rect x="20" y="14" width="320" height="56" rx="6" fill="#14532d" />
          <line x1={losX} x2={losX} y1={16} y2={68} stroke="#f8fafc" strokeWidth="2" />
          <line x1={firstDownX} x2={firstDownX} y1={16} y2={68} stroke="#facc15" strokeWidth="2" strokeDasharray="4 3" />
          <path d={path} stroke="#38bdf8" strokeWidth="3" fill="none" />
          <circle cx={losX} cy="64" r="3.5" fill="#f8fafc" />
        </svg>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">LOS {ballOn}</Badge>
          <Badge variant="outline">Line to gain {Math.min(100, ballOn + distance)}</Badge>
          <Badge variant="secondary">{selectedPlay ? selectedPlay.replace(/_/g, " ") : "Select play"}</Badge>
          {defensiveLook ? <Badge variant="outline">Leverage: {boxLabel(defensiveLook.box)} · {shellLabel(defensiveLook.shell)}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function buildPlayerPositionMap(g: GameSim): Record<string, string> {
  const map: Record<string, string> = {};
  for (const side of ["HOME", "AWAY"] as const) {
    for (const [pos, playerId] of Object.entries(g.trackedPlayers[side] ?? {})) {
      if (playerId) map[playerId] = pos;
    }
  }
  return map;
}

function PostgamePanel({ g, homeName, awayName, fatigueById }: { g: GameSim; homeName: string; awayName: string; fatigueById: Record<string, { fatigue: number; last3SnapLoads: number[] }> }) {
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
        <div className="space-y-2">
          <p className="text-sm font-semibold">Unicorn Contributions</p>
          {(g.unicornImpactLog ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No unicorn boosts triggered this game.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(g.unicornImpactLog ?? []).slice(-6).map((impact) => (
                <Badge key={`${impact.playId}-${impact.playerId}`} variant="secondary">🦄 {impact.archetypeId}: {impact.description}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">High Workload</p>
          {Object.entries(g.snapLoadThisGame).filter(([playerId]) => (g.playerFatigue[playerId] ?? 50) > HIGH_WORKLOAD_THRESHOLD).length === 0 ? (
            <p className="text-xs text-muted-foreground">No warning badges.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(() => {
                const posMap = buildPlayerPositionMap(g);
                return Object.entries(g.snapLoadThisGame).map(([playerId, snaps]) => {
                  const fatigue = g.playerFatigue[playerId] ?? 50;
                  if (fatigue <= HIGH_WORKLOAD_THRESHOLD) return null;
                  const pos = posMap[playerId] ?? "?";
                  return <Badge key={playerId} variant="destructive">{pos} – {snaps} snaps</Badge>;
                });
              })()}
            </div>
          )}
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
  const [selectedPlayId, setSelectedPlayId] = useState<PlayType | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<PlayFormation>("SHOTGUN");
  const offensePlaybookId = state.playbooks?.offensePlaybookId;
  const defensePlaybookId = state.playbooks?.defensePlaybookId;

  const teamId = state.acceptedOffer?.teamId;
  const g = state.game;
  const pendingCall = g.pendingOffensiveCall;
  const aggression = pendingCall?.aggression ?? g.aggression;
  const tempo = pendingCall?.tempo ?? g.tempo;
  const personnelPackage = pendingCall?.personnelPackage ?? g.currentPersonnelPackage ?? "11";

  const team = teamId ? getTeamById(teamId) : null;
  const opp = g.awayTeamId && g.awayTeamId !== "AWAY" ? getTeamById(g.awayTeamId) : null;

  const invalid = !teamId || !opp || !g.weekType || !g.weekNumber;
  const isOver = g.clock.quarter === 4 && g.clock.timeRemainingSec === 0;
  const canShowPlay = useMemo(() => !invalid && !isOver, [invalid, isOver]);

  const roster = useMemo(
    () => (teamId ? getEffectivePlayersByTeam(state, teamId) : []),
    [state.playerTeamOverrides, state.playerContractOverrides, teamId],
  );

  const userTeamQbArchetype = useMemo(() => {
    const qb = roster
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "QB")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0];
    return qb ? resolveQbArchetypeTag(qb as any) : "GAME_MANAGER" as const;
  }, [roster]);
  const canCallRpo = userTeamQbArchetype === "DUAL_THREAT" || userTeamQbArchetype === "SCRAMBLER";
  const userIsHomeTeam = teamId === g.homeTeamId;
  const userOffensivePossession = userIsHomeTeam ? g.possession === "HOME" : g.possession === "AWAY";
  const offenseUserMode = resolveOffensiveUserMode(g.controlMode);
  const pauseForUserOffenseSnap = userOffensivePossession
    && (offenseUserMode === "FULL_PLAYCALLING" || (offenseUserMode === "KEY_SITUATIONS" && isKeySituation(g)));

  useEffect(() => {
    if (g.pendingOffensiveCall) return;
    const defaultCall = {
      playType: selectedPlayId ?? undefined,
      aggression: g.aggression,
      tempo: g.tempo,
      personnelPackage: g.currentPersonnelPackage ?? "11",
    };
    dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: defaultCall });
  }, [dispatch, g.aggression, g.currentPersonnelPackage, g.pendingOffensiveCall, g.tempo, selectedPlayId]);

  useEffect(() => {
    if (pendingCall?.playType && pendingCall.playType !== selectedPlayId) setSelectedPlayId(pendingCall.playType);
  }, [pendingCall?.playType, selectedPlayId]);

  const rec = useMemo(
    () => (g.down === 4 ? recommendFourthDown(g) : null),
    [g]
  );

  const playbookConcepts = useMemo(() => {
    if (!offensePlaybookId) return [];
    return getOffensePlaybookConcepts(offensePlaybookId).filter((concept) => canCallRpo || concept.playType !== "RPO_READ");
  }, [offensePlaybookId, canCallRpo]);

  const availableFormations = useMemo(() => {
    const uniq = Array.from(new Set(playbookConcepts.map((concept) => concept.formation)));
    return uniq.length ? uniq : ["SHOTGUN" as PlayFormation];
  }, [playbookConcepts]);

  const legalConcepts = useMemo(() => {
    return filterEligiblePlayConcepts(
      playbookConcepts,
      { down: g.down, distance: g.distance, ballOn: g.ballOn, quarter: Number(g.clock.quarter), clockSec: g.clock.timeRemainingSec },
      selectedFormation,
    );
  }, [playbookConcepts, g.down, g.distance, g.ballOn, g.clock.quarter, g.clock.timeRemainingSec, selectedFormation]);

  const rankedCards = useMemo(() => {
    if (!offensePlaybookId || !defensePlaybookId || !hasDefensePlaybook(defensePlaybookId)) return [];
    const allowedPlayIds = legalConcepts.map((concept) => concept.playType);
    if (!allowedPlayIds.length) return [];
    const evaluations = evaluatePlayConcepts(g, allowedPlayIds, { aggression, tempo, personnelPackage, look: g.defLook });
    return evaluations
      .map((evaluation) => ({
        evaluation,
        play: PLAYBOOK.find((p) => p.id === evaluation.playType) ?? PLAYBOOK[0],
      }))
      .sort((a, b) => b.evaluation.score - a.evaluation.score);
  }, [g, aggression, tempo, personnelPackage, offensePlaybookId, defensePlaybookId, legalConcepts]);

  const handlePlay = useCallback((playType: PlayType) => {
    dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { playType, personnelPackage, aggression, tempo } });
    dispatch({ type: "RESOLVE_PLAY", payload: { playType, personnelPackage, aggression, tempo } });
    setSelectedPlayId(null);
    force((x) => x + 1);
  }, [aggression, dispatch, personnelPackage, tempo]);

  const handleDefensiveConfirm = (call: DefensiveCall | "AUTO") => {
    if (call === "AUTO") {
      dispatch({ type: "CLEAR_DEFENSIVE_CALL" });
    } else {
      dispatch({ type: "SET_DEFENSIVE_CALL", payload: { call } });
    }
    if (selectedCard?.play.id) handlePlay(selectedCard.play.id);
  };

  const selectedCard = rankedCards.find((c) => c.play.id === selectedPlayId) ?? rankedCards[0];
  const legalPlayIds = new Set(legalConcepts.map((concept) => concept.playType));
  const missingPlaybookSelection = !offensePlaybookId || !defensePlaybookId || !hasDefensePlaybook(defensePlaybookId);
  const needsDefensiveCall = Boolean(g.needsDefensiveCall && g.defensiveCallSituation);
  const autoResolveSnap = canShowPlay && !needsDefensiveCall && !pauseForUserOffenseSnap;
  const showAutoAdvance = !(offenseUserMode === "FULL_PLAYCALLING" && userOffensivePossession);

  useEffect(() => {
    if (!autoResolveSnap) return;
    handlePlay(autoPickPlay(g));
  }, [autoResolveSnap, g, handlePlay]);

  useEffect(() => {
    if (!availableFormations.includes(selectedFormation)) {
      setSelectedFormation(availableFormations[0]);
    }
  }, [availableFormations, selectedFormation]);

  useEffect(() => {
    if (selectedPlayId && !rankedCards.some((card) => card.play.id === selectedPlayId)) {
      setSelectedPlayId(null);
    }
  }, [selectedPlayId, rankedCards]);

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

  if (missingPlaybookSelection) {
    return <div className="min-h-screen p-4 md:p-8 text-amber-300 font-semibold">Select Playbook before calling plays.</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        <div className="sticky top-2 z-20">
          <Card className="border-slate-700/70 bg-slate-950/80 text-slate-100 backdrop-blur">
            <CardContent className="py-2 px-4">
              <div className="flex flex-wrap items-center gap-2 text-base font-medium">
                <span>{homeName} {g.homeScore}</span>
                <span className="text-slate-400">|</span>
                <span>{awayName} {g.awayScore}</span>
                <span className="text-slate-400">|</span>
                <span>{g.clock.quarter}Q {fmtClock(g.clock.timeRemainingSec)}</span>
                <span className="text-slate-400">|</span>
                <span>{g.down}&amp;{g.distance}</span>
                <span className="text-slate-400">|</span>
                <span>Ball: {g.ballOn}</span>
                <span className="text-slate-400">|</span>
                <span>{possessionLabel(g)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <Badge variant="outline">{possessionLabel(g)}</Badge>
              <Badge variant="outline">{g.down}&amp;{g.distance} @ {g.ballOn}</Badge>
              <Badge variant="outline">{g.clock.clockRunning ? "⏱ Running" : "⏱ Stopped"}</Badge>
              <Badge variant="outline">{formatWeatherSummary(g.weather)}</Badge>
            </div>

            {/* Last result + tags */}
            <PlayRibbon latestPlay={g.lastPlayResult} playType={g.driveLog.length > 0 ? g.driveLog[g.driveLog.length - 1].playType : undefined} />

            {g.lastResult && (
              <div className="pt-1 space-y-1">
                <p className="text-sm font-medium">{g.lastResult}</p>
                {g.lastResultTags && g.lastResultTags.length > 0 && <ResultRibbon tags={g.lastResultTags} />}
              </div>
            )}

            <div className="pt-1 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tracked Fatigue</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(g.trackedPlayers[g.possession] ?? {}).map(([pos, playerId]) => {
                  if (!playerId) return null;
                  const v = g.playerFatigue[playerId] ?? 50;
                  return (
                    <div key={`${pos}-${playerId}`} className="rounded border p-2">
                      <div className="flex items-center justify-between text-xs mb-1"><span>{pos}</span><span>{Math.round(v)}</span></div>
                      <FatigueBar value={v} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={personnelToneClass(personnelPackage)} title={`${PERSONNEL_PACKAGE_DEFINITIONS[personnelPackage].label} — ${PERSONNEL_PACKAGE_DEFINITIONS[personnelPackage].description}`}>
                  {personnelPackage}
                </Badge>
                <div className="flex gap-1 overflow-x-auto">
                  {(["10","11","12","21","22"] as PersonnelPackage[]).map((pkg) => (
                    <Button key={pkg} size="sm" variant={personnelPackage === pkg ? "default" : "outline"} onClick={() => dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { personnelPackage: pkg } })}>{pkg}</Button>
                  ))}
                </div>
              </div>
              {(() => {
                const reactions = getDefensiveReaction(g.down, g.distance, personnelPackage);
                const primary = reactions[0];
                const secondary = reactions[1];
                return (
                  <p className="text-xs text-muted-foreground">
                    Defense likely in: <span className="font-medium text-foreground">{primary?.defensivePackage} ({primary?.probability}%)</span>
                    {secondary && secondary.probability > 15 ? <span> · {secondary.defensivePackage} ({secondary.probability}%)</span> : null}
                  </p>
                );
              })()}
            </div>

            {/* 4th down recommendation */}
            {rec && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary">Recommended</Badge>
                {rec.ranked.map((r) => {
                  const playType = r.playType === "RUN" ? "INSIDE_ZONE" : r.playType;
                  const legal = legalPlayIds.has(playType);
                  if (!legal) return null;
                  return (
                    <Button key={r.playType} size="sm" variant={r.playType === rec.best ? "default" : "outline"}
                      onClick={() => handlePlay(playType)}>
                      {r.playType === "RUN" ? "Go" : r.playType}
                    </Button>
                  );
                })}
                <Badge variant="outline">Breakeven {Math.round(rec.breakevenGoRate * 100)}%</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {canShowPlay ? (
          <>
            <DefensiveIntelPanel g={g} />
            <FieldPreview ballOn={g.ballOn} distance={g.distance} selectedPlay={selectedCard?.play.id} defensiveLook={g.defLook} />

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formation</p>
                <div className="flex flex-wrap gap-1">
                  {availableFormations.map((formation) => (
                    <Button
                      key={formation}
                      size="sm"
                      variant={selectedFormation === formation ? "default" : "outline"}
                      onClick={() => {
                        setSelectedFormation(formation);
                        setSelectedPlayId(null);
                      }}
                    >
                      {FORMATION_LABELS[formation]}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Only legal calls for this down/distance/clock are shown.</p>
              </CardContent>
            </Card>

            {/* ── Aggression / Tempo toggles ── */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aggression</p>
                    <div className="flex gap-1">
                      {(["AGGRESSIVE", "NORMAL", "CONSERVATIVE"] as AggressionLevel[]).map((a) => (
                        <Button key={a} size="sm" variant={aggression === a ? "default" : "outline"}
                          onClick={() => dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { aggression: a } })}>
                          {a === "CONSERVATIVE" ? "Conservative" : a === "AGGRESSIVE" ? "Aggressive" : "Balanced"}
                        </Button>
                      ))}
                    </div>
                  </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Defense Control</p>
                  <div className="flex gap-1">
                    {(["OFF", "KEY_DOWNS", "ALWAYS"] as const).map((mode) => (
                      <Button key={mode} size="sm" variant={g.defenseUserMode === mode ? "default" : "outline"} onClick={() => dispatch({ type: "SET_DEFENSE_USER_MODE", payload: { mode } })}>
                        {mode === "KEY_DOWNS" ? "Key Downs" : mode}
                      </Button>
                    ))}
                  </div>
                </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tempo</p>
                    <div className="flex gap-1">
                      {(["NORMAL", "MILK", "HURRY_UP"] as TempoMode[]).map((t) => (
                        <Button key={t} size="sm" variant={tempo === t ? "default" : "outline"}
                          onClick={() => dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { tempo: t } })}>
                          {t === "HURRY_UP" ? "Hurry" : t === "MILK" ? "Milk" : "Normal"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Zone 5 ranked card grid ── */}
            <div className="space-y-3">
              {rankedCards.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">No legal concepts available for this formation and game state. Choose another formation.</CardContent>
                </Card>
              ) : null}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rankedCards.map(({ play, evaluation }) => {
                  const isSelected = selectedPlayId === play.id;
                  const lock = evaluation.score >= 0.62;
                  const variance = evaluation.risk >= 0.45;
                  const userSide = g.homeTeamId === teamId ? "home" : "away";
                  const todayStat = play.id === "INSIDE_ZONE" || play.id === "OUTSIDE_ZONE" || play.id === "POWER"
                    ? `${g.stats[userSide].rushYards} rush yds`
                    : `${g.stats[userSide].passYards} pass yds`;
                  return (
                    <Card key={play.id} className={`cursor-pointer transition-colors ${isSelected ? "border-primary" : "hover:border-primary/50"}`} onClick={() => { setSelectedPlayId(play.id); dispatch({ type: "SET_PENDING_OFFENSIVE_CALL", payload: { playType: play.id } }); }}>
                    <Card
                      key={play.id}
                      className={`transition-colors ${pauseForUserOffenseSnap ? "cursor-pointer" : "cursor-not-allowed opacity-70"} ${isSelected ? "border-primary" : "hover:border-primary/50"}`}
                      onClick={() => pauseForUserOffenseSnap && setSelectedPlayId(play.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold flex items-center gap-1">{play.icon} {play.label}</span>
                          <Badge variant="outline" className="text-[10px]">{play.id.includes("PASS") || play.id === "SCREEN" || play.id === "QUICK_GAME" ? "PASS" : play.id === "PUNT" || play.id === "FG" ? "SPECIAL" : "RUN"}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={evaluation.boxAdvantage >= 0 ? "secondary" : "destructive"} className="text-[10px]">Box {evaluation.boxAdvantage >= 0 ? "Adv" : "Stress"}</Badge>
                          <Badge variant="outline" className="text-[10px]">Explosive {compactPct(evaluation.explosiveChance)}</Badge>
                          <Badge variant="outline" className="text-[10px]">{todayStat}</Badge>
                        </div>
                        <div className="h-1.5 w-full rounded bg-muted overflow-hidden">
                          <div className="h-1.5 bg-primary" style={{ width: `${Math.round(evaluation.score * 100)}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <Badge variant="secondary">Grade {gradeFromScore(evaluation.score)}</Badge>
                          <Badge variant="outline">Conf {compactPct(evaluation.confidence)}</Badge>
                          <Badge variant={evaluation.risk > 0.38 ? "destructive" : "outline"}>Risk {compactPct(evaluation.risk)}</Badge>
                          {lock ? <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">LOCK</Badge> : null}
                          {variance ? <Badge variant="destructive">VARIANCE</Badge> : null}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Yards {evaluation.yards.low}/{evaluation.yards.median}/{evaluation.yards.high} · Success {compactPct(evaluation.expectedSuccessProbability)}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <div className="text-xs text-muted-foreground">Confirm selected call: <span className="font-semibold text-foreground">{selectedCard?.play.label ?? "None"}</span></div>
                <div className="flex items-center gap-2">
                  {showAutoAdvance ? (
                    <Button size="sm" variant="outline" disabled={needsDefensiveCall} onClick={() => dispatch({ type: "SIMULATE_REST_OF_GAME" })}>Sim Rest</Button>
                  ) : null}
                  <Button size="sm" disabled={!selectedCard || needsDefensiveCall || !pauseForUserOffenseSnap} onClick={() => selectedCard && handlePlay(selectedCard.play.id)}>Call Play</Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recommended stem updates instantly from card selection. Two-tap flow: select then confirm.</p>
              </div>
            </div>
          </>
        ) : (
          <PostgamePanel g={g} homeName={homeName} awayName={awayName} fatigueById={state.playerFatigueById} />
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
            <GameLog entries={adaptDriveLog(g.driveLog)} isLive={!isOver} />
            {isOver && (
              <Button onClick={() => navigate("/hub")}>Back to Hub</Button>
            )}
          </CardContent>
        </Card>

      </div>
      {g.defensiveCallSituation ? (
        <DefensiveCallDrawer
          open={needsDefensiveCall}
          situation={g.defensiveCallSituation}
          onConfirm={handleDefensiveConfirm}
        />
      ) : null}
    </div>
  );
};

export default Playcall;
