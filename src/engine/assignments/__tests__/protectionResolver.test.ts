import { describe, expect, it } from "vitest";
import { resolveProtection } from "@/engine/assignments/protectionResolver";

describe("resolveProtection", () => {
  it("returns quick family defaults", () => {
    expect(resolveProtection("quick")).toEqual({ protectorsCount: 5, chipRoles: [], baseType: "quick", slideDirection: "none" });
  });

  it("returns dropback defaults with and without front id", () => {
    expect(resolveProtection("dropback")).toEqual({ protectorsCount: 6, chipRoles: ["RB"], baseType: "half-slide", slideDirection: "field" });
    expect(resolveProtection("dropback", { frontId: "odd" }).slideDirection).toBe("pressure");
  });

  it("returns deterministic shot defaults and max protect option", () => {
    expect(resolveProtection("shot")).toEqual({ protectorsCount: 6, chipRoles: ["RB"], baseType: "half-slide", slideDirection: "pressure" });
    expect(resolveProtection("shot", { maxProtect: true })).toEqual({ protectorsCount: 7, chipRoles: ["RB", "Y"], baseType: "max", slideDirection: "pressure" });
  });

  it("returns play-action and screen defaults", () => {
    expect(resolveProtection("play-action")).toEqual({ protectorsCount: 7, chipRoles: ["RB", "Y"], baseType: "play-action", slideDirection: "run-action" });
    expect(resolveProtection("screen")).toEqual({ protectorsCount: 5, chipRoles: [], baseType: "screen", slideDirection: "callside" });
  });
});
