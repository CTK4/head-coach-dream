import { getPerkCapLift, getPerkReputationDeltas } from "@/engine/perkWiring";

export type VolatilityExpectation = "LOW" | "LOW_MED" | "MED_HIGH" | "HIGH" | "VERY_HIGH" | "EXTREME";

type ReputationCapContext = {
  archetypeId?: string;
  tenureYear?: number;
  top10OffenseAchieved?: boolean;
  top10DefenseAchieved?: boolean;
  coach?: { unlockedPerkIds?: string[] };
};

export type CoachReputation = {
  leaguePrestige: number;
  offCred: number;
  defCred: number;
  leadershipTrust: number;
  mediaRep: number;
  playerRespect: number;
  ownerPatienceMult: number;
  autonomyLevel: number;
  riskTolerancePerception: number;
  innovationPerception: number;
  volatilityExpectation: VolatilityExpectation;
};

export function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function volatilityTo100(v: VolatilityExpectation): number {
  if (v === "LOW") return 25;
  if (v === "LOW_MED") return 40;
  if (v === "MED_HIGH") return 60;
  if (v === "HIGH") return 70;
  if (v === "VERY_HIGH") return 85;
  return 95;
}

export function ownerPatienceToStability(ownerPatienceMult: number): number {
  return clamp100(60 + (ownerPatienceMult - 1) * 80);
}

export function computeHrs(rep: CoachReputation): number {
  const ownerStability = ownerPatienceToStability(rep.ownerPatienceMult);
  return clamp100(
    0.25 * rep.leaguePrestige +
      0.2 * rep.leadershipTrust +
      0.15 * rep.playerRespect +
      0.15 * rep.mediaRep +
      0.15 * ownerStability +
      0.1 * rep.autonomyLevel
  );
}

export function offenseInterestBoost(rep: CoachReputation): number {
  return clamp01((rep.offCred - 50) / 700);
}

export function defenseInterestBoost(rep: CoachReputation): number {
  return clamp01((rep.defCred - 50) / 650);
}

export function applyRejectionPenalty(rep: CoachReputation): CoachReputation {
  return { ...rep, mediaRep: clamp100(rep.mediaRep - 2), leadershipTrust: clamp100(rep.leadershipTrust - 1) };
}

export function applyArchetypeDeltas(rep: CoachReputation, startingDeltas: Partial<Record<keyof CoachReputation, number>>): CoachReputation {
  const next: CoachReputation = { ...rep };
  for (const [key, delta] of Object.entries(startingDeltas) as Array<[keyof CoachReputation, number]>) {
    if (typeof delta !== "number") continue;
    if (key === "ownerPatienceMult") {
      next.ownerPatienceMult = Math.max(0.5, Math.min(1.5, Number(next.ownerPatienceMult ?? 1) + delta));
      continue;
    }
    if (key === "volatilityExpectation") continue;
    next[key] = clamp100(Number(next[key] ?? 0) + delta) as never;
  }
  return next;
}

export function applyPerkReputationBonuses(coach: { reputation?: CoachReputation; unlockedPerkIds?: string[] }): CoachReputation {
  const rep = coach.reputation;
  if (!rep) {
    return {
      leaguePrestige: 50,
      offCred: 50,
      defCred: 50,
      leadershipTrust: 50,
      mediaRep: 50,
      playerRespect: 50,
      ownerPatienceMult: 1,
      autonomyLevel: 50,
      riskTolerancePerception: 50,
      innovationPerception: 50,
      volatilityExpectation: "MED_HIGH",
    };
  }
  const deltas = getPerkReputationDeltas(coach);
  const next: CoachReputation = { ...rep };
  for (const [key, delta] of Object.entries(deltas)) {
    if (typeof delta !== "number") continue;
    if (key === "ownerPatienceMult") {
      next.ownerPatienceMult = Math.max(0.5, Math.min(1.5, Number(next.ownerPatienceMult ?? 1) + delta));
      continue;
    }
    if (key in next) (next as any)[key] = clamp100(Number((next as any)[key] ?? 0) + delta);
  }
  return next;
}

export function enforceArchetypeReputationCaps(rep: CoachReputation, ctx: ReputationCapContext): CoachReputation {
  const tenureYear = Number(ctx.tenureYear ?? 1);
  const next = { ...rep };

  if (ctx.archetypeId === "oc_promoted" && (tenureYear < 3 || !ctx.top10DefenseAchieved)) {
    next.defCred = Math.min(next.defCred, getPerkCapLift(ctx.coach, "defCred", 65));
  }
  if (ctx.archetypeId === "dc_promoted" && (tenureYear < 3 || !ctx.top10OffenseAchieved)) {
    next.offCred = Math.min(next.offCred, getPerkCapLift(ctx.coach, "offCred", 65));
  }
  if (ctx.archetypeId === "young_guru" && tenureYear < 4) {
    next.defCred = Math.min(next.defCred, getPerkCapLift(ctx.coach, "defCred", 55));
  }

  return {
    ...next,
    leaguePrestige: clamp100(next.leaguePrestige),
    offCred: clamp100(next.offCred),
    defCred: clamp100(next.defCred),
    leadershipTrust: clamp100(next.leadershipTrust),
    mediaRep: clamp100(next.mediaRep),
    playerRespect: clamp100(next.playerRespect),
    autonomyLevel: clamp100(next.autonomyLevel),
    riskTolerancePerception: clamp100(next.riskTolerancePerception),
    innovationPerception: clamp100(next.innovationPerception),
  };
}
