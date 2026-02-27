import { getTeamConfig } from "@/engine/interviewHiring/bankLoader";
import { XorShift32 } from "@/engine/interviewHiring/rng";
import type { TeamConfig } from "@/engine/interviewHiring/types";

export type InterviewQuestion = {
  question_id: string;
  asker: "OWNER" | "GM";
  prompt: string;
  options: Array<{ choice_id: string; text: string; tags?: string[]; delta?: Record<string, number>; riskFlag?: string }>;
  question_key?: string;
  sourceBucket?: "contextual" | "team_pool" | "fallback_pool";
};

export type SelectedInterview = {
  teamId: string;
  questions: InterviewQuestion[];
};

type SelectInterviewQuestionsParams = {
  leagueSeed: number;
  teamId: string;
  saveSlotId: number;
  weekIndex: number;
  interviewIndex: number;
};

type TeamPoolQuestion = InterviewQuestion & { asker: "OWNER" | "GM" };
const STORY_FALLBACK_TEAM_IDS = ["MILWAUKEE_NORTHSHORE", "BIRMINGHAM_VULCANS"] as const;

export function stableTeamHash(teamId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < teamId.length; i += 1) {
    hash ^= teamId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickOneWeightedIndex(weights: number[], rng: XorShift32): number {
  const total = weights.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) {
    return Math.floor(rng.nextFloat01() * weights.length);
  }

  const roll = rng.nextFloat01() * total;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i += 1) {
    cumulative += Math.max(0, weights[i]);
    if (roll <= cumulative) return i;
  }

  return Math.max(0, weights.length - 1);
}

function weightedNoReplacement<T>(items: T[], getWeight: (item: T) => number, count: number, rng: XorShift32): T[] {
  const pool = [...items];
  const selected: T[] = [];
  const target = Math.min(count, pool.length);

  while (selected.length < target && pool.length > 0) {
    const weights = pool.map((item) => Math.max(0, getWeight(item)));
    const index = pickOneWeightedIndex(weights, rng);
    const [picked] = pool.splice(index, 1);
    if (picked) {
      selected.push(picked);
    }
  }

  return selected;
}

function pickWithAskerConstraint(
  pool: TeamPoolQuestion[],
  asker: "OWNER" | "GM",
  rng: XorShift32,
  askerWeighting: Record<string, number>,
): TeamPoolQuestion | undefined {
  const bucket = pool.filter((question) => question.asker === asker);
  if (!bucket.length) return undefined;

  const selected = weightedNoReplacement(
    bucket,
    (question) => askerWeighting[question.asker] ?? 1,
    1,
    rng,
  )[0];

  return selected;
}

function dedupeByQuestionId<T extends { question_id: string }>(questions: T[]): T[] {
  const map = new Map<string, T>();
  for (const question of questions) {
    if (!map.has(question.question_id)) {
      map.set(question.question_id, question);
    }
  }
  return [...map.values()];
}

function asInterviewQuestion(question: TeamConfig["contextual_pool"]["questions"][number]): InterviewQuestion {
  return {
    question_id: question.question_id,
    asker: question.asker === "OWNER" ? "OWNER" : "GM",
    prompt: question.prompt,
    options: question.options.map((option) => ({
      choice_id: option.choice_id,
      text: option.text,
      tags: option.tags,
      delta: option.delta ?? (option as { deltas?: Record<string, number> }).deltas,
      riskFlag:
        typeof (option.delta as Record<string, unknown> | undefined)?.riskFlag === "string"
          ? String((option.delta as Record<string, unknown>).riskFlag)
          : undefined,
    })),
    question_key: question.question_key,
  };
}

function withSourceBucket(questions: InterviewQuestion[], sourceBucket: InterviewQuestion["sourceBucket"]): InterviewQuestion[] {
  return questions.map((question) => ({ ...question, sourceBucket }));
}

