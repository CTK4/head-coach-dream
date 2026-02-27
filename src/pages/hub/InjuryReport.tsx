import React, { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { mulberry32, hashSeed } from "@/engine/rng";
import type { Injury, InjuryStatus, InjuryBodyArea, InjurySeverity } from "@/engine/injuryTypes";
import { getRecurrenceRiskLevel } from "@/engine/injuryTypes";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HUB_BG, HUB_TEXTURE, HUB_VIGNETTE, HUB_FRAME } from "@/components/franchise-hub/theme";
import { Activity, AlertTriangle, ChevronRight, Shield, Users } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: InjuryStatus[] = ["OUT", "DOUBTFUL", "QUESTIONABLE", "IR", "PUP", "DAY_TO_DAY"];
const BODY_AREAS: InjuryBodyArea[] = [
  "HEAD", "NECK", "SHOULDER", "ARM", "HAND", "CHEST", "BACK",
  "HIP", "KNEE", "ANKLE", "FOOT", "LOWER_LEG", "UPPER_LEG", "RIBS", "OTHER",
];

const STATUS_COLOR: Record<InjuryStatus, string> = {
  OUT: "bg-red-500/20 border-red-400/40 text-red-200",
  DOUBTFUL: "bg-orange-500/20 border-orange-400/40 text-orange-200",
  QUESTIONABLE: "bg-yellow-500/20 border-yellow-400/40 text-yellow-200",
  IR: "bg-purple-500/20 border-purple-400/40 text-purple-200",
  PUP: "bg-blue-500/20 border-blue-400/40 text-white",
  DAY_TO_DAY: "bg-slate-500/20 border-slate-400/40 text-slate-200",
};

const SEVERITY_COLOR: Record<InjurySeverity, string> = {
  MINOR: "text-slate-400",
  MODERATE: "text-yellow-400",
  SEVERE: "text-orange-400",
  SEASON_ENDING: "text-red-400",
};

const BADGE_COLORS: Record<string, string> = {
  NEW: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
  WORSENED: "bg-red-500/20 border-red-400/40 text-red-200",
  RETURNING: "bg-blue-500/20 border-blue-400/40 text-white",
};

// ─── Dev mock data ─────────────────────────────────────────────────────────────

const INJURY_TYPES: string[] = [
  "Hamstring", "ACL", "MCL", "Concussion", "Ankle Sprain", "Shoulder Strain",
  "Knee Contusion", "Rib Fracture", "Thumb", "Back Strain", "Hip Flexor",
];
const BODY_AREA_MAP: Record<string, InjuryBodyArea> = {
  Hamstring: "UPPER_LEG", ACL: "KNEE", MCL: "KNEE", Concussion: "HEAD",
  "Ankle Sprain": "ANKLE", "Shoulder Strain": "SHOULDER", "Knee Contusion": "KNEE",
  "Rib Fracture": "RIBS", Thumb: "HAND", "Back Strain": "BACK", "Hip Flexor": "HIP",
};

