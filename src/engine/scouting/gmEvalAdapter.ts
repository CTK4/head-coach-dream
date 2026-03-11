import type { GameState } from "@/context/GameContext";
import type { Prospect } from "@/engine/offseasonData";
import { getDrillCompositeScore, getPartialDrillCompositeSignal } from "@/engine/scouting/drillComposite";
import { type CanonicalCombineResult, getCanonicalCombineResult, getCanonicalInterviewResult, getCanonicalProspectById, parseCanonicalMetric } from "@/engine/scouting/selectors";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function toFinite(value: unknown): number | null {
  return parseCanonicalMetric(value);
}

function athleticProxyFromCombine(combine: CanonicalCombineResult): { value: number; coverage: number } | null {
  const forty = toFinite(combine.forty);
  const vert = toFinite(combine.vert);
  const shuttle = toFinite(combine.shuttle);
  const bench = toFinite(combine.bench);
  if (forty == null && vert == null && shuttle == null && bench == null) return null;

  const fullComposite = getDrillCompositeScore({ forty, vert, shuttle, bench });
  if (fullComposite != null) return { value: Math.round(clamp((fullComposite - 28) * 1.6, 0, 100)), coverage: 1 };

  const partial = getPartialDrillCompositeSignal({ forty, vert, shuttle, bench });
  if (!partial) return null;
  return { value: Math.round(clamp((partial.score - 28) * 1.6, 0, 100)), coverage: partial.coverage };
}

function interviewProxyFromCanonical(state: GameState, prospectId: string): number | null {
  const interviewResults = getCanonicalInterviewResult(state, prospectId);
  const latestInterviewScore = interviewResults?.slice(-1)?.[0]?.score;
  if (typeof latestInterviewScore === "number" && Number.isFinite(latestInterviewScore)) return latestInterviewScore;
  return null;
}

export type GmEvalInput = {
  prospect: Prospect;
  completeness: "FULL" | "PARTIAL";
  missingSignals: Array<"COMBINE" | "INTERVIEW">;
  confidencePenalty: number;
  bandPenalty: 0 | 1 | 2;
};

export function buildProspectForGmEval(state: GameState, prospectId: string): GmEvalInput | null {
  const prospect = getCanonicalProspectById(state, prospectId);
  if (!prospect) return null;

  const grade = toFinite(prospect.grade);
  if (grade == null) return null;

  const combine = getCanonicalCombineResult(state, prospectId);
  const athleticProxy = athleticProxyFromCombine(combine);
  const interviewProxy = interviewProxyFromCanonical(state, prospectId);
  if (athleticProxy == null && interviewProxy == null) return null;

  const missingSignals: Array<"COMBINE" | "INTERVIEW"> = [];
  if (athleticProxy == null) missingSignals.push("COMBINE");
  if (interviewProxy == null) missingSignals.push("INTERVIEW");

  const fallbackProxy = 50;
  const ras = Math.round(clamp(athleticProxy?.value ?? fallbackProxy, 0, 100));
  const interview = Math.round(clamp(interviewProxy ?? fallbackProxy, 0, 100));
  const completeness = missingSignals.length === 0 ? "FULL" : "PARTIAL";
  const combineCoveragePenalty = athleticProxy ? (1 - athleticProxy.coverage) * 0.4 : 0.4;
  const interviewPenalty = interviewProxy == null ? 0.35 : 0;
  const confidencePenalty = Number((combineCoveragePenalty + interviewPenalty).toFixed(2));
  const bandPenalty = missingSignals.length === 0 ? 0 : (athleticProxy?.coverage ?? 0) >= 0.75 ? 1 : 2;

  return {
    prospect: {
      id: prospect.id,
      name: prospect.name,
      pos: prospect.pos,
      archetype: prospect.archetype ?? "Prospect",
      grade,
      ras,
      interview,
    },
    completeness,
    missingSignals,
    confidencePenalty,
    bandPenalty,
  };
}
