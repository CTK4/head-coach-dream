export type ScoutingWindowId = "COMBINE" | "FREE_AGENCY" | "PRE_DRAFT" | "IN_SEASON";

export type IntelTrack = "TALENT" | "MED" | "CHAR" | "FIT";
export type IntelState = Record<IntelTrack, number>;

export type MedicalTier = "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";
export type CharacterTier = "BLUE" | "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";

export type ProspectTrueProfile = {
  trueOVR: number;
  trueAttributes?: Record<string, number>;
  trueMedical: { tier: MedicalTier; recurrence01: number; degenerative: boolean };
  trueCharacter: { tier: CharacterTier; volatility01: number; leadershipTag: "LOW" | "MED" | "HIGH" };
};

export type ProspectScoutProfile = {
  prospectId: string;
  estCenter: number;
  estWidth: number;
  estLow: number;
  estHigh: number;
  confidence: number;
  clarity: IntelState;
  revealed: { medicalTier?: MedicalTier; characterTier?: CharacterTier; recurrence01?: number; degenerative?: boolean; leadershipTag?: "LOW" | "MED" | "HIGH" };
  lastSnapshot?: { windowKey: string; estCenter: number };
  stockArrow: "UP" | "DOWN" | "FLAT";
  notes: { film?: string; athletic?: string; character?: string; medical?: string };
  pinned?: boolean;
};

export type BigBoardState = {
  tiers: Record<"T1" | "T2" | "T3" | "T4" | "T5", string[]>;
  tierByProspectId: Record<string, "T1" | "T2" | "T3" | "T4" | "T5">;
};

export type CombineResult = {
  measurements?: { heightIn?: number; weightLb?: number; armIn?: number };
  medical?: { cleared?: boolean };
  forty?: number;
  shuttle?: number;
  vert?: number;
  bench?: number;
  ras?: number;
};

export type CombineDayRecap = {
  risers: string[];
  fallers: string[];
  flags: string[];
  focusedProspectIds: string[];
  interviewedProspectIds: string[];
  focusHoursSpent: number;
  interviewsUsed: number;
};

export type CombineState = {
  generated: boolean;
  day: 1 | 2 | 3 | 4;
  selectedByDay: Record<number, Record<string, string[]>>;
  interviewResultsByProspectId: Record<string, { characterPct?: number; intelligencePct?: number; notes?: string }>;
  days: Record<1 | 2 | 3 | 4, CombineDay>;
  prospects: Record<string, CombineProspectState>;
  resultsByProspectId: Record<string, CombineResult>;
  feed: { id: string; day: number; text: string; prospectId?: string }[];
  recapByDay: Record<number, CombineDayRecap>;
};

export type CombineDay = {
  dayIndex: 1 | 2 | 3 | 4;
  categoryKey: string;
  interviewsRemaining: number;
};

export type CombineProspectState = {
  characterRevealPct: number;
  intelligenceRevealPct: number;
  interviewCount: number;
  notes: string[];
};

export type VisitState = {
  privateWorkoutsRemaining: number;
  top30Remaining: number;
  applied: Record<string, { kind: "PRIVATE" | "TOP30"; focus: IntelTrack; windowKey: string }[]>;
};

export type InterviewState = {
  interviewsRemaining: number;
  history: Record<string, { category: "IQ" | "LEADERSHIP" | "STRESS" | "CULTURAL"; outcome: string; windowKey: string }[]>;
  modelARevealByProspectId: Record<string, { characterRevealPct: number; intelligenceRevealPct: number }>;
};

export type MedicalBoardState = {
  requests: Record<string, { requested: boolean; windowKey: string }>;
};

export type ScoutAllocationState = {
  poolHours: number;
  byGroup: Record<string, number>;
};

export type InSeasonScoutingState = {
  locked: boolean;
  regionFocus: string[];
  lastWeekUpdated?: number;
};

export type GMScoutingTraits = {
  eval_bandwidth: number;
  film_process: number;
  intel_network: number;
  risk_management: number;
  analytics_orientation: number;
};

export type ScoutingState = {
  windowId: ScoutingWindowId;
  windowKey: string;
  budget: { total: number; spent: number; remaining: number; carryIn: number };
  carryover: number;

  trueProfiles: Record<string, ProspectTrueProfile>;
  scoutProfiles: Record<string, ProspectScoutProfile>;
  myBoardOrder: string[];
  bigBoard: BigBoardState;
  combine: CombineState;
  visits: VisitState;
  interviews: InterviewState;
  medical: MedicalBoardState;
  allocation: ScoutAllocationState;
  inSeason: InSeasonScoutingState;
};
