import type { GameState } from "@/context/GameContext";
import { getPlayersByTeam } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";

export type TeamGameRatings = {
  /** Quarterback processing / decision-making (55–85) */
  qbProcessing: number;
  /** Offensive line pass protection (55–85) */
  olPassBlock: number;
  /** Wide receivers + TEs route running / separation (55–85) */
  wrSeparation: number;
  /** Running back burst / yards after contact (55–85) */
  rbBurst: number;
  /** Defensive line + edge pass rush (55–85) */
  dlPassRush: number;
  /** Defensive line + linebackers run stop (55–85) */
  runStop: number;
  /** Cornerbacks + safeties coverage (55–85) */
  dbCoverage: number;
  /** Linebackers + safeties blitz impact (55–85) */
  blitzImpact: number;
};

const DEFAULT_OVR = 68;

function avg(nums: number[]): number {
  if (!nums.length) return DEFAULT_OVR;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Scale a raw overall average (typically 50–90) to the 55–85 band used by PAS. */
function scale(raw: number): number {
  return clamp(raw, 55, 85);
}

/** Compute position-group ratings for a team from their roster. */
export function computeTeamGameRatings(teamId: string): TeamGameRatings;
export function computeTeamGameRatings(state: GameState, teamId: string): TeamGameRatings;
export function computeTeamGameRatings(stateOrTeamId: GameState | string, maybeTeamId?: string): TeamGameRatings {
  const teamId = typeof stateOrTeamId === "string" ? stateOrTeamId : String(maybeTeamId ?? "");
  const players = typeof stateOrTeamId === "string"
    ? getPlayersByTeam(teamId)
    : getEffectivePlayersByTeam(stateOrTeamId, teamId);

  // Build per-group overalls in a single pass over the roster.
  const groups = {
    qb: [] as number[],
    ol: [] as number[],
    wr: [] as number[],
    rb: [] as number[],
    dl: [] as number[],
    lb: [] as number[],
    db: [] as number[],
  };

  for (const p of players) {
    const pos = (p.pos ?? "").toUpperCase();
    const ovr = Number(p.overall ?? DEFAULT_OVR);
    if (!Number.isFinite(ovr)) continue;
    if (pos.startsWith("QB")) groups.qb.push(ovr);
    else if (pos.startsWith("OLB")) groups.lb.push(ovr);  // before "OL"
    else if (pos.startsWith("OT") || pos.startsWith("OG") || pos === "OL" || pos === "C") groups.ol.push(ovr);
    else if (pos.startsWith("WR") || pos.startsWith("TE")) groups.wr.push(ovr);
    else if (pos.startsWith("RB") || pos.startsWith("FB")) groups.rb.push(ovr);
    else if (pos.startsWith("EDGE") || pos.startsWith("DL") || pos.startsWith("DT") || pos.startsWith("DE") || pos.startsWith("NT")) groups.dl.push(ovr);
    else if (pos.startsWith("ILB") || pos.startsWith("MLB") || pos.startsWith("LB")) groups.lb.push(ovr);
    else if (pos.startsWith("CB") || pos.startsWith("SS") || pos.startsWith("FS") || pos.startsWith("DB") || pos === "S") groups.db.push(ovr);
  }

  const qbOvr = scale(avg(groups.qb));
  const olOvr = scale(avg(groups.ol));
  const wrOvr = scale(avg(groups.wr));
  const rbOvr = scale(avg(groups.rb));
  const dlOvr = scale(avg(groups.dl));
  const lbOvr = scale(avg(groups.lb));
  const dbOvr = scale(avg(groups.db));

  return {
    qbProcessing: qbOvr,
    olPassBlock: olOvr,
    wrSeparation: wrOvr,
    rbBurst: rbOvr,
    dlPassRush: dlOvr,
    runStop: Math.round((dlOvr * 0.6 + lbOvr * 0.4)),
    dbCoverage: dbOvr,
    blitzImpact: Math.round((lbOvr * 0.6 + dbOvr * 0.4)),
  };
}
