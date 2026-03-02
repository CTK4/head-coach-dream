export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(...parts: Array<string | number>): number {
  let hash = 2166136261;
  for (const part of parts) {
    const value = String(part);
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }
  return hash >>> 0;
}

export function createPhaseSeed(saveSeed: number, teamId: string, phase: string): number {
  return hashSeed(saveSeed, teamId, phase);
}

export function shuffleDeterministic<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function rng(seed: number, contextKey = ""): () => number {
  const contextualSeed = contextKey.length > 0 ? hashSeed(seed, contextKey) : seed;
  return mulberry32(contextualSeed);
}
