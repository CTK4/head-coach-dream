import { describe, expect, it } from "vitest";
import { resolveRushMatchups } from "@/engine/assignments/rushAssignmentResolver";

describe("resolveRushMatchups", () => {
  it("returns structured blocker role arrays for even rush", () => {
    const out = resolveRushMatchups("D1", "NICKEL");
    expect(out.matchups[2]).toEqual({ rusherRole: "DT1", blockerRoles: ["LG", "C"] });
    expect(out.matchups[3]).toEqual({ rusherRole: "DT2", blockerRoles: ["RG", "C"] });
  });

  it("adds protection-side note for pressure add-on", () => {
    const out = resolveRushMatchups("D6", "NICKEL");
    expect(out.matchups.some((m) => m.note === "protection side")).toBe(true);
  });
});
