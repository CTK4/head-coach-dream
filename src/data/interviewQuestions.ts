import questionsJson from "@/data/hc_interview_press_banks.json";
import { interviewProfiles, type TeamInterviewProfile } from "@/data/interviewProfiles";
import { createPhaseSeed, mulberry32, shuffleDeterministic } from "@/engine/rng";
import type { InterviewResult } from "@/context/GameContext";

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

function resolveProfile(teamId: string): TeamInterviewProfile {
  return interviewProfiles[teamId] ?? interviewProfiles.MILWAUKEE_NORTHSHORE;
}

export function selectInterviewQuestions(teamId: string, count = 4, saveSeed: number): InterviewQuestion[] {
  const profile = resolveProfile(teamId);
  const preferredClusters = new Set(profile.questionClusters.map((cluster) => cluster.toUpperCase()));
  const hcQuestions = allItems.filter((q) => q.type === "HC_INTERVIEW");
  const preferred = hcQuestions.filter((q) => preferredClusters.has(q.cluster.toUpperCase()));
  const secondary = hcQuestions.filter((q) => !preferredClusters.has(q.cluster.toUpperCase()));

  const rng = mulberry32(createPhaseSeed(saveSeed, teamId, "INTERVIEW"));
  const ranked = [...shuffleDeterministic(preferred, rng), ...shuffleDeterministic(secondary, rng)];

  return ranked.slice(0, count);
}

function weightedScore(axisTotals: AxisTotals, weights: Record<string, number> = {}): number {
  return Object.entries(weights).reduce((total, [axis, weight]) => total + (axisTotals[axis] ?? 0) * weight, 0);
}

export function computeInterviewResults(axisTotals: AxisTotals, profile: TeamInterviewProfile): InterviewResult {
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

export const AXES = (questionsJson as any).axes as string[];

export function getInterviewProfile(teamId: string): TeamInterviewProfile {
  return resolveProfile(teamId);
}
