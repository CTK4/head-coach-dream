export type DeltaMetricKey = string;

export interface QuestionOption {
  choice_id: string;
  text: string;
  delta?: Record<DeltaMetricKey, number>;
  tags?: string[];
}

export interface InterviewQuestion {
  question_id: string;
  question_key?: string;
  asker?: string;
  prompt: string;
  options: QuestionOption[];
}

export interface TeamInfo {
  team_id: string;
  team_name: string;
  owner?: string;
  gm?: string;
}

export interface TeamConfig {
  version: string;
  system_id: string;
  team: TeamInfo;
  interview_flow: {
    total_questions: number;
    mix_rules: {
      contextual_questions: {
        count: number;
        source_pool?: string;
        selection: {
          method: string;
          weights_by_question_key?: Record<string, number>;
        };
      };
      team_pool_questions: {
        count: number;
        source_pool?: string;
        constraints?: {
          min_owner_questions?: number;
          min_gm_questions?: number;
        };
        selection: {
          method: string;
          asker_weighting?: Record<string, number>;
        };
      };
    };
    determinism?: Record<string, unknown>;
  };
  scoring: {
    init: Record<string, number | string[]>;
    clamps: Record<string, [number, number]>;
    per_answer_delta_clamps?: Record<string, [number, number]>;
    gates?: Record<string, number | string[]>;
    hire_score: {
      formula: string;
      chemistry_roll?: {
        enabled_if_gates_pass: boolean;
        delta_range: [number, number];
      };
      bands: Record<string, { min?: number; max?: number }>;
      borderline_resolution?: {
        method: string;
        rules: string[];
      };
    };
  };
  tag_deltas: Record<string, Record<string, number | string>>;
  contextual_pool: {
    pool_id: string;
    scenario?: string;
    questions: InterviewQuestion[];
  };
  team_pool: {
    pool_id: string;
    questions?: InterviewQuestion[];
    question_reference_note?: string;
  };
}

export interface InterviewBank {
  systems: TeamConfig[];
}

export interface SelectedQuestion {
  source: "contextual" | "team_pool";
  question: InterviewQuestion;
}

export interface InterviewSession {
  seed: number;
  questions: SelectedQuestion[];
}

export interface ScoringDetail {
  questionId: string;
  choiceId: string;
  source: "contextual" | "team_pool";
  appliedDeltas: Record<string, number>;
  appliedTags: string[];
  flagsAdded: string[];
}

export interface InterviewScoreResult {
  metrics: Record<string, number>;
  flags: string[];
  gatePass: boolean;
  gateReasons: string[];
  hireScore: number;
  hireScoreBase: number;
  chemistryDelta: number;
  band: "HIRED" | "BORDERLINE" | "REJECTED";
  borderlineCoinflip?: {
    used: boolean;
    threshold: number;
    roll: number;
    hired: boolean;
  };
  details: ScoringDetail[];
}
