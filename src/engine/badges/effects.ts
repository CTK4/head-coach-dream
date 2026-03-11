import type { BadgeId, PlayerBadge } from "@/engine/badges/types";

export type BadgeEffectMatrixRow = {
  badgeId: BadgeId;
  appliesIn: string;
  effect: string;
  mechanical: boolean;
  notes?: string;
};

export const BADGE_EFFECT_MATRIX: BadgeEffectMatrixRow[] = [
  { badgeId: "IRONMAN", appliesIn: "Run/Pass offense", effect: "+0.01 PAS", mechanical: true },
  { badgeId: "GUNSLINGER", appliesIn: "Pass offense (QB)", effect: "+0.05 PAS, +1 pass yards", mechanical: true },
  { badgeId: "LOCKDOWN", appliesIn: "Pass defense (DB)", effect: "-0.02 PAS", mechanical: true },
  {
    badgeId: "ROAD_WARRIOR",
    appliesIn: "Run/Pass offense",
    effect: "+0.015 PAS, +1 run yards",
    mechanical: true,
    notes: "Name is flavor; effect applies in all game contexts (not away-only).",
  },
  { badgeId: "BALLHAWK", appliesIn: "Pass defense (DB/LB)", effect: "-0.015 PAS", mechanical: true },
  { badgeId: "SACK_ARTIST", appliesIn: "Pass defense (DL/LB)", effect: "-0.025 PAS", mechanical: true },
  { badgeId: "WORKHORSE", appliesIn: "Run offense (RB)", effect: "+1 run yards", mechanical: true },
  { badgeId: "CHAIN_MOVER", appliesIn: "Pass offense (RB/WR/TE)", effect: "+0.015 PAS, +1 pass yards", mechanical: true },
  { badgeId: "RED_ZONE_REAPER", appliesIn: "Red-zone offense (QB/RB/WR/TE)", effect: "+0.03 PAS when ballOn >= 80", mechanical: true, notes: "Single application; does not stack from multiple eligible players." },
  { badgeId: "CLUTCH_KICKER", appliesIn: "Field goals (active kicker only)", effect: "+3 kick accuracy, +1 kick power", mechanical: true },
  { badgeId: "BOOMING_LEG", appliesIn: "Punts (active punter only)", effect: "+3 punt power, +2 punt hang", mechanical: true },
  { badgeId: "SHUTDOWN_CORNER", appliesIn: "Pass defense (DB)", effect: "-0.03 PAS", mechanical: true },
];

export type BadgeSimContext = {
  playType: string;
  ballOn: number;
  offenseIds: Partial<Record<"QB" | "RB" | "WR" | "TE", string | undefined>>;
  defenseIds: Partial<Record<"DL" | "LB" | "DB", string | undefined>>;
  specialistIds?: Partial<Record<"K" | "P", string | undefined>>;
};

export type BadgeSimModifiers = {
  pasDelta: number;
  runYardsDelta: number;
  passYardsDelta: number;
  fgAccuracyDelta: number;
  fgPowerDelta: number;
  puntPowerDelta: number;
  puntHangDelta: number;
};

function hasBadge(playerBadges: Record<string, PlayerBadge[]>, playerId: string | undefined, badgeId: BadgeId): boolean {
  if (!playerId) return false;
  return (playerBadges[String(playerId)] ?? []).some((b) => b.badgeId === badgeId);
}

export function resolveBadgeSimModifiers(playerBadges: Record<string, PlayerBadge[]>, context: BadgeSimContext): BadgeSimModifiers {
  const isRun = ["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "RUN", "QB_KEEP"].includes(String(context.playType));
  const isPass = !["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "RUN", "QB_KEEP", "SPIKE", "KNEEL", "PUNT", "FG"].includes(String(context.playType));
  let pasDelta = 0;
  let runYardsDelta = 0;
  let passYardsDelta = 0;
  let fgAccuracyDelta = 0;
  let fgPowerDelta = 0;
  let puntPowerDelta = 0;
  let puntHangDelta = 0;

  const qbHasRoadWarrior = hasBadge(playerBadges, context.offenseIds.QB, "ROAD_WARRIOR");
  const anyChainMover = hasBadge(playerBadges, context.offenseIds.WR, "CHAIN_MOVER") || hasBadge(playerBadges, context.offenseIds.TE, "CHAIN_MOVER") || hasBadge(playerBadges, context.offenseIds.RB, "CHAIN_MOVER");
  const anyRedZoneReaper = hasBadge(playerBadges, context.offenseIds.QB, "RED_ZONE_REAPER") || hasBadge(playerBadges, context.offenseIds.RB, "RED_ZONE_REAPER") || hasBadge(playerBadges, context.offenseIds.WR, "RED_ZONE_REAPER") || hasBadge(playerBadges, context.offenseIds.TE, "RED_ZONE_REAPER");

  if (hasBadge(playerBadges, context.offenseIds.QB, "IRONMAN")) pasDelta += 0.01;
  if (hasBadge(playerBadges, context.offenseIds.QB, "GUNSLINGER") && isPass) {
    pasDelta += 0.05;
    passYardsDelta += 1;
  }
  if (qbHasRoadWarrior) {
    pasDelta += 0.015;
    if (isRun) runYardsDelta += 1;
  }
  if (isPass && anyChainMover) {
    pasDelta += 0.015;
    passYardsDelta += 1;
  }
  if (isRun && hasBadge(playerBadges, context.offenseIds.RB, "WORKHORSE")) runYardsDelta += 1;
  if (context.ballOn >= 80 && isPass && anyRedZoneReaper) pasDelta += 0.03;

  if (isPass && hasBadge(playerBadges, context.defenseIds.DB, "LOCKDOWN")) pasDelta -= 0.02;
  if (isPass && hasBadge(playerBadges, context.defenseIds.DB, "SHUTDOWN_CORNER")) pasDelta -= 0.03;
  if (isPass && (hasBadge(playerBadges, context.defenseIds.DB, "BALLHAWK") || hasBadge(playerBadges, context.defenseIds.LB, "BALLHAWK"))) pasDelta -= 0.015;
  if (isPass && (hasBadge(playerBadges, context.defenseIds.DL, "SACK_ARTIST") || hasBadge(playerBadges, context.defenseIds.LB, "SACK_ARTIST"))) pasDelta -= 0.025;

  if (String(context.playType) === "FG" && hasBadge(playerBadges, context.specialistIds?.K, "CLUTCH_KICKER")) {
    fgAccuracyDelta += 3;
    fgPowerDelta += 1;
  }
  if (String(context.playType) === "PUNT" && hasBadge(playerBadges, context.specialistIds?.P, "BOOMING_LEG")) {
    puntPowerDelta += 3;
    puntHangDelta += 2;
  }

  return {
    pasDelta: Math.max(-0.12, Math.min(0.12, Number(pasDelta.toFixed(4)))),
    runYardsDelta: Math.max(-2, Math.min(2, Math.round(runYardsDelta))),
    passYardsDelta: Math.max(-2, Math.min(2, Math.round(passYardsDelta))),
    fgAccuracyDelta: Math.max(-4, Math.min(4, fgAccuracyDelta)),
    fgPowerDelta: Math.max(-3, Math.min(3, fgPowerDelta)),
    puntPowerDelta: Math.max(-4, Math.min(4, puntPowerDelta)),
    puntHangDelta: Math.max(-3, Math.min(3, puntHangDelta)),
  };
}
