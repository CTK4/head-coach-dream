import type { GameState } from "@/context/GameContext";
import { getPlayersByTeam } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { applyStaffModifiers, coachesForPosition } from "@/engine/coachImpact";
import type { CoachProfile } from "@/data/coachTraits";

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

/**
 * P2 FIX: Apply staff coaching bonuses to a position group's rating.
 *
 * coachImpact.ts has a full trait/affinity model but was never called during
 * game simulation. The rating pipeline goes:
 *
 *   player OVRs → group average → scale to 55–85 → TeamGameRatings → PAS
 *
 * We apply staff modifiers at the last step before scale() so the bonus is
 * additive to the raw average before clamping.
 *
 * The mapping from TeamGameRatings key → position group is:
 *   qbProcessing  ← QB coaches + OC  → "processing" affinity
 *   olPassBlock   ← OL coaches + OC  → "pass_blocking" affinity
 *   wrSeparation  ← WR/TE coaches    → "route_running" affinity
 *   rbBurst       ← RB coaches       → "burst" affinity
 *   dlPassRush    ← DL coaches + DC  → "pass_rush" affinity
 *   dbCoverage    ← DB coaches + DC  → "coverage" affinity
 *
 * The impact is intentionally subtle: a position coach at "Advanced" tier adds
 * ~BASE_BOOST(0.10) × TRAIT_STRENGTH("Advanced"=1.5) × tenureMultiplier
 * ≈ 0.15 modifier × position group average ≈ 1–2 OVR points at most.
 * This is appropriate — coaching should tip close matchups, not override talent.
 */
function applyPositionGroupCoachBonus(
  rawAvg: number,
  pos: string, // representative position for coachesForPosition() lookup
  attrId: string, // the affinity attribute to evaluate (e.g. "processing")
  staff: CoachProfile[],
): number {
  if (!staff.length) return rawAvg;
  const relevantCoaches = coachesForPosition(staff, pos);
  if (!relevantCoaches.length) return rawAvg;
  // applyStaffModifiers returns baseAttr * product(1 + modifier_per_coach)
  return applyStaffModifiers(rawAvg, attrId, relevantCoaches);
}

/** Compute position-group ratings for a team from their roster, optionally boosted by staff. */
export function computeTeamGameRatings(teamId: string): TeamGameRatings;
export function computeTeamGameRatings(state: GameState, teamId: string): TeamGameRatings;
export function computeTeamGameRatings(stateOrTeamId: GameState | string, maybeTeamId?: string): TeamGameRatings {
  const teamId = typeof stateOrTeamId === "string" ? stateOrTeamId : String(maybeTeamId ?? "");
  const players = typeof stateOrTeamId === "string"
    ? getPlayersByTeam(teamId)
    : getEffectivePlayersByTeam(stateOrTeamId, teamId);

  // P2 FIX: pull staff roster from state when available
  const staff: CoachProfile[] = typeof stateOrTeamId !== "string"
    ? (stateOrTeamId.staffRoster?.coaches ?? [])
    : [];

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

  // P2 FIX: apply staff coaching bonus per position group before scaling.
  // Using the most representative attribute per group for the affinity lookup.
  const qbRaw = applyPositionGroupCoachBonus(avg(groups.qb), "QB", "processing", staff);
  const olRaw = applyPositionGroupCoachBonus(avg(groups.ol), "OL", "pass_blocking", staff);
  const wrRaw = applyPositionGroupCoachBonus(avg(groups.wr), "WR", "route_running", staff);
  const rbRaw = applyPositionGroupCoachBonus(avg(groups.rb), "RB", "burst", staff);
  const dlRaw = applyPositionGroupCoachBonus(avg(groups.dl), "DL", "pass_rush", staff);
  const lbRaw = applyPositionGroupCoachBonus(avg(groups.lb), "LB", "tackle", staff);
  const dbRaw = applyPositionGroupCoachBonus(avg(groups.db), "CB", "coverage", staff);

  const qbOvr = scale(qbRaw);
  const olOvr = scale(olRaw);
  const wrOvr = scale(wrRaw);
  const rbOvr = scale(rbRaw);
  const dlOvr = scale(dlRaw);
  const lbOvr = scale(lbRaw);
  const dbOvr = scale(dbRaw);

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
