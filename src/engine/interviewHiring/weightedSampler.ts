import { XorShift32 } from "./rng";

export function weightedNoReplacement<T>(
  items: T[],
  weightFn: (item: T) => number,
  count: number,
  rng: XorShift32,
): T[] {
  const pool = [...items];
  const out: T[] = [];
  const target = Math.min(count, pool.length);

  while (out.length < target && pool.length > 0) {
    const weights = pool.map((item) => Math.max(0, weightFn(item)));
    const total = weights.reduce((sum, value) => sum + value, 0);

    let idx = 0;
    if (total <= 0) {
      idx = Math.floor(rng.nextFloat01() * pool.length);
    } else {
      const r = rng.nextFloat01() * total;
      let cumulative = 0;
      for (let i = 0; i < pool.length; i += 1) {
        cumulative += weights[i];
        if (r <= cumulative) {
          idx = i;
          break;
        }
      }
    }

    out.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return out;
}
