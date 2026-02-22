import { getPlayersByTeam } from "@/data/leagueDb";

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
export function computeTeamGameRatings(teamId: string): TeamGameRatings {
  const players = getPlayersByTeam(teamId);

  const byPos = (groups: string[]): number[] =>
    players
      .filter((p) => groups.some((g) => (p.pos ?? "").toUpperCase().startsWith(g)))
      .map((p) => Number(p.overall ?? DEFAULT_OVR))
      .filter(Number.isFinite);

  const qbOvr = scale(avg(byPos(["QB"])));
  const olOvr = scale(avg(byPos(["OL", "OT", "OG", "C"])));
  const wrOvr = scale(avg(byPos(["WR", "TE"])));
  const rbOvr = scale(avg(byPos(["RB", "FB"])));
  const dlOvr = scale(avg(byPos(["DL", "DT", "DE", "EDGE", "NT"])));
  const lbOvr = scale(avg(byPos(["LB", "ILB", "OLB", "MLB"])));
  const dbOvr = scale(avg(byPos(["CB", "S", "SS", "FS", "DB"])));

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
