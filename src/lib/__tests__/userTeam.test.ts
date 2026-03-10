import { describe, expect, it } from "vitest";
import { getUserTeamId } from "@/lib/userTeam";

function makeState(overrides: Record<string, unknown>) {
  return {
    userTeamId: undefined,
    acceptedOffer: undefined,
    teamId: undefined,
    staffRoster: undefined,
    ...overrides,
  } as any;
}

describe("getUserTeamId", () => {
  it("returns userTeamId when present", () => {
    const state = makeState({ userTeamId: "ATLANTA_APEX", acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" } });
    expect(getUserTeamId(state)).toBe("ATLANTA_APEX");
  });

  it("falls back to acceptedOffer.teamId", () => {
    const state = makeState({ acceptedOffer: { teamId: "MILWAUKEE_NORTHSHORE" } });
    expect(getUserTeamId(state)).toBe("MILWAUKEE_NORTHSHORE");
  });

  it("falls back to legacy teamId", () => {
    const state = makeState({ teamId: "BIRMINGHAM_VULCANS" });
    expect(getUserTeamId(state)).toBe("BIRMINGHAM_VULCANS");
  });

  it("falls back to staffRoster.teamId", () => {
    const state = makeState({ staffRoster: { teamId: "ATLANTA_APEX" } });
    expect(getUserTeamId(state)).toBe("ATLANTA_APEX");
  });

  it("returns null when no team id shape is present", () => {
    expect(getUserTeamId(makeState({}))).toBeNull();
  });
});
