import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolveContact, type ContactInput } from "@/engine/physics/contactResolver";

const baseInput: ContactInput = {
  ballcarrier: { weightLb: 212, strength: 74, balance: 76, agility: 80, accel: 82, tackling: 25, heightIn: 72, jump: 78, fatigue01: 0.2 },
  tackler: { weightLb: 232, strength: 77, balance: 70, agility: 72, accel: 74, tackling: 79, heightIn: 74, jump: 72, fatigue01: 0.22 },
  move: { type: "JUKE", timing01: 0.62 },
  context: { angleDeg: 34, padLevelOff01: 0.55, padLevelDef01: 0.68, shortYardage: false, pile: false, surface: "DRY" },
};

describe("resolveContact", () => {
  it("is deterministic for fixed seed", () => {
    const out = resolveContact(baseInput, rng(12345, "contact-fixed"));
    expect(out).toMatchInlineSnapshot(`
      {
        "brokenTackle": true,
        "brokenType": "ARM",
        "debug": {
          "defMass": 249.06141511680002,
          "leverageDelta": 0.18383333333333335,
          "moveAdv": 0.3166814814814814,
          "offMass": 218.93487616,
          "tackleProb": 0.5946430592474075,
          "tackleRoll": 0.9272666852921247,
          "yacBase": 7.569082064678271,
        },
        "resultTags": [
          {
            "kind": "EXECUTION",
            "text": "ANGLE:inside",
          },
          {
            "kind": "MISMATCH",
            "text": "BROKEN_TACKLE:ARM",
          },
        ],
        "tackled": false,
        "yacYards": 8,
      }
    `);
  });

  it("higher tackler weight increases tackle rate", () => {
    let baseTackles = 0;
    let heavyTackles = 0;
    for (let i = 0; i < 500; i += 1) {
      const base = resolveContact(baseInput, rng(9100 + i, "contact-comp"));
      if (base.tackled) baseTackles += 1;
      const heavy = resolveContact({ ...baseInput, tackler: { ...baseInput.tackler, weightLb: baseInput.tackler.weightLb + 50 } }, rng(9100 + i, "contact-comp"));
      if (heavy.tackled) heavyTackles += 1;
    }
    expect(heavyTackles).toBeGreaterThan(baseTackles);
  });
});
