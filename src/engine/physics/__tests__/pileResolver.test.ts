import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolvePile } from "@/engine/physics/pileResolver";
import { resolveContact, type ContactInput } from "@/engine/physics/contactResolver";

const baseContact: ContactInput = {
  ballcarrier: { weightLb: 220, strength: 78, balance: 74, agility: 72, accel: 74, tackling: 20, heightIn: 71, jump: 72, fatigue01: 0.2 },
  tackler: { weightLb: 236, strength: 80, balance: 70, agility: 70, accel: 72, tackling: 80, heightIn: 74, jump: 72, fatigue01: 0.2 },
  move: { type: "NONE", timing01: 0.5 },
  context: { angleDeg: 25, padLevelOff01: 0.58, padLevelDef01: 0.72, shortYardage: false, pile: false, surface: "DRY" },
};

describe("resolvePile", () => {
  it("is deterministic", () => {
    const input = { offense: { OL_pushZ: 0.45, RB_massEff: 220, RB_balanceZ: 0.4 }, defense: { DL_anchorZ: 0.52, boxCount: 8, LB_fillZ: 0.56 }, context: { yardsToGo: 1, goalLine: false, surface: "DRY" as const, fatigue: 0.2 } };
    expect(resolvePile(input, rng(555, "pile"))).toEqual(resolvePile(input, rng(555, "pile")));
  });

  it("short-yardage pile reduces variance and caps yac", () => {
    const pileYs: number[] = [];
    const openYs: number[] = [];
    for (let i = 0; i < 400; i += 1) {
      pileYs.push(resolvePile({ offense: { OL_pushZ: 0.45, RB_massEff: 220, RB_balanceZ: 0.4 }, defense: { DL_anchorZ: 0.52, boxCount: 8, LB_fillZ: 0.56 }, context: { yardsToGo: 1, goalLine: false, surface: "DRY", fatigue: 0.2 } }, rng(8000 + i, "pile")).yardsGained);
      openYs.push(resolveContact(baseContact, rng(8000 + i, "open")).yacYards);
    }
    const range = (vals: number[]) => Math.max(...vals) - Math.min(...vals);
    expect(range(pileYs)).toBeLessThan(range(openYs));
    expect(Math.max(...pileYs)).toBeLessThanOrEqual(3);
  });
});
