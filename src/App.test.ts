import { describe, expect, it } from "vitest";
import { shouldRouteRootToHub } from "@/App";

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
