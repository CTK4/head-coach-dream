import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const dispatchMock = vi.fn();
const useGameMock = vi.fn();

vi.mock("@/context/GameContext", () => ({
  useGame: () => useGameMock(),
}));

vi.mock("@/engine/rosterOverlay", () => ({
  getEffectiveFreeAgents: () => [{ playerId: "P1", fullName: "Player One", pos: "QB", age: 26, overall: 80 }],
}));

vi.mock("@/engine/marketModel", () => ({
  projectedMarketApy: () => 5_000_000,
}));

import FreeAgency from "@/pages/hub/FreeAgency";

function baseState() {
  return {
    finances: { capSpace: 10_000_000 },
    freeAgency: {
      status: "ready",
      initStatus: "ready",
      error: undefined,
      boardPlayerIds: ["P1"],
      marketApyByPlayerId: { P1: { years: 3, apy: 5_000_000 } },
      draftByPlayerId: {},
      offersByPlayerId: {},
      signingsByPlayerId: {},
    },
  } as any;
}

describe("FreeAgency UI", () => {
  it("renders board from state only", () => {
    useGameMock.mockReturnValue({ state: baseState(), dispatch: dispatchMock });
    const html = renderToStaticMarkup(<FreeAgency />);
    expect(html).toContain("FREE AGENCY");
    expect(html).toContain("Player One");
  });

  it("has no mount-time init dispatches", () => {
    dispatchMock.mockReset();
    useGameMock.mockReturnValue({ state: baseState(), dispatch: dispatchMock });
    renderToStaticMarkup(<FreeAgency />);
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.objectContaining({ type: "INIT_FREE_AGENCY_MARKET" }));
    expect(dispatchMock).not.toHaveBeenCalledWith(expect.objectContaining({ type: "FA_ENTER_MARKET" }));
  });

  it("shows submit and advance controls", () => {
    useGameMock.mockReturnValue({ state: baseState(), dispatch: dispatchMock });
    const html = renderToStaticMarkup(<FreeAgency />);
    expect(html).toContain("Advance Market");
    expect(html).toContain("Complete Free Agency");
    expect(html).toContain("Offer Drawer");
  });
});
