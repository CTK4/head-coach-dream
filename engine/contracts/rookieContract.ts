export type RookieContract = {
  years: number;
  aav: number;
  totalValue: number;
  signingBonus: number;
  guaranteed: number;
  capHitsByYear: number[];
  hasFifthYearOption: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function buildRookieContract(params: { overallPick: number; round: number; pickInRound: number; year: number }): RookieContract {
  const N = 224;
  const t = clamp((params.overallPick - 1) / (N - 1), 0, 1);
  const years = 4;
  const totalValue = Math.round(lerp(38_000_000, 3_500_000, t ** 0.72) / 10_000) * 10_000;
  const bonusShare = lerp(0.55, 0.18, t);
  const signingBonus = Math.round(totalValue * bonusShare);
  const guaranteeShare = lerp(0.35, 0.08, t);
  const guaranteed = Math.round(Math.min(totalValue, signingBonus + totalValue * guaranteeShare));
  const aav = Math.round(totalValue / years);

  const prorated = signingBonus / years;
  const baseSalaryTotal = totalValue - signingBonus;
  const weights = [0.2, 0.23, 0.27, 0.3];
  const capHitsByYear = weights.map((w) => Math.round(baseSalaryTotal * w + prorated));

  return {
    years,
    aav,
    totalValue,
    signingBonus,
    guaranteed,
    capHitsByYear,
    hasFifthYearOption: params.round === 1,
  };
}