function generateMockInjuries(state: ReturnType<typeof useGame>["state"], teamId: string, saveSeed: number, week: number): Injury[] {
  const rng = mulberry32(hashSeed(saveSeed, teamId, "injuries", week));
  const players = getEffectivePlayersByTeam(state, teamId).slice(0, 22);
  const count = 3 + Math.floor(rng() * 4);
  const injuries: Injury[] = [];
  const statuses: InjuryStatus[] = ["OUT", "OUT", "DOUBTFUL", "QUESTIONABLE", "IR", "PUP", "DAY_TO_DAY"];
  const severities: InjurySeverity[] = ["MINOR", "MODERATE", "MODERATE", "SEVERE", "SEASON_ENDING"];
  const badges: Array<"NEW" | "WORSENED" | "RETURNING"> = ["NEW", "WORSENED", "RETURNING"];
  const practices: Array<"FULL" | "LIMITED" | "DNP"> = ["FULL", "LIMITED", "DNP"];
  const rehabs: Array<"INITIAL" | "REHAB" | "RECONDITIONING" | "RETURN_TO_PLAY"> = ["INITIAL", "REHAB", "RECONDITIONING", "RETURN_TO_PLAY"];

  for (let i = 0; i < Math.min(count, players.length); i++) {
    const p = players[Math.floor(rng() * players.length)];
    if (!p) continue;
    const injType = INJURY_TYPES[Math.floor(rng() * INJURY_TYPES.length)];
    const severity = severities[Math.floor(rng() * severities.length)];
    const startWeek = Math.max(1, week - Math.floor(rng() * 4));
    const returnOffset = severity === "SEASON_ENDING" ? 999 : Math.floor(rng() * 6) + 1;
    const recRisk = Math.round(rng() * 60 + 5);
    const badge = rng() < 0.4 ? badges[Math.floor(rng() * badges.length)] : undefined;

    injuries.push({
      id: `mock-${teamId}-${p.playerId}-${i}`,
      playerId: p.playerId,
      teamId,
      injuryType: injType,
      bodyArea: BODY_AREA_MAP[injType] ?? "OTHER",
      severity,
      status: statuses[Math.floor(rng() * statuses.length)],
      startWeek,
      expectedReturnWeek: severity === "SEASON_ENDING" ? undefined : week + returnOffset,
      practiceStatus: practices[Math.floor(rng() * practices.length)],
      recurrenceRisk: recRisk,
      isSeasonEnding: severity === "SEASON_ENDING",
      badges: badge ? [badge] : [],
      rehabStage: rehabs[Math.floor(rng() * rehabs.length)],
      gamesMissed: week - startWeek,
      baseRisk: Math.round(rng() * 40 + 10),
      riskMultipliers: [
        { label: "Age", value: Math.round(rng() * 20 - 5) },
        { label: "Prior Injury", value: Math.round(rng() * 15) },
      ],
    });
  }
  return injuries;
}

// ─── Helper display functions ──────────────────────────────────────────────────

function formatStatus(s: InjuryStatus): string {
  const map: Record<InjuryStatus, string> = {
    OUT: "OUT", DOUBTFUL: "DBTF", QUESTIONABLE: "QUES", IR: "IR", PUP: "PUP", DAY_TO_DAY: "D2D",
  };
  return map[s] ?? s;
}

function formatBodyArea(area: InjuryBodyArea): string {
  return area.replace(/_/g, " ");
}

function formatSeverity(s: InjurySeverity): string {
  const map: Record<InjurySeverity, string> = {
    MINOR: "Minor", MODERATE: "Moderate", SEVERE: "Severe", SEASON_ENDING: "Season-Ending",
  };
  return map[s] ?? s;
}

function formatPractice(p: string): string {
  const map: Record<string, string> = { FULL: "Full", LIMITED: "Ltd", DNP: "DNP" };
  return map[p] ?? p;
}

function formatRehabStage(r: string): string {
  const map: Record<string, string> = {
    INITIAL: "Initial Treatment", REHAB: "Rehabilitation",
    RECONDITIONING: "Reconditioning", RETURN_TO_PLAY: "Return to Play",
  };
  return map[r] ?? r;
}

// ─── InjuryRow component ───────────────────────────────────────────────────────

type PlayerInfo = { name: string; pos?: string; overall?: number };

export function getInjuryPlayersForTeam(state: ReturnType<typeof useGame>["state"], teamId: string): any[] {
  return getEffectivePlayersByTeam(state, teamId);
}

export function buildInjuryPlayerMap(state: ReturnType<typeof useGame>["state"]): Map<string, PlayerInfo> {
  const map = new Map<string, PlayerInfo>();
  const all = getTeams()
    .filter((t) => t.isActive !== false)
    .flatMap((t) => getEffectivePlayersByTeam(state, t.teamId));
  for (const p of all) {
    map.set(p.playerId, {
      name: p.fullName ?? "Unknown Player",
      pos: p.pos,
      overall: p.overall,
    });
  }
  return map;
}

