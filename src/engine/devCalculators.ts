import { getPerkDevelopmentMultiplier, type CoachPerkCarrier } from "@/engine/perkWiring";
import { computeSnapBasedDevelopmentDelta, type SnapCounts } from "@/systems/snapProgression";

export type PracticeFocusLevel = "LOW" | "NORMAL" | "HIGH";

export function computeDevArrow(player: {
  age?: unknown;
  overall?: unknown;
  potential?: unknown;
  dev?: unknown;
}, coach?: CoachPerkCarrier): "↑" | "→" | "↓" {
  const age = Number(player.age ?? 0);
  const ovr = Number(player.overall ?? 0);
  const p = player as Record<string, unknown>;
  const rawPotential = p.potential ?? p.dev;
  const potential = Number(rawPotential ?? 0);
  const perkDevMult = getPerkDevelopmentMultiplier(coach, player);
  const gap = (potential > 0 ? potential - ovr : 0) * perkDevMult;

  if (age >= 33) return "↓";
  if (age >= 30 && ovr >= 85) return "↓";
  if (age <= 24 && (gap >= 5 || potential === 0)) return "↑";
  if (age <= 26 && gap >= 8) return "↑";
  return "→";
}

export function computeDevRisk(player: { age?: unknown }): "LOW" | "MED" | "HIGH" {
  const age = Number(player.age ?? 0);
  if (age >= 34) return "HIGH";
  if (age >= 30) return "MED";
  return "LOW";
}

export function computeDevelopmentRate(baseRate: number, coach: CoachPerkCarrier | undefined, player: { draftRound?: unknown; age?: unknown }): number {
  return Number((baseRate * getPerkDevelopmentMultiplier(coach, player)).toFixed(4));
}

function devTraitMultiplier(devTrait: string): number {
  const t = String(devTrait || "").toUpperCase();
  if (t.includes("STAR") || t.includes("ELITE")) return 1.25;
  if (t.includes("QUICK")) return 1.15;
  if (t.includes("SLOW")) return 0.85;
  return 1;
}

function focusMultiplier(level: PracticeFocusLevel): number {
  return level === "HIGH" ? 1.2 : level === "LOW" ? 0.85 : 1;
}

export function computeSeasonDevelopmentDelta(player: {
  age?: unknown;
  overall?: unknown;
  dev?: unknown;
  practiceFocus?: PracticeFocusLevel;
  offensiveSnaps?: unknown;
  defensiveSnaps?: unknown;
  specialTeamsSnaps?: unknown;
  efficiencyScore?: unknown;
  teamSuccess?: unknown;
  injurySetback?: unknown;
}, coach?: CoachPerkCarrier): number {
  const age = Number(player.age ?? 24);
  const overall = Number(player.overall ?? 65);
  const perkMult = getPerkDevelopmentMultiplier(coach, player);
  const devMult = devTraitMultiplier(String(player.dev ?? ""));
  const practiceMult = focusMultiplier(player.practiceFocus ?? "NORMAL");

  const youthCurve = age <= 24 ? 2.2 : age <= 27 ? 1.4 : age <= 30 ? 0.3 : -0.9;
  const overallDrag = overall >= 90 ? -0.6 : overall >= 83 ? -0.25 : 0.2;
  const base = (youthCurve + overallDrag) * devMult * practiceMult * perkMult;
  const rounded = Math.round(base);

  const snapCounts: SnapCounts = {
    offensiveSnaps: Number(player.offensiveSnaps ?? 0),
    defensiveSnaps: Number(player.defensiveSnaps ?? 0),
    specialTeamsSnaps: Number(player.specialTeamsSnaps ?? 0),
  };
  const snapDelta = computeSnapBasedDevelopmentDelta({
    age,
    devTrait: String(player.dev ?? ""),
    overall,
    snaps: snapCounts,
    maxTeamSnaps: 1200,
    efficiencyScore: Number(player.efficiencyScore ?? 0.5),
    teamSuccess: Number(player.teamSuccess ?? 0.5),
    injurySetback: Number(player.injurySetback ?? 0),
  });

  return Math.max(-4, Math.min(5, Math.round((rounded + snapDelta) / 2)));
}
