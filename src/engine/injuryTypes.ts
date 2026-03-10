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

export type RecurrenceRiskLevel = "Low" | "Medium" | "High";

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
  occurredWeek?: number;
  recurrenceWindow?: number;
  recurrenceMultiplier?: number;
  chronic?: boolean;
};

// Soft tissue injury types that can lead to chronic issues
export const SOFT_TISSUE_TYPES = new Set([
  "Hamstring",
  "Hip Flexor",
  "Groin",
  "Calf",
  "Quadriceps",
  "Back",
]);

export function getRecurrenceRiskLevel(multiplier: number): RecurrenceRiskLevel {
  if (multiplier >= 1.5) return "High";
  if (multiplier >= 1.2) return "Medium";
  return "Low";
}

export function computeRecurrenceMultiplier(
  playerId: string,
  injuryType: string,
  currentWeek: number,
  priorInjuries: Injury[],
): number {
  let multiplier = 1.0;

  const sameType = priorInjuries.filter(
    (inj) =>
      inj.playerId === playerId &&
      inj.injuryType === injuryType &&
      inj.occurredWeek != null &&
      currentWeek - inj.occurredWeek <= (inj.recurrenceWindow ?? 8),
  );

  if (sameType.length > 0) {
    multiplier *= sameType[0].recurrenceMultiplier ?? 1.3;
  }

  // Chronic flag: 2+ soft tissue injuries → small permanent boost
  const softTissueCount = priorInjuries.filter(
    (inj) => inj.playerId === playerId && SOFT_TISSUE_TYPES.has(inj.injuryType),
  ).length;
  if (softTissueCount >= 2) {
    multiplier *= 1.1;
  }

  return multiplier;
}
