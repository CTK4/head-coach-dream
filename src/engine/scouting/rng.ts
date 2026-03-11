import { mulberry32 } from "../rng";

export { mulberry32 };

export { mulberry32, hashStr };

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