function InjuryRow({
  injury,
  player,
  onTap,
}: {
  injury: Injury;
  player: PlayerInfo;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full text-left rounded-lg border border-slate-300/15 bg-slate-950/40 px-3 py-2.5 hover:border-slate-300/25 hover:bg-slate-900/50 active:scale-[0.99] transition"
      onClick={onTap}
      aria-label={`Open injury details for ${player.name}`}
    >
      <div className="flex items-start gap-2">
        {/* Left: player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-100 text-sm truncate">{player.name}</span>
            {player.pos ? <span className="text-[10px] text-slate-400 uppercase">{player.pos}</span> : null}
            {player.overall != null ? <span className="text-[10px] text-slate-400">OVR {player.overall}</span> : null}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-xs ${SEVERITY_COLOR[injury.severity]}`}>{injury.injuryType}</span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-[10px] text-slate-400">{formatBodyArea(injury.bodyArea)}</span>
            {injury.practiceStatus ? (
              <>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-[10px] text-slate-400">Practice: {formatPractice(injury.practiceStatus)}</span>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {injury.expectedReturnWeek ? (
              <span className="text-[10px] text-slate-400">Ret. Wk {injury.expectedReturnWeek}</span>
            ) : (
              <span className="text-[10px] text-red-400">Season Ending</span>
            )}
            {injury.recurrenceRisk != null ? (
              <span className={`text-[10px] ${injury.recurrenceRisk >= 50 ? "text-orange-400" : "text-slate-400"}`}>
                Re-inj: {injury.recurrenceRisk}%
                {injury.recurrenceRisk >= 50 ? " ⚠" : ""}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: badges + status */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-bold rounded border px-1.5 py-0.5 ${STATUS_COLOR[injury.status]}`}>
            {formatStatus(injury.status)}
          </span>
          {injury.badges?.length ? (
            <div className="flex gap-1 flex-wrap justify-end">
              {injury.badges.map((b) => (
                <span key={b} className={`text-[9px] font-bold rounded border px-1 py-0.5 ${BADGE_COLORS[b]}`}>
                  {b}
                </span>
              ))}
            </div>
          ) : null}
          <ChevronRight className="h-3 w-3 text-slate-500 mt-0.5" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

// ─── Summary counts bar ────────────────────────────────────────────────────────

function SummaryBar({ teamId, injuries }: { teamId: string; injuries: Injury[] }) {
  const counts = useMemo(() => {
    const base = { out: 0, doubtful: 0, questionable: 0, ir: 0, pup: 0 };
    for (const i of injuries) {
      if (i.teamId !== teamId) continue;
      if (i.status === "OUT") base.out++;
      else if (i.status === "DOUBTFUL") base.doubtful++;
      else if (i.status === "QUESTIONABLE") base.questionable++;
      else if (i.status === "IR") base.ir++;
      else if (i.status === "PUP") base.pup++;
    }
    return base;
  }, [injuries, teamId]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[
        { label: "OUT", val: counts.out, cls: "text-red-300" },
        { label: "DBTF", val: counts.doubtful, cls: "text-orange-300" },
        { label: "QUES", val: counts.questionable, cls: "text-yellow-300" },
        { label: "IR", val: counts.ir, cls: "text-purple-300" },
        { label: "PUP", val: counts.pup, cls: "text-blue-300" },
      ].map(({ label, val, cls }) => (
        <span key={label} className={`text-xs ${cls}`}>
          {label}: <span className="font-bold">{val}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Medical Staff Banner ──────────────────────────────────────────────────────

function MedicalStaffBanner({ rating }: { rating?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-300/20 bg-blue-950/30 px-3 py-2">
      <Shield className="h-4 w-4 text-blue-300 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-white">Medical Staff Influence</span>
        {rating != null ? (
          <span className="ml-2 text-xs text-slate-300">Rating: <span className="font-bold text-white">{rating}/100</span></span>
        ) : (
          <span className="ml-2 text-[10px] text-slate-400 italic">Rating data unavailable</span>
        )}
      </div>
    </div>
  );
}

// ─── Player Drawer ─────────────────────────────────────────────────────────────

function InjuryDrawer({
  injury,
  player,
  open,
  onClose,
  isMyTeam,
  dispatch,
}: {
  injury: Injury | null;
  player: PlayerInfo | null;
  open: boolean;
  onClose: () => void;
  isMyTeam: boolean;
  dispatch: (action: { type: string; payload?: unknown }) => void;
}) {
  if (!injury || !player) return null;

  const canMoveToIR = isMyTeam && injury.status !== "IR";
  const canActivateFromIR = isMyTeam && injury.status === "IR";
  const canStartPracticeWindow = isMyTeam && injury.status === "IR" && injury.rehabStage !== "RETURN_TO_PLAY";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="border-t border-slate-300/15 bg-slate-950 text-slate-100 max-h-[85vh] overflow-y-auto rounded-t-2xl"
        aria-label={`Injury details for ${player.name}`}
      >
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2 text-slate-100">
            <Activity className="h-4 w-4 text-red-400" aria-hidden="true" />
            {player.name}
            {player.pos ? <span className="text-slate-400 text-sm font-normal">· {player.pos}</span> : null}
            {player.overall != null ? <span className="text-slate-400 text-sm font-normal">· OVR {player.overall}</span> : null}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold rounded border px-2 py-0.5 ${STATUS_COLOR[injury.status]}`}>
              {injury.status}
            </span>
            <span className={`text-xs ${SEVERITY_COLOR[injury.severity]}`}>{formatSeverity(injury.severity)}</span>
            {injury.isSeasonEnding ? (
              <span className="text-xs rounded border border-red-400/40 bg-red-500/20 text-red-200 px-2 py-0.5">Season Ending</span>
            ) : null}
            {injury.badges?.map((b) => (
              <span key={b} className={`text-xs rounded border px-1.5 py-0.5 ${BADGE_COLORS[b]}`}>{b}</span>
            ))}
          </div>

          {/* Injury details */}
          <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Injury Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="text-slate-400">Type</div>
              <div className="text-slate-100">{injury.injuryType}</div>
              <div className="text-slate-400">Area</div>
              <div className="text-slate-100">{formatBodyArea(injury.bodyArea)}</div>
              <div className="text-slate-400">Practice</div>
              <div className="text-slate-100">{injury.practiceStatus ? formatPractice(injury.practiceStatus) : "—"}</div>
              {injury.expectedReturnWeek ? (
                <>
                  <div className="text-slate-400">Exp. Return</div>
                  <div className="text-slate-100">Week {injury.expectedReturnWeek}</div>
                </>
              ) : null}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Injury Timeline</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="text-slate-400">Onset Week</div>
              <div className="text-slate-100">Week {injury.startWeek}</div>
              <div className="text-slate-400">Games Missed</div>
              <div className="text-slate-100">{injury.gamesMissed ?? 0}</div>
              <div className="text-slate-400">Rehab Stage</div>
              <div className="text-slate-100">{injury.rehabStage ? formatRehabStage(injury.rehabStage) : "—"}</div>
            </div>
          </div>

          {/* Risk details */}
          {(injury.recurrenceRisk != null || injury.baseRisk != null) ? (
            <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1.5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Re-Injury Risk</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {injury.baseRisk != null ? (
                  <>
                    <div className="text-slate-400">Base Risk</div>
                    <div className="text-slate-100">{injury.baseRisk}%</div>
                  </>
                ) : null}
                {injury.riskMultipliers?.map((m) => (
                  <React.Fragment key={m.label}>
                    <div className="text-slate-400">{m.label}</div>
                    <div className={`font-mono ${m.value >= 0 ? "text-orange-300" : "text-emerald-300"}`}>
                      {m.value >= 0 ? "+" : ""}{m.value}%
                    </div>
                  </React.Fragment>
                ))}
                {injury.recurrenceRisk != null ? (
                  <>
                    <div className="text-slate-400 font-semibold">Total Recurrence</div>
                    <div className={`font-bold ${injury.recurrenceRisk >= 50 ? "text-red-300" : injury.recurrenceRisk >= 30 ? "text-orange-300" : "text-slate-100"}`}>
                      {injury.recurrenceRisk}%
                    </div>
                  </>
                ) : null}
                {injury.recurrenceMultiplier != null ? (
                  <>
                    <div className="text-slate-400">Recurrence Risk</div>
                    <div className={`font-semibold ${injury.recurrenceMultiplier >= 1.5 ? "text-red-300" : injury.recurrenceMultiplier >= 1.2 ? "text-orange-300" : "text-emerald-300"}`}>
                      {getRecurrenceRiskLevel(injury.recurrenceMultiplier)}
                      {injury.chronic ? " (Chronic)" : ""}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {injury.notes ? (
            <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Notes</div>
              <p className="text-xs text-slate-300">{injury.notes}</p>
            </div>
          ) : null}

          {/* Roster actions */}
          {isMyTeam ? (
            <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Roster Actions</div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canMoveToIR}
                  className="border-slate-300/20 text-slate-100 disabled:opacity-40"
                  onClick={() => {
                    dispatch({ type: "INJURY_MOVE_TO_IR", payload: { injuryId: injury.id } });
                    onClose();
                  }}
                >
                  Move to IR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canActivateFromIR}
                  className="border-slate-300/20 text-slate-100 disabled:opacity-40"
                  onClick={() => {
                    dispatch({ type: "INJURY_ACTIVATE_FROM_IR", payload: { injuryId: injury.id } });
                    onClose();
                  }}
                >
                  Activate from IR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canStartPracticeWindow}
                  className="border-slate-300/20 text-slate-100 disabled:opacity-40"
                  onClick={() => {
                    dispatch({ type: "INJURY_START_PRACTICE_WINDOW", payload: { injuryId: injury.id } });
                    onClose();
                  }}
                >
                  Start Practice Window
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="border-slate-300/20 text-slate-400 opacity-40 cursor-not-allowed"
                  title="Not yet implemented"
                >
                  Release / Injury Settlement
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

function isInjuryActiveInWeek(injury: Injury, week: number): boolean {
  return injury.startWeek <= week && (injury.expectedReturnWeek == null || injury.expectedReturnWeek >= week);
}

export default function InjuryReport() {
  const { state, dispatch } = useGame();

  const userTeamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";
  const currentWeek = (state.week ?? state.hub?.regularSeasonWeek ?? state.hub?.preseasonWeek ?? 1);

  // Filters
  const [filterTeam, setFilterTeam] = useState<"MY_TEAM" | "LEAGUE">("MY_TEAM");
  const [filterStatus, setFilterStatus] = useState<InjuryStatus | "ALL">("ALL");
  const [filterBodyArea, setFilterBodyArea] = useState<InjuryBodyArea | "ALL">("ALL");
  const [filterWeek, setFilterWeek] = useState<number | "ALL">("ALL");

  // Drawer state
  const [drawerInjuryId, setDrawerInjuryId] = useState<string | null>(null);

  // Build the injury list: prefer real data, fall back to mock data in dev mode
  const allInjuries = useMemo(() => {
    const real = state.injuries ?? [];
    if (real.length > 0) return real;

    // Dev-only mock data
    if (!import.meta.env.DEV) return real;

    const teams = getTeams().filter((t) => t.isActive !== false).slice(0, 8);
    const mocked: Injury[] = [];
    for (const team of teams) {
      mocked.push(...generateMockInjuries(state, team.teamId, state.saveSeed, currentWeek));
    }
    return mocked;
  }, [state.injuries, state.saveSeed, currentWeek]);

  // Build player lookup map (stable)
  const playerMap = useMemo(() => buildInjuryPlayerMap(state), [state]);

  // Filtered injuries
  const filteredInjuries = useMemo(() => {
    let list = filterTeam === "MY_TEAM" && userTeamId
      ? allInjuries.filter((i) => i.teamId === userTeamId)
      : allInjuries;

    if (filterStatus !== "ALL") list = list.filter((i) => i.status === filterStatus);
    if (filterBodyArea !== "ALL") list = list.filter((i) => i.bodyArea === filterBodyArea);
    if (filterWeek !== "ALL") list = list.filter((i) => isInjuryActiveInWeek(i, filterWeek));

    return list;
  }, [allInjuries, filterTeam, filterStatus, filterBodyArea, filterWeek, userTeamId]);

  const drawerInjury = drawerInjuryId ? (allInjuries.find((i) => i.id === drawerInjuryId) ?? null) : null;
  const drawerPlayer = drawerInjury ? (playerMap.get(drawerInjury.playerId) ?? { name: "Unknown Player" }) : null;
  const isDrawerMyTeam = drawerInjury ? drawerInjury.teamId === userTeamId : false;

  // Medical staff rating (placeholder — no staff rating in current model)
  const medicalRating: number | undefined = undefined;

  const hasInjuries = filteredInjuries.length > 0;

  return (
    <section className={`relative min-h-full overflow-x-hidden ${HUB_BG}`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

      <div className={`relative z-10 mx-auto max-w-2xl p-3 md:p-5 space-y-3`}>

        {/* Header */}
        <div className="flex items-center gap-2 pt-2">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" aria-hidden="true" />
          <h1 className="text-base font-black tracking-wide uppercase text-slate-100">Injury Report</h1>
          {hasInjuries ? (
            <Badge variant="outline" className="ml-auto border-red-400/40 text-red-300 text-[10px]">
              {filteredInjuries.length} injuries
            </Badge>
          ) : null}
        </div>

        {/* Medical Staff Banner */}
        <MedicalStaffBanner rating={medicalRating} />

        {/* Filters */}
        <div className={`rounded-xl border border-slate-300/15 bg-slate-950/60 p-3 space-y-2 ${HUB_FRAME}`}>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Filters</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Team filter */}
            <Select value={filterTeam} onValueChange={(v) => setFilterTeam(v as "MY_TEAM" | "LEAGUE")}>
              <SelectTrigger className="h-8 text-xs border-slate-300/20 bg-slate-900/50 text-slate-100" aria-label="Filter by team">
                <Users className="h-3 w-3 mr-1 text-slate-400" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                <SelectItem value="MY_TEAM">My Team</SelectItem>
                <SelectItem value="LEAGUE">League</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as InjuryStatus | "ALL")}>
              <SelectTrigger className="h-8 text-xs border-slate-300/20 bg-slate-900/50 text-slate-100" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Body area filter */}
            <Select value={filterBodyArea} onValueChange={(v) => setFilterBodyArea(v as InjuryBodyArea | "ALL")}>
              <SelectTrigger className="h-8 text-xs border-slate-300/20 bg-slate-900/50 text-slate-100" aria-label="Filter by body area">
                <SelectValue placeholder="Body Part" />
              </SelectTrigger>
              <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                <SelectItem value="ALL">All Body Parts</SelectItem>
                {BODY_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>{formatBodyArea(a)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Week filter */}
            <Select
              value={String(filterWeek)}
              onValueChange={(v) => setFilterWeek(v === "ALL" ? "ALL" : Number(v))}
            >
              <SelectTrigger className="h-8 text-xs border-slate-300/20 bg-slate-900/50 text-slate-100" aria-label="Filter by week">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                <SelectItem value="ALL">All Weeks</SelectItem>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                  <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary counts */}
          {userTeamId && filterTeam === "MY_TEAM" ? (
            <SummaryBar teamId={userTeamId} injuries={allInjuries} />
          ) : null}
        </div>

        {/* Injury list */}
        <HubPanel>
          {!hasInjuries ? (
            <HubEmptyState
              title="No injuries"
              description={filterTeam === "MY_TEAM" ? "Your team is healthy." : "No league injuries found."}
              action={{ label: "Back to Hub", to: "/hub" }}
            />
          ) : (
            <ScrollArea className="max-h-[60vh] pr-1" aria-label="Injury list">
              <ul className="space-y-1.5">
                {filteredInjuries.map((injury) => {
                  const player = playerMap.get(injury.playerId) ?? { name: "Unknown Player" };
                  return (
                    <li key={injury.id}>
                      <InjuryRow
                        injury={injury}
                        player={player}
                        onTap={() => setDrawerInjuryId(injury.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </HubPanel>
      </div>

      {/* Player detail drawer */}
      <InjuryDrawer
        injury={drawerInjury}
        player={drawerPlayer}
        open={drawerInjuryId !== null}
        onClose={() => setDrawerInjuryId(null)}
        isMyTeam={isDrawerMyTeam}
        dispatch={dispatch}
      />
    </section>
  );
}
