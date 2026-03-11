import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const dispatchMock = vi.fn();
const useGameMock = vi.fn();
const getEffectivePlayersByTeamMock = vi.fn();
const getContractSummaryForPlayerMock = vi.fn();

vi.mock("@/context/GameContext", () => ({
  useGame: () => useGameMock(),
}));

vi.mock("@/lib/userTeam", () => ({
  getUserTeamId: () => "TEAM_1",
}));

vi.mock("@/engine/rosterOverlay", () => ({
  getEffectivePlayersByTeam: (...args: any[]) => getEffectivePlayersByTeamMock(...args),
  getContractSummaryForPlayer: (...args: any[]) => getContractSummaryForPlayerMock(...args),
}));

import Resigning from "@/pages/hub/offseason/Resigning";

describe("Resigning", () => {
  it("shows only players with expiring contracts", () => {
    const players = [
      { playerId: "P1", name: "Expiring One", pos: "QB", age: 27, overall: 90 },
      { playerId: "P2", name: "Expiring Two", pos: "WR", age: 25, overall: 84 },
      { playerId: "P3", name: "Non Expiring A", pos: "TE", age: 26, overall: 83 },
      { playerId: "P4", name: "Non Expiring B", pos: "CB", age: 24, overall: 80 },
      { playerId: "P5", name: "Non Expiring C", pos: "LB", age: 28, overall: 78 },
    ];

    getEffectivePlayersByTeamMock.mockReturnValue(players);
    getContractSummaryForPlayerMock.mockImplementation((_state: any, playerId: string) => {
      if (playerId === "P1") return { yearsRemaining: 1, apy: 10_000_000 };
      if (playerId === "P2") return { yearsRemaining: 1, apy: 8_000_000 };
      return { yearsRemaining: 2, apy: 6_000_000 };
    });

    useGameMock.mockReturnValue({
      state: {
        season: 2027,
        acceptedOffer: { teamId: "TEAM_1" },
        offseasonData: { resigning: { decisions: {} } },
        offseason: { stepsComplete: { RESIGNING: false } },
      },
      dispatch: dispatchMock,
    });

    const html = renderToStaticMarkup(<Resigning />);

    expect(html).toContain("Expiring One");
    expect(html).toContain("Expiring Two");
    expect(html).not.toContain("Non Expiring A");
    expect(html).not.toContain("Non Expiring B");
    expect(html).not.toContain("Non Expiring C");
  });
});
