import { describe, expect, it } from "vitest";
import { decideTrade, deriveTeamContext, playerTradeValue } from "@/engine/tradeEngine";

describe("tradeEngine", () => {
  it("playerTradeValue respects age adjustment", () => {
    const young = playerTradeValue({ playerId: "A", name: "A", teamId: "T", overall: 80, age: 22 });
    const old = playerTradeValue({ playerId: "B", name: "B", teamId: "T", overall: 80, age: 35 });
    expect(young).toBeGreaterThan(old);
  });

  it("isPick skips age adjustment", () => {
    const pick = playerTradeValue({ playerId: "P", name: "Pick", teamId: "T", overall: 300, isPick: true });
    expect(pick).toBeGreaterThan(250);
  });

  it("decideTrade rejects light offer", () => {
    const result = decideTrade({
      season: 1,
      userTeamId: "A",
      partnerTeamId: "B",
      pkg: {
        outgoing: [{ playerId: "P1", name: "Star", teamId: "A", overall: 90, age: 25 }],
        incoming: [{ playerId: "P2", name: "Scrub", teamId: "B", overall: 55, age: 28 }],
      },
    });
    expect(result.accepted).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("decideTrade rejects duplicate elite QB", () => {
    const ctx = deriveTeamContext({ rosterByPos: { QB: 3 }, gmMode: "CONTEND" });
    const result = decideTrade({
      season: 1,
      userTeamId: "A",
      partnerTeamId: "B",
      teamContext: ctx,
      pkg: {
        outgoing: [{ playerId: "P1", name: "WR", teamId: "A", overall: 80, age: 25 }],
        incoming: [{ playerId: "QB1", name: "QB", teamId: "B", overall: 85, age: 27, pos: "QB" }],
      },
    });
    expect(result.accepted).toBe(false);
    expect(result.reasons.some((r) => r.includes("QB"))).toBe(true);
  });

  it("rebuild mode values picks more", () => {
    const rebuildCtx = deriveTeamContext({ gmMode: "REBUILD" });
    const contendCtx = deriveTeamContext({ gmMode: "CONTEND" });
    expect(rebuildCtx.futurePickWeight).toBeGreaterThan(contendCtx.futurePickWeight);
  });

  it("deriveTeamContext computes cap stress", () => {
    const ctx = deriveTeamContext({ capTotal: 200_000_000, capUsed: 190_000_000 });
    expect(ctx.capStress).toBeGreaterThan(0.9);
  });
});
