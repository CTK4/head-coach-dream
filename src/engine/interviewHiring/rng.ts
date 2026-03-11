import { mulberry32 } from "../rng";

export class XorShift32 {
  private rng: () => number;

  constructor(seed: number) {
    this.rng = mulberry32((seed >>> 0) || 0x9e3779b9);
  }

  nextUint32(): number {
    return (this.rng() * 0x100000000) >>> 0;
  }

  nextFloat01(): number {
    return this.rng();
  }
}
