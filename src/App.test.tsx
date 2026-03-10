import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DevPanelMount, isDevPanelEnabled, shouldRouteRootToHub } from "@/App";

describe("shouldRouteRootToHub", () => {
  it("routes to hub when phase is HUB and userTeamId is present", () => {
    expect(
      shouldRouteRootToHub({
        phase: "HUB",
        coach: { name: "Coach Test" },
        careerStage: "REGULAR_SEASON",
        userTeamId: "MILWAUKEE_NORTHSHORE",
      } as any),
    ).toBe(true);
  });

  it("does not route to hub when team identity is missing", () => {
    expect(
      shouldRouteRootToHub({
        phase: "HUB",
        coach: { name: "Coach Test" },
        careerStage: "REGULAR_SEASON",
      } as any),
    ).toBe(false);
  });
});

describe("dev tools gating", () => {
  const PanelMock = () => <button>DEV</button>;

  it("keeps dev panel disabled in production by default", () => {
    const markup = renderToStaticMarkup(
      <DevPanelMount env={{ DEV: false, VITE_ENABLE_QA_TOOLS: undefined }} PanelComponent={PanelMock} />,
    );

    expect(markup).not.toContain("DEV");
    expect(isDevPanelEnabled({ DEV: false, VITE_ENABLE_QA_TOOLS: undefined })).toBe(false);
  });

  it("allows explicit QA override", () => {
    expect(isDevPanelEnabled({ DEV: false, VITE_ENABLE_QA_TOOLS: "true" })).toBe(true);
  });
});
