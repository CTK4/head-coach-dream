import type { MedicalStaff, TeamId } from "@/context/state/types/defaultStateTypes";

export function defaultMedicalStaffByTeamId(teamIds: TeamId[]): Record<TeamId, MedicalStaff> {
  return Object.fromEntries(teamIds.map((teamId) => [teamId, { diagnosis: 60, rehab: 60, prevention: 60, riskTolerance: 50 }]));
}
