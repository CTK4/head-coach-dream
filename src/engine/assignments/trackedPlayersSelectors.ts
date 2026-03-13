import type { DefenseRole, OffenseEligibleRole, OLineRole } from "@/engine/assignments/types";
import type { PlayerId, TrackedPlayersBySide } from "@/engine/types/trackedPlayers";

type SelectionResult = { id: PlayerId; usedFallback: boolean };

function pick(tracked: TrackedPlayersBySide, primary: Array<keyof TrackedPlayersBySide>, fallback: Array<keyof TrackedPlayersBySide>, note: string, notes: string[]): SelectionResult {
  for (const key of primary) {
    const id = tracked[key];
    if (id) return { id: String(id), usedFallback: false };
  }
  for (const key of fallback) {
    const id = tracked[key];
    if (id) {
      notes.push(note);
      return { id: String(id), usedFallback: true };
    }
  }
  notes.push(`${note}:missing`);
  return { id: "UNKNOWN_PLAYER", usedFallback: true };
}

export function getOffenseEligibleId(tracked: TrackedPlayersBySide, role: OffenseEligibleRole, notes: string[]): SelectionResult {
  if (role === "QB") return pick(tracked, ["QB1"], ["QB"], `offense-fallback:${role}`, notes);
  if (role === "RB") return pick(tracked, ["RB1"], ["RB"], `offense-fallback:${role}`, notes);
  if (role === "X") return pick(tracked, ["WR1"], ["WR", "TE1"], `offense-fallback:${role}`, notes);
  if (role === "Z") return pick(tracked, ["WR2"], ["WR", "TE1"], `offense-fallback:${role}`, notes);
  if (role === "H") return pick(tracked, ["WR3", "FB1"], ["WR", "RB"], `offense-fallback:${role}`, notes);
  return pick(tracked, ["TE1", "WR4", "TE2"], ["TE", "WR"], `offense-fallback:${role}`, notes);
}

export function getOLId(tracked: TrackedPlayersBySide, role: OLineRole, notes: string[]): SelectionResult {
  if (role === "LT") return pick(tracked, ["LT1"], ["OL"], `offense-fallback:${role}`, notes);
  if (role === "LG") return pick(tracked, ["LG1"], ["OL"], `offense-fallback:${role}`, notes);
  if (role === "C") return pick(tracked, ["C1"], ["OL"], `offense-fallback:${role}`, notes);
  if (role === "RG") return pick(tracked, ["RG1"], ["OL"], `offense-fallback:${role}`, notes);
  return pick(tracked, ["RT1"], ["OL"], `offense-fallback:${role}`, notes);
}

export function getDefenseRoleId(tracked: TrackedPlayersBySide, role: DefenseRole, notes: string[]): SelectionResult {
  const dbRoles: DefenseRole[] = ["CB1", "CB2", "NB", "FS", "SS"];
  const lbRoles: DefenseRole[] = ["LB1", "LB2", "OLB_L", "OLB_R"];
  if (dbRoles.includes(role)) return pick(tracked, [role as keyof TrackedPlayersBySide], ["DB", "LB"], `defense-fallback:${role}`, notes);
  if (lbRoles.includes(role)) return pick(tracked, [role as keyof TrackedPlayersBySide], ["LB", "DB"], `defense-fallback:${role}`, notes);
  return pick(tracked, [role as keyof TrackedPlayersBySide], ["DL", "LB"], `defense-fallback:${role}`, notes);
}
