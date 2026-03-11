export function topPercentileFromAscendingRank(rank: number, total: number): number {
  if (total <= 1) return 100;
  return Math.round(((total - 1 - rank) / (total - 1)) * 100);
}

export function athleticTierFromTopPercentile(topPercentile: number): string {
  if (topPercentile >= 90) return "Elite";
  if (topPercentile >= 85) return "Top 15%";
  if (topPercentile >= 60) return "Above Avg";
  if (topPercentile >= 40) return "Average";
  return "Below Avg";
}

function ordinalSuffix(value: number): string {
  const v = Math.abs(value) % 100;
  if (v >= 11 && v <= 13) return "th";
  const last = v % 10;
  if (last === 1) return "st";
  if (last === 2) return "nd";
  if (last === 3) return "rd";
  return "th";
}

export function topPercentDisplay(topPercentile: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(topPercentile)));
  return `${clamped}${ordinalSuffix(clamped)} percentile`;
}
