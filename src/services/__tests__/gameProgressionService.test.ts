import { describe, expect, it } from "vitest";
import {
  canAccessFreeAgency,
  canAccessReSign,
  canAccessTrades,
  getHubActionAvailability,
  getHubQuickLinkAvailability,
  resolveHubProgression,
  shouldShowCoordinatorHiring,
  type HubProgressionState,
} from "@/services/gameProgressionService";

function buildState(overrides: Partial<HubProgressionState & Record<string, unknown>> = {}): HubProgressionState & Record<string, unknown> {
  return {
    careerStage: "OFFSEASON_HUB",
    phase: "OFFSEASON_HUB",
    staff: {
      ocId: "OC1",
      dcId: "DC1",
      stcId: "ST1",
    },
    offseason: undefined,
    ...overrides,
  };
}

describe("gameProgressionService", () => {
  it("builds stage-specific hub progression labels", () => {
    expect(resolveHubProgression("FREE_AGENCY").advanceText).toBe("ADVANCE FA DAY");
    expect(resolveHubProgression("DRAFT").advanceText).toBe("ADVANCE PICK");
    expect(resolveHubProgression("REGULAR_SEASON").advanceText).toBe("ADVANCE WEEK");
  });

  it("determines coordinator hiring visibility from rostered coordinators + stage", () => {
    expect(
      shouldShowCoordinatorHiring(
        buildState({
          careerStage: "FREE_AGENCY",
          staff: { ocId: null, dcId: "DC1", stcId: "ST1" },
        }),
      ),
    ).toBe(true);

    expect(
      shouldShowCoordinatorHiring(
        buildState({
          careerStage: "PLAYOFFS",
          staff: { ocId: null, dcId: "DC1", stcId: "ST1" },
        }),
      ),
    ).toBe(false);
  });

  it("computes phase-gated availability for hub actions and quick links", () => {
    const freeAgencyState = buildState({
      careerStage: "FREE_AGENCY",
      phase: "PHASE_4_FREE_AGENCY",
      offseason: { stepId: "FREE_AGENCY" },
    });

    expect(getHubActionAvailability(freeAgencyState)).toEqual({
      showTrades: true,
      showReSign: false,
      showCoordinatorHiring: false,
    });

    expect(canAccessFreeAgency(freeAgencyState)).toBe(true);
    expect(canAccessTrades(freeAgencyState)).toBe(true);
    expect(canAccessReSign(freeAgencyState)).toBe(false);

    const reSignState = buildState({
      careerStage: "RESIGN",
      phase: "PHASE_2_RETENTION",
      offseason: { stepId: "RESIGNING" },
    });

    expect(getHubActionAvailability(reSignState).showReSign).toBe(true);
    expect(canAccessReSign(reSignState)).toBe(true);

    expect(getHubQuickLinkAvailability(freeAgencyState)).toEqual({
      freeAgency: true,
      reSign: false,
      trades: true,
    });
  });
});
