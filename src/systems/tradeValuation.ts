import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

export type TradeValuePlayer = {
  overall?: number;
  age?: number;
  devTrait?: string;
  capHit?: number;
  yearsRemaining?: number;
  deadCap?: number;
  isRookieContract?: boolean;
  isPick?: boolean;
};

export type TradeValueContext = {
  teamStage?: "contender" | "competitive" | "retool" | "rebuild";
  positionalNeed?: number;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function devBoost(devTrait?: string): number {
  const t = String(devTrait ?? "").toUpperCase();
  if (t.includes("SUPER") || t.includes("X")) return 1.2;
  if (t.includes("STAR")) return 1.1;
  return 1;
}

export function calculateTradeValue(player: TradeValuePlayer, teamContext: TradeValueContext = {}): number {
  if (player.isPick) return Math.round(320 * (1 + (teamContext.teamStage === "rebuild" ? 0.18 : -0.04)));

  const base = Number(player.overall ?? 65) * 10;
  const age = Number(player.age ?? 26);
  const ageDeclineYears = Math.max(0, age - SIM_SYSTEMS_CONFIG.trade.ageDeclineStart);
  const ageMultiplier = 1 - ageDeclineYears * SIM_SYSTEMS_CONFIG.trade.ageDeclinePerYear;

  const capHit = Number(player.capHit ?? 0);
  const deadCap = Number(player.deadCap ?? 0);
  const yearsRemaining = Math.max(1, Number(player.yearsRemaining ?? 1));
  const capPenalty = ((capHit * SIM_SYSTEMS_CONFIG.trade.capHitPenaltyFactor + deadCap * SIM_SYSTEMS_CONFIG.trade.deadCapPenaltyFactor) / 1_000_000) / yearsRemaining;

  const rookieBonus = player.isRookieContract ? SIM_SYSTEMS_CONFIG.trade.rookieContractBonus : 0;
  const stageAdj = teamContext.teamStage === "contender"
    ? Math.max(0, (30 - age) / 30) * SIM_SYSTEMS_CONFIG.trade.contenderPrimeAgeBonus
    : teamContext.teamStage === "rebuild"
      ? Math.max(0, (27 - age) / 27) * SIM_SYSTEMS_CONFIG.trade.rebuildYouthBonus
      : 0;

  const needAdj = clamp01(teamContext.positionalNeed ?? 0.5) * 0.16;
  const total = base * Math.max(0.55, ageMultiplier) * devBoost(player.devTrait) * (1 + rookieBonus + stageAdj + needAdj) - capPenalty;
  return Math.round(Math.max(20, total));
}
