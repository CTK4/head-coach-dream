import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";
import type { RebuildStage, TeamProfile } from "@/models/teamProfile";

export type CpuPlayer = {
  playerId: string;
  pos: string;
  age: number;
  overall: number;
  devTrait?: string;
  yearsRemaining?: number;
  capHit?: number;
  deadCap?: number;
  marketValue?: number;
};

export type CpuTeamContext = {
  teamId: string;
  capSpace: number;
  capTotal: number;
  profile: TeamProfile;
  rosterByPos: Record<string, CpuPlayer[]>;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function devMultiplier(devTrait?: string): number {
  const t = String(devTrait ?? "").toUpperCase();
  if (t.includes("SUPER") || t.includes("X")) return 1.18;
  if (t.includes("STAR")) return 1.11;
  if (t.includes("NORMAL")) return 1;
  return 0.95;
}

function ageProjection(age: number, years = 2): number {
  const delta = Math.max(0, age + years - SIM_SYSTEMS_CONFIG.offseason.resign.ageCurvePeak);
  return clamp01(1 - delta * SIM_SYSTEMS_CONFIG.offseason.resign.ageDeclinePerYear);
}

function teamStageMultiplier(stage: RebuildStage): number {
  if (stage === "contender") return SIM_SYSTEMS_CONFIG.offseason.resign.contenderUrgency;
  if (stage === "rebuild") return SIM_SYSTEMS_CONFIG.offseason.resign.rebuildPatience;
  return 1;
}

export function estimatePlayerMarketValue(player: CpuPlayer): number {
  const base = Number(player.marketValue ?? (player.overall * 120_000));
  return Math.round(base * ageProjection(player.age, 1) * devMultiplier(player.devTrait));
}

export function cpuResignPlayers(team: CpuTeamContext, expiringPlayers: CpuPlayer[]): { playerId: string; offerApy: number; years: number; tagged?: boolean }[] {
  const offers: { playerId: string; offerApy: number; years: number; tagged?: boolean }[] = [];
  const capReserve = team.capTotal * SIM_SYSTEMS_CONFIG.offseason.minimumCapBufferRatio;
  let capBudget = Math.max(0, team.capSpace - capReserve);

  const sorted = [...expiringPlayers].sort((a, b) => {
    const aScore = a.overall * ageProjection(a.age, 2) * devMultiplier(a.devTrait);
    const bScore = b.overall * ageProjection(b.age, 2) * devMultiplier(b.devTrait);
    return bScore - aScore;
  });

  for (const player of sorted) {
    const annual = estimatePlayerMarketValue(player);
    const capShare = annual / Math.max(1, team.capTotal);
    if (capShare > SIM_SYSTEMS_CONFIG.offseason.resign.maxCapPortionPerPlayer && player.age >= 30) continue;

    const needBoost = 1 + (team.profile.positionalNeeds[String(player.pos).toUpperCase()] ?? 0) * 0.25;
    const ageValue = ageProjection(player.age, 3);
    const stageMult = teamStageMultiplier(team.profile.rebuildStage);
    const valueScore = player.overall * ageValue * devMultiplier(player.devTrait) * needBoost * stageMult;

    if (valueScore < 62) continue;
    if (annual > capBudget) continue;

    const years = team.profile.rebuildStage === "rebuild" ? (player.age <= 25 ? 4 : 2) : team.profile.rebuildStage === "contender" ? (player.age <= 28 ? 3 : 1) : 2;
    offers.push({ playerId: player.playerId, offerApy: annual, years });
    capBudget -= annual;
  }

  if (!offers.length) {
    const eliteTaggable = sorted.find((p) => {
      const pos = String(p.pos).toUpperCase();
      const bonus = SIM_SYSTEMS_CONFIG.offseason.elitePositionTagBonus[pos] ?? 0;
      return p.overall + bonus * 100 >= SIM_SYSTEMS_CONFIG.offseason.eliteTagThreshold;
    });
    if (eliteTaggable) {
      offers.push({ playerId: eliteTaggable.playerId, offerApy: Math.round(estimatePlayerMarketValue(eliteTaggable) * 1.2), years: 1, tagged: true });
    }
  }

  return offers;
}

export function rankFreeAgencyTargets(team: CpuTeamContext, market: CpuPlayer[]): CpuPlayer[] {
  return [...market]
    .map((player) => {
      const pos = String(player.pos).toUpperCase();
      const need = team.profile.positionalNeeds[pos] ?? 0;
      const redundantAtPos = (team.rosterByPos[pos] ?? []).some((p) => p.overall >= player.overall - 2 && p.age <= player.age);
      const cost = estimatePlayerMarketValue(player) / Math.max(1, team.capTotal);
      const score =
        need * SIM_SYSTEMS_CONFIG.offseason.freeAgency.needWeight +
        (player.overall / 100) * SIM_SYSTEMS_CONFIG.offseason.freeAgency.overallWeight +
        (1 - cost) * SIM_SYSTEMS_CONFIG.offseason.freeAgency.valueWeight -
        (redundantAtPos ? SIM_SYSTEMS_CONFIG.offseason.freeAgency.redundancyPenalty : 0);
      return { player, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.player);
}

export function buildCpuDraftBoard(team: CpuTeamContext, prospects: CpuPlayer[]): CpuPlayer[] {
  return [...prospects]
    .map((p) => {
      const need = team.profile.positionalNeeds[String(p.pos).toUpperCase()] ?? 0;
      const immediate = p.overall / 100;
      const youth = clamp01((27 - p.age) / 10);
      const dev = devMultiplier(p.devTrait) - 1;
      const contenderBias = immediate * SIM_SYSTEMS_CONFIG.offseason.draft.contenderImmediateWeight;
      const rebuildBias = youth * SIM_SYSTEMS_CONFIG.offseason.draft.rebuildAgeWeight + dev * SIM_SYSTEMS_CONFIG.offseason.draft.rebuildDevWeight;
      const stageBias = team.profile.rebuildStage === "contender" ? contenderBias : team.profile.rebuildStage === "rebuild" ? rebuildBias : (contenderBias + rebuildBias) * 0.5;
      const score = need * SIM_SYSTEMS_CONFIG.offseason.draft.needWeight + stageBias + immediate * SIM_SYSTEMS_CONFIG.offseason.draft.schemeWeight;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.p);
}
