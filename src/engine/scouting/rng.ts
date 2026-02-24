export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function detRand(saveSeed: number, key: string) {
  const r = mulberry32((saveSeed ^ hashStr(key)) >>> 0);
  return r();
}

export function detRandN(saveSeed: number, key: string, n: number) {
  const r = mulberry32((saveSeed ^ hashStr(key)) >>> 0);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(r());
  return out;
}
