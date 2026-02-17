export type StaffRoleKey =
  | "OC"
  | "DC"
  | "STC"
  | "assistantHcId"
  | "qbCoachId"
  | "olCoachId"
  | "dlCoachId"
  | "lbCoachId"
  | "dbCoachId"
  | "rbCoachId"
  | "wrCoachId";

export type SalaryOfferLevel = "LOW" | "FAIR" | "HIGH";

export function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function roleBaseM(role: StaffRoleKey): number {
  if (role === "OC" || role === "DC") return 3.2;
  if (role === "STC") return 2.4;
  if (role === "assistantHcId") return 2.1;
  return 1.15;
}

export function expectedSalary(role: StaffRoleKey, staffRep: number): number {
  const r = Math.max(0, Math.min(100, staffRep));
  const mult = 0.7 + (r / 100) * 0.9;
  return Math.round(roleBaseM(role) * mult * 1_000_000);
}

export function offerSalary(expected: number, level: SalaryOfferLevel): number {
  if (level === "LOW") return Math.round(expected * 0.85);
  if (level === "HIGH") return Math.round(expected * 1.2);
  return Math.round(expected);
}

export function offerQualityScore(offered: number, expected: number): number {
  const ratio = expected <= 0 ? 1 : offered / expected;
  return clamp100(50 + (ratio - 1) * 120);
}
