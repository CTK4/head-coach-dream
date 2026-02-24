import { describe, expect, it } from "vitest";
import { evaluateContractOffer } from "@/engine/contracts/offerDecision";

const baseParams = {
  player: { id: "P1", age: 27, overall: 84, position: "WR" },
  offer: { years: 3, aav: 10_500_000 },
  context: { saveSeed: 12345, season: 2028, week: 2, teamId: "T1", phase: "RESIGN" as const },
  interest: 55,
};

describe("evaluateContractOffer", () => {
  it("is deterministic for same seed and inputs", () => {
    const a = evaluateContractOffer(baseParams);
    const b = evaluateContractOffer(baseParams);
    expect(a).toEqual(b);
  });

  it("rejects low offers frequently", () => {
    let accepts = 0;
    for (let i = 0; i < 20; i++) {
      const result = evaluateContractOffer({
        ...baseParams,
        context: { ...baseParams.context, saveSeed: 1000 + i },
        offer: { years: 3, aav: 6_000_000 },
        interest: 50,
      });
      if (result.accepted) accepts += 1;
    }
    expect(accepts).toBeLessThanOrEqual(1);
  });

  it("accepts strong offers frequently", () => {
    const probe = evaluateContractOffer({ ...baseParams, offer: { years: 3, aav: 10_000_000 }, interest: 55 });
    const strongAav = Math.round(probe.askAav * 1.1);
    let accepts = 0;
    for (let i = 0; i < 20; i++) {
      const result = evaluateContractOffer({
        ...baseParams,
        context: { ...baseParams.context, saveSeed: 2000 + i },
        offer: { years: 3, aav: strongAav },
        interest: 55,
      });
      if (result.accepted) accepts += 1;
    }
    expect(accepts).toBeGreaterThanOrEqual(16);
  });

  it("interest 30 rejects more often than interest 80 for same offer", () => {
    const probe = evaluateContractOffer({ ...baseParams, interest: 55, offer: { years: 3, aav: 10_000_000 } });
    const fairAav = Math.round(probe.askAav * 1.08);
    let lowInterestAccepts = 0;
    let highInterestAccepts = 0;
    for (let i = 0; i < 20; i++) {
      const context = { ...baseParams.context, saveSeed: 3000 + i };
      const low = evaluateContractOffer({ ...baseParams, context, interest: 30, offer: { years: 3, aav: fairAav } });
      const high = evaluateContractOffer({ ...baseParams, context, interest: 80, offer: { years: 3, aav: fairAav } });
      if (low.accepted) lowInterestAccepts += 1;
      if (high.accepted) highInterestAccepts += 1;
    }
    expect(highInterestAccepts).toBeGreaterThan(lowInterestAccepts);
  });

  it("interest increases acceptance score on identical deal", () => {
    const context = { ...baseParams.context, saveSeed: 3333 };
    const low = evaluateContractOffer({ ...baseParams, context, interest: 30, offer: { years: 3, aav: 11_000_000 } });
    const high = evaluateContractOffer({ ...baseParams, context, interest: 80, offer: { years: 3, aav: 11_000_000 } });
    expect(high.acceptanceScore).toBeGreaterThan(low.acceptanceScore);
  });

  it("rejection lowers team-specific interest", () => {
    const out = evaluateContractOffer({ ...baseParams, interest: 60, offer: { years: 3, aav: 7_000_000 }, rejectionCount: 2 });
    expect(out.accepted).toBe(false);
    expect(out.interestAfter).toBeLessThan(out.interestBefore);
  });

  it("improved follow-up partially recovers interest", () => {
    const out = evaluateContractOffer({
      ...baseParams,
      interest: 50,
      offer: { years: 3, aav: 8_800_000 },
      priorOfferAav: 7_500_000,
      rejectionCount: 2,
    });
    expect(out.interestAfter).toBeLessThan(out.interestBefore);
    expect(out.interestAfter).toBeGreaterThanOrEqual(37);
  });
});
