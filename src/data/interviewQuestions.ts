import questionsJson from "@/data/hc_interview_press_banks.json";
import { interviewProfiles, type TeamInterviewProfile } from "@/data/interviewProfiles";
import { createPhaseSeed, mulberry32, shuffleDeterministic } from "@/engine/rng";
import type { InterviewResult, OfferTier } from "@/context/GameContext";
import { ownerProfilesByTeam } from "@/data/owners";

export type InterviewAnswer = {
  key: string;
  text: string;
  delta: Record<string, number>;
};

export type InterviewQuestion = {
  id: string;
  type: string;
  cluster: string;
  prompt: string;
  answers: InterviewAnswer[];
};

const allItems = (questionsJson as any).items as InterviewQuestion[];

export type AxisTotals = Record<string, number>;

const LEGACY_AXIS_TO_CANONICAL: Record<string, string> = {
  ALIGN: "ego_compatibility",
  AUTO: "autonomy_desire",
  ADAPT: "stability",
  ANLT: "risk_appetite",
  AGGR: "aggression",
  DISC: "accountability",
  DEV: "loyalty_continuity",
  MEDIA: "media_sensitivity",
  PROC: "timeline_urgency",
  PEOP: "player_empowerment",
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function resolveProfile(teamId: string): TeamInterviewProfile {
  return interviewProfiles[teamId] ?? interviewProfiles.MILWAUKEE_NORTHSHORE;
}

function resolveQuestionCount(teamId: string, saveSeed: number): number {
  const rng = mulberry32(createPhaseSeed(saveSeed, teamId, "INTERVIEW_COUNT"));
  return 5 + Math.floor(rng() * 6);
}

export function selectInterviewQuestions(teamId: string, saveSeed: number, count?: number): InterviewQuestion[] {
  const profile = resolveProfile(teamId);
  const preferredClusters = new Set(profile.questionClusters.map((cluster) => cluster.toUpperCase()));
  const hcQuestions = allItems.filter((q) => q.type === "HC_INTERVIEW");
  const preferred = hcQuestions.filter((q) => preferredClusters.has(q.cluster.toUpperCase()));
  const secondary = hcQuestions.filter((q) => !preferredClusters.has(q.cluster.toUpperCase()));

  const rng = mulberry32(createPhaseSeed(saveSeed, teamId, "INTERVIEW"));
  const ranked = [...shuffleDeterministic(preferred, rng), ...shuffleDeterministic(secondary, rng)];
  return ranked.slice(0, count ?? resolveQuestionCount(teamId, saveSeed));
}

function weightedScore(axisTotals: AxisTotals, weights: Record<string, number> = {}): number {
  return Object.entries(weights).reduce((total, [axis, weight]) => total + (axisTotals[axis] ?? 0) * weight, 0);
}

function toCanonicalAxisTotals(axisTotals: AxisTotals): Record<string, number> {
  const canonical: Record<string, number> = {};
  for (const [key, value] of Object.entries(axisTotals)) {
    const mapped = LEGACY_AXIS_TO_CANONICAL[key] ?? key;
    canonical[mapped] = (canonical[mapped] ?? 0) + value;
  }
  return canonical;
}

function tierFromInterviewScore(score: number): OfferTier {
  if (score >= 0.8) return "PREMIUM";
  if (score >= 0.6) return "STANDARD";
  if (score >= 0.45) return "CONDITIONAL";
  return "REJECT";
}

export function computeOwnerInterviewScore(params: {
  ownerAxisWeights: Record<string, number>;
  questions: InterviewQuestion[];
  answersByQuestionId: Record<string, number>;
}): number {
  const { ownerAxisWeights, questions, answersByQuestionId } = params;

  const absWeightSum = Object.values(ownerAxisWeights).reduce((t, w) => t + Math.abs(w), 0);
  const rawMax = absWeightSum * 2;
  if (rawMax <= 0) return 0.5;
  const rawMin = -rawMax;

  let weightedSum = 0;
  let qualitySum = 0;

  for (const q of questions) {
    const idx = answersByQuestionId[q.id];
    const answer = q.answers[idx];
    if (!answer) continue;

    const canonicalDeltas = toCanonicalAxisTotals(answer.delta);
    let alignmentRaw = 0;
    for (const [axis, w] of Object.entries(ownerAxisWeights)) alignmentRaw += w * (canonicalDeltas[axis] ?? 0);

    const alignment = clamp01((alignmentRaw - rawMin) / (rawMax - rawMin));
    const qQuality = 0.8 + 0.2 * (Math.abs(alignmentRaw) / rawMax);

    weightedSum += alignment * qQuality;
    qualitySum += qQuality;
  }

  return qualitySum > 0 ? weightedSum / qualitySum : 0.5;
}

export function premiumGatesPassed(teamId: string, canonicalAxisTotals: Record<string, number>): boolean {
  const ego = canonicalAxisTotals.ego_compatibility ?? 0;
  if (ego < -2) return false;

  const ownerId = ownerProfilesByTeam[teamId]?.ownerId;
  if (ownerId === "CON_OWN_0027") return (canonicalAxisTotals.accountability ?? 0) >= 10;
  if (ownerId === "CON_OWN_0019") return (canonicalAxisTotals.media_sensitivity ?? 0) >= 6;
  return true;
}

export function computeInterviewResults(
  axisTotals: AxisTotals,
  profile: TeamInterviewProfile
): Omit<InterviewResult, "interviewScore" | "offerTier" | "premiumGatesPassed" | "canonicalAxisTotals"> {
  return {
    ownerAlignScore: weightedScore(axisTotals, profile.axisWeights.ownerAlignScore),
    gmTrustScore: weightedScore(axisTotals, profile.axisWeights.gmTrustScore),
    schemeFitScore: weightedScore(axisTotals, profile.axisWeights.schemeFitScore),
    mediaScore: weightedScore(axisTotals, profile.axisWeights.mediaScore),
    autonomyDelta: weightedScore(axisTotals, profile.axisWeights.autonomyDelta),
    leashDelta: weightedScore(axisTotals, profile.axisWeights.leashDelta),
    axisTotals,
  };
}

export function evaluateInterviewSession(params: {
  teamId: string;
  questions: InterviewQuestion[];
  answersByQuestionId: Record<string, number>;
  axisTotals: AxisTotals;
}): InterviewResult {
  const { teamId, questions, answersByQuestionId, axisTotals } = params;

  const profile = resolveProfile(teamId);
  const base = computeInterviewResults(axisTotals, profile);

  const owner = ownerProfilesByTeam[teamId];
  const interviewScore = computeOwnerInterviewScore({
    ownerAxisWeights: owner?.axisWeights ?? {},
    questions,
    answersByQuestionId,
  });

  const canonicalAxisTotals = toCanonicalAxisTotals(axisTotals);
  const gatesOk = premiumGatesPassed(teamId, canonicalAxisTotals);
  let offerTier = tierFromInterviewScore(interviewScore);
  if (offerTier === "PREMIUM" && !gatesOk) offerTier = "STANDARD";

  return { ...base, canonicalAxisTotals, interviewScore, offerTier, premiumGatesPassed: gatesOk };
}

export const AXES = (questionsJson as any).axes as string[];

export function getInterviewProfile(teamId: string): TeamInterviewProfile {
  return resolveProfile(teamId);
}
