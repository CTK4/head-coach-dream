import { describe, expect, it } from "vitest";
import { computeDevArrow, computeDevRisk } from "@/engine/devCalculators";

describe("computeDevArrow", () => {
  it("returns ↑ for young players (age ≤ 24) when potential equals 0", () => {
    expect(computeDevArrow({ age: 22, overall: 72, potential: 0 })).toBe("↑");
  });

  it("returns ↑ for young player with positive potential gap", () => {
    expect(computeDevArrow({ age: 23, overall: 72, potential: 80 })).toBe("↑");
  });

  it("returns → for mid-age player with small gap", () => {
    expect(computeDevArrow({ age: 27, overall: 78, potential: 80 })).toBe("→");
  });

  it("returns ↓ for old player (age ≥ 33)", () => {
    expect(computeDevArrow({ age: 35, overall: 80, potential: 0 })).toBe("↓");
  });

  it("returns ↓ for age-30+ elite player (age ≥ 30, ovr ≥ 85)", () => {
    expect(computeDevArrow({ age: 31, overall: 88, potential: 0 })).toBe("↓");
  });

  it("returns → for age-30 player with lower overall", () => {
    expect(computeDevArrow({ age: 30, overall: 72, potential: 0 })).toBe("→");
  });
});

describe("computeDevRisk", () => {
  it("returns LOW for young player (age < 30)", () => {
    expect(computeDevRisk({ age: 24 })).toBe("LOW");
  });

  it("returns MED for age 30–33", () => {
    expect(computeDevRisk({ age: 32 })).toBe("MED");
  });

  it("returns HIGH for age 34+", () => {
    expect(computeDevRisk({ age: 36 })).toBe("HIGH");
  });

  it("returns LOW for missing age", () => {
    expect(computeDevRisk({})).toBe("LOW");
  });
});
