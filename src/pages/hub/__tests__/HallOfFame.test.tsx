import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const getSeasonsMock = vi.fn();
const getTeamByIdMock = vi.fn();
const useGameMock = vi.fn();

vi.mock("@/engine/leagueHistory/loader", () => ({
  getSeasons: () => getSeasonsMock(),
}));

vi.mock("@/data/leagueDb", () => ({
  getTeamById: (teamId: string) => getTeamByIdMock(teamId),
}));

vi.mock("@/context/GameContext", () => ({
  useGame: () => useGameMock(),
}));

vi.mock("@/components/layout/ScreenHeader", () => ({
  ScreenHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, placeholder }: { value: string; placeholder?: string }) => <input aria-label={placeholder ?? "input"} value={value} readOnly />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, id }: { checked: boolean; id?: string }) => <input id={id} aria-label={id ?? "switch"} type="checkbox" checked={checked} readOnly />,
}));

import HallOfFame from "@/pages/hub/HallOfFame";

function sampleState() {
  return {
    acceptedOffer: undefined,
    userTeamId: "MIL",
    teamId: "MIL",
  };
}

function renderPage() {
  return renderToStaticMarkup(<HallOfFame />);
}

describe("HallOfFame history surfacing", () => {
  beforeEach(() => {
    getTeamByIdMock.mockReturnValue({ name: "Milwaukee Northshore" });
    useGameMock.mockReturnValue({ state: sampleState() });
    getSeasonsMock.mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("renders existing MVP history entries and never reverts to placeholder copy", () => {
    getSeasonsMock.mockReturnValue([
      {
        season: 2026,
        ironCrownMvp: { player: "A. Star", team: "Milwaukee Northshore", position: "QB" },
        regularSeasonMvp: { player: "B. Runner", team: "Atlanta Apex", position: "RB" },
      },
    ]);

    const html = renderPage();

    expect(html).toContain("MVP Hall of Fame");
    expect(html).toContain("A. Star");
    expect(html).toContain("B. Runner");
    expect(html).toContain("Season 2026");
    expect(html).not.toContain("Coming soon");
  });

  it("shows an intentional empty state when no MVP entries exist", () => {
    getSeasonsMock.mockReturnValue([
      { season: 2026, ironCrownMvp: null, regularSeasonMvp: null },
      { season: 2025, ironCrownMvp: null, regularSeasonMvp: null },
    ]);

    const html = renderPage();

    expect(html).toContain("0 MVP honorees found");
    expect(html).toContain("No MVP Hall of Fame entries are available for the current filters");
    expect(html).not.toContain("Coming soon");
  });

  it("keeps ordering deterministic (newest season first, then player) and deterministically excludes null entries", () => {
    getSeasonsMock.mockReturnValue([
      {
        season: 2025,
        ironCrownMvp: { player: "Zeta QB", team: "Milwaukee Northshore", position: "QB" },
        regularSeasonMvp: { player: "Alpha WR", team: "Atlanta Apex", position: "WR" },
      },
      {
        season: 2027,
        ironCrownMvp: { player: "Beta LB", team: "Milwaukee Northshore", position: "LB" },
        regularSeasonMvp: null,
      },
    ]);

    const unfilteredHtml = renderPage();
    expect(unfilteredHtml.indexOf("Beta LB")).toBeLessThan(unfilteredHtml.indexOf("Alpha WR"));
    expect(unfilteredHtml.indexOf("Alpha WR")).toBeLessThan(unfilteredHtml.indexOf("Zeta QB"));

    expect(unfilteredHtml).toContain("3 MVP honorees found");
  });
});
