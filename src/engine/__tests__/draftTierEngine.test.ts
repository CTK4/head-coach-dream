import { describe, expect, it } from "vitest";
import { computeEffectiveGrade, clusterIntoTiers } from "@/engine/draftTierEngine";
import type { Prospect } from "@/engine/offseasonData";

function mkProspect(id: string, grade: number, sigma = 5): Prospect {
  return { id, name: `Player ${id}`, pos: "WR", archetype: "Speed", grade, ras: 60, interview: 60, sigma };
}

const gmTraits = { film_process: 50 };

describe("draftTierEngine", () => {
  it("computeEffectiveGrade is deterministic", () => {
    const p = mkProspect("P1", 85);
    const a = computeEffectiveGrade(p, gmTraits, 42);
    const b = computeEffectiveGrade(p, gmTraits, 42);
    expect(a).toBe(b);
  });

  it("computeEffectiveGrade uses scoutedGrade when available", () => {
    const p: Prospect = { ...mkProspect("P2", 90), scoutedGrade: 75 };
    const g = computeEffectiveGrade(p, gmTraits, 1);
    // Result should be near 75, not near 90
    expect(Math.abs(g - 75)).toBeLessThan(25);
  });

  it("clusterIntoTiers assigns tier 1 to top prospect", () => {
    const prospects = [
      mkProspect("A", 95),
      mkProspect("B", 88),
      mkProspect("C", 70),
      mkProspect("D", 60),
    ];
    const tiered = clusterIntoTiers(prospects, gmTraits, 7);
    const top = tiered[0];
    expect(top.tier).toBe(1);
  });

  it("clusterIntoTiers uses max 5 tiers", () => {
    const prospects = Array.from({ length: 10 }, (_, i) =>
      mkProspect(`P${i}`, 95 - i * 8),
    );
    const tiered = clusterIntoTiers(prospects, gmTraits, 99);
    const maxTier = Math.max(...tiered.map((p) => p.tier));
    expect(maxTier).toBeLessThanOrEqual(5);
  });

  it("tierConfidence decreases with higher sigma", () => {
    const lowSigma = mkProspect("L", 80, 2);
    const highSigma = mkProspect("H", 80, 8);
    const [tL] = clusterIntoTiers([lowSigma], gmTraits, 1);
    const [tH] = clusterIntoTiers([highSigma], gmTraits, 1);
    expect(tL.tierConfidence).toBeGreaterThan(tH.tierConfidence);
  });
});