export function selectInterviewQuestions(params: SelectInterviewQuestionsParams): SelectedInterview {
  const { leagueSeed, teamId, saveSlotId, weekIndex, interviewIndex } = params;
  const teamConfig = getTeamConfig(teamId);

  const teamHash = stableTeamHash(teamId);
  const seed = (leagueSeed ^ teamHash ^ saveSlotId ^ (weekIndex << 8) ^ interviewIndex) >>> 0;
  const rng = new XorShift32(seed || 0x9e3779b9);

  const contextualRules = teamConfig.interview_flow.mix_rules.contextual_questions;
  const contextualPool = dedupeByQuestionId((teamConfig.contextual_pool.questions ?? []).map(asInterviewQuestion));
  const contextual = weightedNoReplacement(
    contextualPool,
    (question) => contextualRules.selection.weights_by_question_key?.[question.question_key ?? ""] ?? 1,
    3,
    rng,
  );

  const teamRules = teamConfig.interview_flow.mix_rules.team_pool_questions;
  const rawTeamPool = dedupeByQuestionId((teamConfig.team_pool.questions ?? []).map(asInterviewQuestion));
  const askerWeighting = {
    OWNER: teamRules.selection.asker_weighting?.OWNER ?? 1,
    GM: teamRules.selection.asker_weighting?.GM ?? 1,
  };

  const minOwner = teamRules.constraints?.min_owner_questions ?? 1;
  const minGm = teamRules.constraints?.min_gm_questions ?? 1;

  const selectedTeam: TeamPoolQuestion[] = [];
  let remainingPool = [...rawTeamPool] as TeamPoolQuestion[];

  if (minOwner > 0) {
    const ownerPick = pickWithAskerConstraint(remainingPool, "OWNER", rng, askerWeighting);
    if (ownerPick) {
      selectedTeam.push(ownerPick);
      remainingPool = remainingPool.filter((question) => question.question_id !== ownerPick.question_id);
    }
  }

  if (minGm > 0) {
    const gmPick = pickWithAskerConstraint(remainingPool, "GM", rng, askerWeighting);
    if (gmPick) {
      selectedTeam.push(gmPick);
      remainingPool = remainingPool.filter((question) => question.question_id !== gmPick.question_id);
    }
  }

  const needed = Math.max(0, 3 - selectedTeam.length);
  if (needed > 0) {
    const tail = weightedNoReplacement(
      remainingPool,
      (question) => askerWeighting[question.asker] ?? 1,
      needed,
      rng,
    );
    selectedTeam.push(...tail);
  }

  const contextualFallbackPool = contextualPool.filter(
    (question) => !contextual.some((picked) => picked.question_id === question.question_id),
  );
  const fallbackContextual = weightedNoReplacement(contextualFallbackPool, () => 1, Math.max(0, 3 - selectedTeam.length), rng);
  if (fallbackContextual.length) {
    selectedTeam.push(...(fallbackContextual as TeamPoolQuestion[]));
  }

  if (selectedTeam.length < 3) {
    for (const fallbackTeamId of STORY_FALLBACK_TEAM_IDS) {
      if (fallbackTeamId === teamId) continue;
      const fallbackConfig = getTeamConfig(fallbackTeamId);
      const fallbackPool = dedupeByQuestionId((fallbackConfig.team_pool.questions ?? []).map(asInterviewQuestion)).filter(
        (question) => !selectedTeam.some((picked) => picked.question_id === question.question_id),
      );
      if (!fallbackPool.length) continue;
      const fallbackPicks = weightedNoReplacement(fallbackPool, () => 1, 3 - selectedTeam.length, rng);
      selectedTeam.push(...(fallbackPicks as TeamPoolQuestion[]));
      if (selectedTeam.length >= 3) break;
    }
  }

  const teamPoolIds = new Set(rawTeamPool.map((question) => question.question_id));
  const normalizedTeam = selectedTeam.slice(0, 3).map((question) => ({
    ...question,
    sourceBucket: teamPoolIds.has(question.question_id) ? "team_pool" : "fallback_pool",
  }));

  return {
    teamId,
    questions: [...withSourceBucket(contextual, "contextual"), ...normalizedTeam].slice(0, 6),
  };
}
