import type { GameState } from "@/context/GameContext";
import type { MedicalStaff, TeamId } from "@/context/state/types/defaultStateTypes";

export function defaultMedicalStaffByTeamId(teamIds: TeamId[]): Record<TeamId, MedicalStaff> {
  return Object.fromEntries(teamIds.map((teamId) => [teamId, { diagnosis: 60, rehab: 60, prevention: 60, riskTolerance: 50 }]));
}

export function createInitialMedicalState(teamIds: TeamId[]): GameState["medical"] {
  return { playerMedicalById: {}, staffByTeamId: defaultMedicalStaffByTeamId(teamIds), injuryReportsByWeek: {} };
}
