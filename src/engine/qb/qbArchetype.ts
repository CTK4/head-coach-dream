import type { PlayerRow } from "@/data/leagueDb";
import { QB_TUNING, type QBArchetypeTag } from "@/config/qbTuning";

const toNum = (v: unknown, fallback = 60) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function mobilityScore(qb: PlayerRow) {
  return (toNum(qb.speed) * 0.35 + toNum(qb.acceleration) * 0.25 + toNum(qb.elusiveness) * 0.25 + toNum(qb.readSpeed) * 0.15);
}

function passingScore(qb: PlayerRow) {
  return (toNum(qb.accuracyShort) * 0.3 + toNum(qb.accuracyMid) * 0.25 + toNum(qb.accuracyDeep) * 0.15 + toNum(qb.decisionSpeed) * 0.2 + toNum(qb.pocketPresence) * 0.1);
}

export function resolveQbArchetypeTag(qb: PlayerRow): QBArchetypeTag {
  const manual = qb.qbArchetypeManualOverride;
  if (manual) return manual;
  if (qb.qbArchetypeAutoTag) return qb.qbArchetypeAutoTag;

  const mobility = mobilityScore(qb);
  const passing = passingScore(qb);
  const decision = toNum(qb.decisionSpeed);
  const pocket = toNum(qb.pocketPresence);
  const onRun = toNum(qb.armOnRunAccuracy);
  const thresholds = QB_TUNING.AUTO_TAG_THRESHOLDS;

  if (mobility >= thresholds.SCRAMBLER_MOBILITY_MIN && decision < thresholds.GAME_MANAGER_DECISION_MIN - 8) return "SCRAMBLER";
  if (mobility >= thresholds.DUAL_THREAT_MOBILITY_MIN && passing >= thresholds.DUAL_THREAT_PASSING_MIN) return "DUAL_THREAT";
  if (onRun >= 80 && decision >= 70 && pocket >= 66) return "IMPROVISER";
  if (decision >= thresholds.GAME_MANAGER_DECISION_MIN && pocket >= 70) return "GAME_MANAGER";
  if (mobility <= thresholds.POCKET_MOBILITY_MAX) return "POCKET_PURE";
  return "IMPROVISER";
}

export function getQbArchetypeBadge(tag: QBArchetypeTag): { label: string; tooltip: string } {
  const map: Record<QBArchetypeTag, { label: string; tooltip: string }> = {
    POCKET_PURE: { label: "Pocket Pure", tooltip: "Operates from structure with clean-footwork timing." },
    DUAL_THREAT: { label: "Dual Threat", tooltip: "Can execute pass and run branches under pressure." },
    SCRAMBLER: { label: "Scrambler", tooltip: "Escapes early and creates with mobility first." },
    GAME_MANAGER: { label: "Game Manager", tooltip: "Prioritizes decisions and safe situational offense." },
    IMPROVISER: { label: "Improviser", tooltip: "Creates off-script while preserving downfield options." },
  };
  return map[tag];
}
