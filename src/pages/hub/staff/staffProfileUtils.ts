import type { GameState } from "@/context/GameContext";

export type StaffAssignment = {
  roleKey: keyof GameState["assistantStaff"] | "ocId" | "dcId" | "stcId";
  label: string;
  personId?: string;
};

export function buildStaffAssignments(state: GameState): StaffAssignment[] {
  return [
    { roleKey: "ocId", label: "Offensive Coordinator", personId: state.staff.ocId },
    { roleKey: "dcId", label: "Defensive Coordinator", personId: state.staff.dcId },
    { roleKey: "stcId", label: "Special Teams Coordinator", personId: state.staff.stcId },
    { roleKey: "assistantHcId", label: "Assistant Head Coach", personId: state.assistantStaff.assistantHcId },
    { roleKey: "qbCoachId", label: "QB Coach", personId: state.assistantStaff.qbCoachId },
    { roleKey: "olCoachId", label: "OL Coach", personId: state.assistantStaff.olCoachId },
    { roleKey: "rbCoachId", label: "RB Coach", personId: state.assistantStaff.rbCoachId },
    { roleKey: "wrCoachId", label: "WR Coach", personId: state.assistantStaff.wrCoachId },
    { roleKey: "dlCoachId", label: "DL Coach", personId: state.assistantStaff.dlCoachId },
    { roleKey: "lbCoachId", label: "LB Coach", personId: state.assistantStaff.lbCoachId },
    { roleKey: "dbCoachId", label: "DB Coach", personId: state.assistantStaff.dbCoachId },
  ];
}
