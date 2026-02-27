import { evaluateFormula } from "./formula";
import { XorShift32 } from "./rng";
import type { InterviewQuestion, InterviewScoreResult, InterviewSession, QuestionOption, SelectedQuestion, TeamConfig } from "./types";
import { weightedNoReplacement } from "./weightedSampler";

const DELTA_TO_METRIC_CANDIDATES: Record<string, string[]> = {
  owner: ["owner_approval"],
  gm: ["gm_approval"],
  media: ["media_score"],
  stability: ["stability_score"],
  aggression: ["aggression_score"],
  speedBias: ["speed_bias_score"],
  windowBias: ["window_bias_score"],
  integrity: ["integrity_score"],
  accountability: ["accountability_score"],
  toughness: ["toughness_score"],
  durability: ["durability_score"],
  qbPlan: ["qb_plan_clarity"],
  assetDiscipline: ["asset_discipline_score"],
  authority: ["authority_score"],
  rebuildClarity: ["rebuild_clarity"],
  continuity: ["continuity_score"],
  continuity_score: ["continuity_score", "continuity"],
  discipline: ["discipline_score"],
  discipline_score: ["discipline_score", "discipline"],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toUint32(n: number): number {
  return n >>> 0;
}

function resolveMetricKey(metric: string, config: TeamConfig): string | undefined {
  const candidates = DELTA_TO_METRIC_CANDIDATES[metric] ?? [`${metric}_score`, metric];
  return candidates.find((candidate) => candidate in config.scoring.init);
}

function getTeamPoolQuestions(teamConfig: TeamConfig): InterviewQuestion[] {
  if (!teamConfig.team_pool.questions?.length) {
    throw new Error(`Team '${teamConfig.team.team_id}' has no team_pool.questions resolved.`);
  }
  return teamConfig.team_pool.questions;
}

function normalizeAsker(asker?: string): string {
  return asker?.trim().toLowerCase() ?? "";
}

function hasRequiredAskers(questions: InterviewQuestion[], constraints: { min_owner_questions?: number; min_gm_questions?: number } = {}) {
  const ownerCount = questions.filter((q) => normalizeAsker(q.asker) === "owner").length;
  const gmCount = questions.filter((q) => normalizeAsker(q.asker) === "gm").length;
  return ownerCount >= (constraints.min_owner_questions ?? 0) && gmCount >= (constraints.min_gm_questions ?? 0);
}

export function createInterviewSeed(
  leagueSeed: number,
  teamHash: number,
  saveSlotId: number,
  weekIndex: number,
  interviewIndex: number,
): number {
  return toUint32(leagueSeed ^ teamHash ^ saveSlotId ^ (weekIndex << 8) ^ interviewIndex);
}

export function generateInterview(teamConfig: TeamConfig, seed: number): InterviewSession {
  const rng = new XorShift32(seed);
  const contextRules = teamConfig.interview_flow.mix_rules.contextual_questions;
  const teamRules = teamConfig.interview_flow.mix_rules.team_pool_questions;

  const contextual = weightedNoReplacement(
    teamConfig.contextual_pool.questions,
    (question) => contextRules.selection.weights_by_question_key?.[question.question_key ?? ""] ?? 1,
    contextRules.count,
    rng,
  );

  const pool = getTeamPoolQuestions(teamConfig);
  const minOwner = teamRules.constraints?.min_owner_questions ?? 0;
  const minGm = teamRules.constraints?.min_gm_questions ?? 0;

  const ownerPool = pool.filter((question) => normalizeAsker(question.asker) === "owner");
  const gmPool = pool.filter((question) => normalizeAsker(question.asker) === "gm");

  if (ownerPool.length < minOwner || gmPool.length < minGm) {
    throw new Error(
      `Unable to satisfy team pool asker constraints for '${teamConfig.team.team_id}': requires OWNER>=${minOwner}, GM>=${minGm}, available OWNER=${ownerPool.length}, GM=${gmPool.length}.`,
    );
  }

  const teamSelected: InterviewQuestion[] = [
    ...weightedNoReplacement(
      ownerPool,
      (question) => teamRules.selection.asker_weighting?.[question.asker ?? ""] ?? teamRules.selection.asker_weighting?.OWNER ?? 1,
      minOwner,
      rng,
    ),
    ...weightedNoReplacement(
      gmPool,
      (question) => teamRules.selection.asker_weighting?.[question.asker ?? ""] ?? teamRules.selection.asker_weighting?.GM ?? 1,
      minGm,
      rng,
    ),
  ];

  const selectedIds = new Set(teamSelected.map((question) => question.question_id));
  const remainingPool = pool.filter((question) => !selectedIds.has(question.question_id));
  const remainingCount = teamRules.count - teamSelected.length;
  if (remainingCount > 0) {
    teamSelected.push(
      ...weightedNoReplacement(
        remainingPool,
        (question) => {
          const rawAsker = question.asker ?? "";
          const normalized = normalizeAsker(rawAsker);
          return (
            teamRules.selection.asker_weighting?.[rawAsker] ??
            teamRules.selection.asker_weighting?.[normalized] ??
            teamRules.selection.asker_weighting?.[rawAsker.toUpperCase()] ??
            1
          );
        },
        remainingCount,
        rng,
      ),
    );
  }

  if (!teamSelected.length || !hasRequiredAskers(teamSelected, teamRules.constraints)) {
    throw new Error(`Unable to satisfy team pool asker constraints for '${teamConfig.team.team_id}' with stratified selection.`);
  }

  return {
    seed,
    questions: [
      ...contextual.map((question) => ({ source: "contextual" as const, question })),
      ...teamSelected.map((question) => ({ source: "team_pool" as const, question })),
    ],
  };
}

function getHireFormulaVars(teamConfig: TeamConfig, metrics: Record<string, number>) {
  const vars: Record<string, number> = {
    owner: metrics.owner_approval,
    gm: metrics.gm_approval,
  };
  const teamId = teamConfig.team.team_id;
  if (teamId === "BIRMINGHAM_VULCANS") {
    vars.media = metrics.media_score;
    vars.stability = metrics.stability_score;
  } else if (teamId === "MILWAUKEE_NORTHSHORE") {
    vars.accountability = metrics.accountability_score;
    vars.toughness = metrics.toughness_score;
  } else if (teamId === "ATLANTA_APEX") {
    vars.authority = metrics.authority_score;
    vars.continuity = metrics.continuity_score;
  }
  return vars;
}

function getBand(bands: TeamConfig["scoring"]["hire_score"]["bands"], score: number): "HIRED" | "BORDERLINE" | "REJECTED" {
  if (bands.HIRED && score >= (bands.HIRED.min ?? Number.POSITIVE_INFINITY)) return "HIRED";
  if (bands.BORDERLINE && score >= (bands.BORDERLINE.min ?? Number.POSITIVE_INFINITY) && score <= (bands.BORDERLINE.max ?? Number.NEGATIVE_INFINITY)) {
    return "BORDERLINE";
  }
  return "REJECTED";
}

function parseBorderlineThreshold(teamConfig: TeamConfig, metrics: Record<string, number>) {
  const rules = teamConfig.scoring.hire_score.borderline_resolution?.rules ?? [];
  const owner = metrics.owner_approval;
  const gm = metrics.gm_approval;
  const ownerRule = rules.find((r) => r.includes("ownerApproval > gmApproval"));
  const gmRule = rules.find((r) => r.includes("gmApproval > ownerApproval"));
  const tieRule = rules.find((r) => r.toLowerCase().includes("tied"));

  const toPct = (rule?: string) => {
    const m = rule?.match(/(\d+)%/);
    return m ? Number(m[1]) / 100 : 0.5;
  };

  if (owner > gm) return toPct(ownerRule);
  if (gm > owner) return toPct(gmRule);
  return toPct(tieRule);
}

export function scoreInterview(
  teamConfig: TeamConfig,
  selectedQuestions: SelectedQuestion[],
  answers: Record<string, string>,
  seed: number,
): InterviewScoreResult {
  const rng = new XorShift32(seed);
  const metrics: Record<string, number> = {};
  const flags: string[] = [...((teamConfig.scoring.init.flags as string[]) ?? [])];

  for (const [key, value] of Object.entries(teamConfig.scoring.init)) {
    if (key !== "flags" && typeof value === "number") {
      metrics[key] = value;
    }
  }

  const details = selectedQuestions.map(({ source, question }) => {
    const choiceId = answers[question.question_id];
    const selected = question.options.find((option) => option.choice_id === choiceId);
    if (!selected) {
      throw new Error(`Missing answer for question '${question.question_id}'.`);
    }

    const appliedDeltas: Record<string, number> = {};
    const flagsAdded: string[] = [];

    const applyDelta = (rawDelta: Record<string, number | string>) => {
      for (const [deltaKey, deltaValue] of Object.entries(rawDelta)) {
        if (deltaKey === "riskFlag" || typeof deltaValue !== "number") continue;
        const clampRange = teamConfig.scoring.per_answer_delta_clamps?.[deltaKey];
        const value = clampRange ? clamp(deltaValue, clampRange[0], clampRange[1]) : deltaValue;
        const metricKey = resolveMetricKey(deltaKey, teamConfig);
        if (!metricKey) continue;
        metrics[metricKey] = (metrics[metricKey] ?? 0) + value;
        appliedDeltas[metricKey] = (appliedDeltas[metricKey] ?? 0) + value;
      }
      if (typeof rawDelta.riskFlag === "string") {
        flags.push(rawDelta.riskFlag);
        flagsAdded.push(rawDelta.riskFlag);
      }
    };

    const explicitDelta = (selected.delta ?? (selected as QuestionOption & { deltas?: Record<string, number | string> }).deltas) as
      | Record<string, number | string>
      | undefined;
    if (explicitDelta) {
      applyDelta(explicitDelta);
    }

    const appliedTags: string[] = [];
    if (!explicitDelta && source === "team_pool") {
      for (const tag of selected.tags ?? []) {
        const tagDelta = teamConfig.tag_deltas[tag];
        if (!tagDelta) continue;
        applyDelta(tagDelta);
        appliedTags.push(tag);
      }
    }

    if (!explicitDelta && source === "contextual") {
      for (const tag of selected.tags ?? []) {
        const tagDelta = teamConfig.tag_deltas[tag];
        if (!tagDelta) continue;
        applyDelta(tagDelta);
        appliedTags.push(tag);
      }
    }

    return {
      questionId: question.question_id,
      choiceId: selected.choice_id,
      source,
      appliedDeltas,
      appliedTags,
      flagsAdded,
    };
  });

  for (const [metricKey, [min, max]] of Object.entries(teamConfig.scoring.clamps)) {
    if (metricKey in metrics) {
      metrics[metricKey] = clamp(metrics[metricKey], min, max);
    }
  }

  const gateReasons: string[] = [];
  for (const [gateKey, gateValue] of Object.entries(teamConfig.scoring.gates ?? {})) {
    if (gateKey === "critical_flags" || gateKey === "max_critical_flags") continue;
    if (typeof gateValue !== "number") continue;
    const metric = gateKey.replace(/^min_/, "");
    if ((metrics[metric] ?? Number.NEGATIVE_INFINITY) < gateValue) {
      gateReasons.push(`${metric} below minimum ${gateValue}`);
    }
  }

  const criticalFlags = ((teamConfig.scoring.gates?.critical_flags as string[]) ?? []).filter((f) => flags.includes(f));
  const maxCriticalFlags = (teamConfig.scoring.gates?.max_critical_flags as number | undefined) ?? Number.POSITIVE_INFINITY;
  if (criticalFlags.length > maxCriticalFlags) {
    gateReasons.push(`critical flags exceeded: ${criticalFlags.join(", ")}`);
  }

  const gatePass = gateReasons.length === 0;
  const hireScoreBase = evaluateFormula(teamConfig.scoring.hire_score.formula, getHireFormulaVars(teamConfig, metrics));

  for (const _ of selectedQuestions) rng.nextUint32();

  let chemistryDelta = 0;
  const chemistryConfig = teamConfig.scoring.hire_score.chemistry_roll;
  if (chemistryConfig?.enabled_if_gates_pass && gatePass) {
    const [min, max] = chemistryConfig.delta_range;
    chemistryDelta = min + Math.floor(rng.nextFloat01() * (max - min + 1));
  }

  const hireScore = hireScoreBase + chemistryDelta;
  let band = gatePass ? getBand(teamConfig.scoring.hire_score.bands, hireScore) : "REJECTED";

  let borderlineCoinflip: InterviewScoreResult["borderlineCoinflip"];
  if (gatePass && band === "BORDERLINE" && teamConfig.scoring.hire_score.borderline_resolution?.method === "WEIGHTED_COIN_FLIP") {
    const threshold = parseBorderlineThreshold(teamConfig, metrics);
    const roll = rng.nextFloat01();
    const hired = roll < threshold;
    borderlineCoinflip = { used: true, threshold, roll, hired };
    band = hired ? "HIRED" : "REJECTED";
  }

  return {
    metrics,
    flags,
    gatePass,
    gateReasons,
    hireScore,
    hireScoreBase,
    chemistryDelta,
    band,
    borderlineCoinflip,
    details,
  };
}

export function getOptionByChoice(question: InterviewQuestion, choiceId: string): QuestionOption {
  const option = question.options.find((item) => item.choice_id === choiceId);
  if (!option) {
    throw new Error(`Option '${choiceId}' not found for question '${question.question_id}'.`);
  }
  return option;
}
