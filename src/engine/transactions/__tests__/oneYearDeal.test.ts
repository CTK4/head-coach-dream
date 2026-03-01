import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { applyResign, proposeResign } from "@/engine/transactions/transactionAPI";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], lastTxId: 0 } };
}

describe("one year deal", () => {
  it("persists in contract index", () => {
    const p = getPlayers().find((x) => String(x.teamId ?? "").toUpperCase() !== "FREE_AGENT")!;
    const proposed = proposeResign(mkState(), String(p.teamId), String(p.playerId), { startSeason: 2025, endSeason: 2025, salaries: [2_000_000], signingBonus: 0 });
    expect(proposed.ok).toBe(true);
    const next = applyResign(mkState(), (proposed as any).txDraft);
    expect(buildContractIndex(next)[String(p.playerId)].endSeason).toBe(2025);
  });
});
