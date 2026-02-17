export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function buyoutTotal(salary: number, remainingYears: number, buyoutPct = 0.6): number {
  const y = Math.max(0, remainingYears);
  return Math.round(salary * y * clamp01(buyoutPct));
}

export function splitBuyout(total: number, seasons: number): number[] {
  const n = Math.max(1, Math.min(4, Math.floor(seasons)));
  const base = Math.floor(total / n);
  const out = Array(n).fill(base);
  const rem = total - base * n;
  for (let i = 0; i < rem; i++) out[i % n] += 1;
  return out;
}
