export type RngFn = () => number;

export function mulberry32(seed: number): RngFn {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(...parts: Array<string | number>): number {
  let h = 2166136261 >>> 0;
  const input = parts.map(String).join("|");
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function rF(rng: RngFn, min = 0, max = 1): number {
  return min + (max - min) * rng();
}

export function rI(rng: RngFn, min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return low + Math.floor(rng() * (high - low + 1));
}

export function rPick<T>(rng: RngFn, items: readonly T[]): T {
  if (items.length === 0) throw new Error("rPick requires a non-empty array.");
  return items[rI(rng, 0, items.length - 1)];
}

export function rShuffle<T>(rng: RngFn, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = rI(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
