import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const useGameMock = vi.fn();

vi.mock("@/context/GameContext", () => ({
  useGame: () => useGameMock(),
}));

vi.mock("@/pages/hub/FreeAgency", () => ({
  default: () => <div>FA_SCREEN</div>,
}));

vi.mock("@/pages/hub/ResignPlayers", () => ({ default: () => <div>RESIGN_SCREEN</div> }));
vi.mock("@/pages/hub/TradeHub", () => ({ default: () => <div>TRADE_SCREEN</div> }));
vi.mock("@/components/layout/ScreenHeader", () => ({ ScreenHeader: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/components/ui/input", () => ({ Input: () => <input readOnly /> }));
vi.mock("@/components/ui/badge", () => ({ Badge: ({ children }: any) => <span>{children}</span> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children }: any) => <button>{children}</button> }));
vi.mock("@/data/leagueDb", () => ({ getPlayers: () => [] }));
vi.mock("@/engine/rosterOverlay", () => ({ getEffectiveFreeAgents: () => [] }));
vi.mock("@/engine/phaseUtils", () => ({
  getUnifiedPhase: () => "REGULAR_SEASON",
  isInFranchiseActionWindow: () => false,
}));

import { FreeAgencyRoutes } from "@/pages/hub/PhaseSubsystemRoutes";

function renderRoute() {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={["/free-agency/top"]}>
      <Routes>
        <Route path="/free-agency/*" element={<FreeAgencyRoutes />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PhaseSubsystemRoutes free-agency routing", () => {
  it("allows free-agency route when offseason step is FREE_AGENCY even if unified phase is stale", () => {
    useGameMock.mockReturnValue({
      state: { phase: "HUB", offseason: { stepId: "FREE_AGENCY", stepsComplete: {} }, careerStage: "OFFSEASON_HUB", freeAgency: { signingsByPlayerId: {} }, transactions: [] },
      dispatch: vi.fn(),
    });

    const html = renderRoute();
    expect(html).toContain("FA_SCREEN");
  });
});
