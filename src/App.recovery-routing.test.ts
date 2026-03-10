import { beforeAll, describe, expect, it } from "vitest";

let shouldRenderRecoveryMode: (state: { recoveryNeeded?: boolean }) => boolean;
let shouldRouteRootToHub: (state: any) => boolean;

beforeAll(async () => {
  (globalThis as any).DEV_TOOLS_ENABLED = false;
  const app = await import("@/App");
  shouldRenderRecoveryMode = app.shouldRenderRecoveryMode;
  shouldRouteRootToHub = app.shouldRouteRootToHub;
});

describe("shouldRenderRecoveryMode", () => {
  it("returns true when recoveryNeeded is true", () => {
    expect(shouldRenderRecoveryMode({ recoveryNeeded: true })).toBe(true);
  });

  it("returns false when recoveryNeeded is false or missing", () => {
    expect(shouldRenderRecoveryMode({ recoveryNeeded: false })).toBe(false);
    expect(shouldRenderRecoveryMode({ recoveryNeeded: undefined })).toBe(false);
  });

  it("keeps recovery mode active even when state is otherwise hub-routable", () => {
    const state = {
      phase: "HUB",
      coach: { name: "Coach" },
      careerStage: "REGULAR_SEASON",
      acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" },
      recoveryNeeded: true,
    } as any;

    expect(shouldRouteRootToHub(state)).toBe(true);
    expect(shouldRenderRecoveryMode(state)).toBe(true);
  });
});
