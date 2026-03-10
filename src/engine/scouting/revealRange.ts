const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export const DEFAULT_MAX_REVEAL_SPREAD = 40;

export function getDeterministicRevealRange(args: { trueScore: number; revealPct: number; maxSpread?: number }): [number, number] {
  const maxSpread = args.maxSpread ?? DEFAULT_MAX_REVEAL_SPREAD;
  const trueScore = clamp(Math.round(args.trueScore), 0, 100);
  const revealPct = clamp(args.revealPct, 0, 100);

  if (revealPct >= 100) return [trueScore, trueScore];

  const shownRangeWidth = (1 - revealPct / 100) * maxSpread;
  const half = shownRangeWidth / 2;

  const low = clamp(Math.round(trueScore - half), 0, 100);
  const high = clamp(Math.round(trueScore + half), 0, 100);
  return [Math.min(low, high), Math.max(low, high)];
}
