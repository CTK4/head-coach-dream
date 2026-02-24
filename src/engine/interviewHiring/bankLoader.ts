import bank from "@/data/ugf_interview_bank_150.json";
import type { InterviewBank, TeamConfig } from "./types";

const interviewBank = bank as InterviewBank;

export function loadInterviewBank(): InterviewBank {
  return interviewBank;
}

export function resolvePool(poolId: string) {
  for (const teamConfig of interviewBank.systems) {
    if (teamConfig.team_pool?.pool_id === poolId && teamConfig.team_pool.questions?.length) {
      return teamConfig.team_pool;
    }
    if (teamConfig.contextual_pool?.pool_id === poolId && teamConfig.contextual_pool.questions?.length) {
      return teamConfig.contextual_pool;
    }
  }
  return undefined;
}

export function getTeamConfig(teamId: string): TeamConfig {
  const teamConfig = interviewBank.systems.find((system) => system.team?.team_id === teamId);
  if (!teamConfig) {
    throw new Error(`Team config not found for '${teamId}'.`);
  }
  validateTeamConfig(teamConfig);

  if (!teamConfig.team_pool.questions?.length) {
    const resolved = resolvePool(teamConfig.team_pool.pool_id);
    if (!resolved || !("questions" in resolved) || !resolved.questions?.length) {
      throw new Error(
        `Team pool '${teamConfig.team_pool.pool_id}' for '${teamId}' references external data not present in this JSON file.`,
      );
    }
    teamConfig.team_pool.questions = resolved.questions;
  }

  return teamConfig;
}

export function validateTeamConfig(teamConfig: TeamConfig) {
  const required: Array<[unknown, string]> = [
    [teamConfig.team?.team_id, "team.team_id"],
    [teamConfig.interview_flow?.mix_rules?.contextual_questions?.count, "interview_flow.mix_rules.contextual_questions.count"],
    [teamConfig.interview_flow?.mix_rules?.team_pool_questions?.count, "interview_flow.mix_rules.team_pool_questions.count"],
    [teamConfig.contextual_pool?.questions?.length, "contextual_pool.questions"],
    [teamConfig.team_pool?.pool_id, "team_pool.pool_id"],
    [teamConfig.scoring?.init, "scoring.init"],
    [teamConfig.scoring?.hire_score?.formula, "scoring.hire_score.formula"],
  ];

  for (const [value, path] of required) {
    if (value === undefined || value === null || value === 0) {
      throw new Error(`Invalid team config '${teamConfig.team?.team_id ?? "UNKNOWN"}': missing ${path}.`);
    }
  }
}
