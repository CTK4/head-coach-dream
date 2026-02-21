export type InjurySeverity = "MINOR" | "MODERATE" | "SEVERE" | "SEASON_ENDING";

export type InjuryStatus = "OUT" | "DOUBTFUL" | "QUESTIONABLE" | "IR" | "PUP" | "DAY_TO_DAY";

export type InjuryBodyArea =
  | "HEAD"
  | "NECK"
  | "SHOULDER"
  | "ARM"
  | "HAND"
  | "CHEST"
  | "BACK"
  | "HIP"
  | "KNEE"
  | "ANKLE"
  | "FOOT"
  | "LOWER_LEG"
  | "UPPER_LEG"
  | "RIBS"
  | "OTHER";

export type InjuryBadge = "NEW" | "WORSENED" | "RETURNING";

export type PracticeStatus = "FULL" | "LIMITED" | "DNP";

export type RehabStage = "INITIAL" | "REHAB" | "RECONDITIONING" | "RETURN_TO_PLAY";

export type Injury = {
  id: string;
  playerId: string;
  teamId: string;
  injuryType: string;
  bodyArea: InjuryBodyArea;
  severity: InjurySeverity;
  status: InjuryStatus;
  startWeek: number;
  expectedReturnWeek?: number;
  practiceStatus?: PracticeStatus;
  recurrenceRisk?: number;
  notes?: string;
  isSeasonEnding: boolean;
  badges?: InjuryBadge[];
  rehabStage?: RehabStage;
  gamesMissed?: number;
  baseRisk?: number;
  riskMultipliers?: { label: string; value: number }[];
};
