import type { GameState } from "@/context/GameContext";
import type { Prospect } from "@/engine/offseasonData";
import { getDrillCompositeScore } from "@/engine/scouting/drillComposite";
import { getLegacyProspectById } from "@/engine/scouting/legacyBridge";
import { type CanonicalCombineResult, getCanonicalCombineResult, getCanonicalInterviewResult } from "@/engine/scouting/selectors";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function toFinite(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function athleticProxyFromCombine(combine: CanonicalCombineResult): number | null {
  const forty = toFinite(combine.forty);
  const vert = toFinite(combine.vert);
  const shuttle = toFinite(combine.shuttle);
  const bench = toFinite(combine.bench);
  if (forty == null && vert == null && shuttle == null && bench == null) return null;

  // Transitional compatibility: legacy GM eval expects a 0-100 athletic scalar.
  // We derive this from public drill data (not hidden truth / legacy RAS).
  const composite = getDrillCompositeScore({ forty, vert, shuttle, bench });
  return Math.round(clamp((composite - 28) * 1.6, 0, 100));
}

function interviewProxyFromCanonical(state: GameState, prospectId: string): number | null {
  const interviewResults = getCanonicalInterviewResult(state, prospectId) as Array<{ score?: number }> | null;
  const latestInterviewScore = interviewResults?.slice(-1)?.[0]?.score;
  if (typeof latestInterviewScore === "number" && Number.isFinite(latestInterviewScore)) return latestInterviewScore;

  const prospect = getLegacyProspectById(state, prospectId);
  const fallback = toFinite(prospect?.interview);
  return fallback;
}

export function buildProspectForGmEval(state: GameState, prospectId: string): Prospect | null {
  const prospect = getLegacyProspectById(state, prospectId);
  if (!prospect) return null;

  const grade = toFinite(prospect.grade);
  if (grade == null) return null;

  const combine = getCanonicalCombineResult(state, prospectId);
  // Transitional compatibility: evaluator still expects numeric ras/interview fields.
  // Prefer public drill-derived athletic proxy, then explicit public ras, then grade as a last
  // compatibility fallback (deliberate, temporary distortion until evaluator is decoupled).
  const athleticProxy = athleticProxyFromCombine(combine) ?? toFinite(prospect.ras) ?? grade;

  // Prefer canonical interview score, then explicit public interview, then grade as a final
  // compatibility fallback so GM eval does not disappear on sparse legacy rows.
  const interviewProxy = interviewProxyFromCanonical(state, prospectId) ?? grade;

  return {
    id: prospect.id,
    name: prospect.name,
    pos: prospect.pos,
    archetype: prospect.archetype ?? "Prospect",
    grade,
    ras: Math.round(clamp(athleticProxy, 0, 100)),
    interview: Math.round(clamp(interviewProxy, 0, 100)),
  };
}
