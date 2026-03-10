export type TeamId = string;

export type OwnerGoalSet = {
  minWins: number;
  playoffRoundTarget: "MISS" | "WILD_CARD" | "DIVISIONAL" | "CONF_TITLE" | "CHAMPION";
  topUnitTarget?: { unit: "OFFENSE" | "DEFENSE" | "ST"; rankMax: number };
  disciplineTarget?: { maxPenaltiesRank?: number };
  financeTarget?: { capOverageAllowed: number; deadCapMax: number };
};

export type OwnerUltimatum = { year: number; trigger: string; resolved: boolean };

export type OwnerState = {
  approval: number;
  pressure: number;
  trust: number;
  lastEvaluation?: { year: number; summary: string; delta: number };
  ultimatums: OwnerUltimatum[];
  currentGoals?: OwnerGoalSet;
};

export type MedicalStaff = {
  diagnosis: number;
  rehab: number;
  prevention: number;
  riskTolerance: number;
};

export type SidelineAdjustments = {
  offense: {
    tempo: "SLOW" | "NORMAL" | "NO_HUDDLE";
    aggressiveness: number;
    runBias: number;
    passProtection: "BASE" | "MAX_PROTECT" | "SLIDE_LEFT" | "SLIDE_RIGHT";
    targetFocus?: string;
  };
  defense: {
    shellPreference: "AUTO" | "SINGLE_HIGH" | "TWO_HIGH";
    blitzRate: number;
    spyQB: boolean;
    bracket?: string;
    runFit: "LIGHT_BOX" | "NORMAL" | "HEAVY_BOX";
  };
  specialTeams: {
    returnAggression: number;
    puntStrategy: "NORMAL" | "PIN_DEEP" | "RUGBY" | "FAKE_ALERT";
  };
};

export type DynastySeasonLog = {
  year: number;
  wins: number;
  playoffResult: string;
  awards: string[];
  rankOff?: number;
  rankDef?: number;
  rankST?: number;
  ownerOutcome: "EXTENDED" | "WARNED" | "ULTIMATUM" | "FIRED" | "STABLE";
  legacyDelta: number;
};

export type DynastyProfile = {
  legacyScore: number;
  seasonLog: DynastySeasonLog[];
  milestones: Array<{ key: string; achievedYear: number }>;
  unlockedCosmetics?: string[];
};

export type DeterministicCounters = {
  news: number;
  feedback: number;
  ui: number;
  offer: number;
  staff: number;
  injury: number;
};
