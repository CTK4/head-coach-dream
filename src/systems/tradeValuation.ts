import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";
import { getDevTraitValuationMultiplier } from "@/lib/devTrait";

export type TradeValuePlayer = {
  overall?: number;
  age?: number;
  devTrait?: string;
  capHit?: number;
  yearsRemaining?: number;
  deadCap?: number;
  isRookieContract?: boolean;
  /**
   * Draft pick fields. When `isPick` is true, `pickRound` (1-7) and
   * `pickNumber` (1-32) are used to compute value. Missing round defaults to
   * round 4 (mid-tier comp pick). Missing number defaults to mid-round (16).
   */
  isPick?: boolean;
  pickRound?: number;
  pickNumber?: number;
};

export type TradeValueContext = {
  teamStage?: "contender" | "competitive" | "retool" | "rebuild";
  positionalNeed?: number;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Pick value curve:
 * - Base value comes from SIM_SYSTEMS_CONFIG.pickRoundBaseValues (indexed by round-1).
 * - Within a round, picks 1-4 receive a +15% premium; picks 29-32 receive a -10% discount.
 * - A rebuild-stage bias shifts the final value by ±8% to model how a team's
 *   philosophy affects pick demand.
 */
function calculatePickValue(round: number, pickNumber: number, teamStage?: string): number {
  const roundIdx = Math.max(0, Math.min(6, (round ?? 4) - 1));
  const base = SIM_SYSTEMS_CONFIG.pickRoundBaseValues[roundIdx] ?? 40;

  // Within-round position modifier: top picks > middle > late
  const num = Math.max(1, Math.min(32, pickNumber ?? 16));
  const positionModifier = num <= 4 ? 1.15 : num >= 29 ? 0.90 : 1.0;

  const stageBias =
    teamStage === "rebuild"   ? 1.10 :  // rebuilding teams prize future assets
    teamStage === "contender" ? 0.94 :  // win-now teams discount picks for veterans
    1.0;

  return Math.round(base * positionModifier * stageBias);
}

export function calculateTradeValue(player: TradeValuePlayer, teamContext: TradeValueContext = {}): number {
  if (player.isPick) {
    return calculatePickValue(
      player.pickRound ?? 4,
      player.pickNumber ?? 16,
      teamContext.teamStage,
    );
  }

  const base = Number(player.overall ?? 65) * 10;
  const age = Number(player.age ?? 26);
  const ageDeclineYears = Math.max(0, age - SIM_SYSTEMS_CONFIG.trade.ageDeclineStart);
  const ageMultiplier = 1 - ageDeclineYears * SIM_SYSTEMS_CONFIG.trade.ageDeclinePerYear;

  const capHit = Number(player.capHit ?? 0);
  const deadCap = Number(player.deadCap ?? 0);
  const yearsRemaining = Math.max(1, Number(player.yearsRemaining ?? 1));
  const capPenalty =
    ((capHit * SIM_SYSTEMS_CONFIG.trade.capHitPenaltyFactor +
      deadCap * SIM_SYSTEMS_CONFIG.trade.deadCapPenaltyFactor) /
      1_000_000) /
    yearsRemaining;

  const rookieBonus = player.isRookieContract ? SIM_SYSTEMS_CONFIG.trade.rookieContractBonus : 0;
  const stageAdj =
    teamContext.teamStage === "contender"
      ? Math.max(0, (30 - age) / 30) * SIM_SYSTEMS_CONFIG.trade.contenderPrimeAgeBonus
      : teamContext.teamStage === "rebuild"
      ? Math.max(0, (27 - age) / 27) * SIM_SYSTEMS_CONFIG.trade.rebuildYouthBonus
      : 0;

  const needAdj = clamp01(teamContext.positionalNeed ?? 0.5) * 0.16;
  const total =
    base *
    Math.max(0.55, ageMultiplier) *
    getDevTraitValuationMultiplier(player.devTrait) *
    (1 + rookieBonus + stageAdj + needAdj) -
    capPenalty;

  return Math.round(Math.max(20, total));
}
