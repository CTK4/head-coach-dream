export type GmMode = "REBUILD" | "RELOAD" | "CONTEND";

export type StrategicProfile = {
  gmMode: GmMode;
  pickValueMultiplier: number;
  veteranContractPenalty: number;
  immediateStarterWeight: number;
  voidYearProbability: number;
  aggressionLevel: number;
};

export function getTeamStrategicProfile(gmMode: GmMode): StrategicProfile {
  switch (gmMode) {
    case "REBUILD":
      return {
        gmMode: "REBUILD",
        pickValueMultiplier: 1.4,
        veteranContractPenalty: 1.3,
        immediateStarterWeight: 0.7,
        voidYearProbability: 0.2,
        aggressionLevel: 0.4,
      };
    case "CONTEND":
      return {
        gmMode: "CONTEND",
        pickValueMultiplier: 0.7,
        veteranContractPenalty: 0.8,
        immediateStarterWeight: 1.4,
        voidYearProbability: 0.6,
        aggressionLevel: 0.8,
      };
    case "RELOAD":
    default:
      return {
        gmMode: "RELOAD",
        pickValueMultiplier: 1.0,
        veteranContractPenalty: 1.0,
        immediateStarterWeight: 1.0,
        voidYearProbability: 0.4,
        aggressionLevel: 0.6,
      };
  }
}

export function applyStrategyToDraftScore(
  baseScore: number,
  age: number,
  grade: number,
  isPick: boolean,
  profile: StrategicProfile,
): number {
  let score = baseScore;

  if (isPick) {
    score *= profile.pickValueMultiplier;
    return score;
  }

  // Immediate impact weight
  if (grade >= 75) {
    score += (profile.immediateStarterWeight - 1.0) * grade * 0.1;
  }

  // Age penalty for rebuild mode (prefer younger prospects)
  if (profile.gmMode === "REBUILD" && age > 25) {
    score -= (age - 25) * 2 * profile.veteranContractPenalty;
  }

  return score;
}

export function applyStrategyToFaOffer(
  baseApy: number,
  age: number,
  ovr: number,
  profile: StrategicProfile,
): number {
  let apy = baseApy;

  // Veteran contract penalty in rebuild mode
  if (profile.gmMode === "REBUILD" && age >= 30) {
    apy *= 1 / profile.veteranContractPenalty;
  }

  // Contend mode: pay up for high-OVR players
  if (profile.gmMode === "CONTEND" && ovr >= 80) {
    apy *= profile.immediateStarterWeight;
  }

  return Math.round(apy);
}
