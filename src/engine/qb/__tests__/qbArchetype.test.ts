import { describe, expect, it } from "vitest";
import { resolveQbArchetypeTag } from "@/engine/qb/qbArchetype";

describe("resolveQbArchetypeTag", () => {
  it("tags Lamar-like profile as dual threat", () => {
    expect(resolveQbArchetypeTag({ playerId: "1", fullName: "L", pos: "QB", speed: 92, acceleration: 92, elusiveness: 90, readSpeed: 84, accuracyShort: 80, accuracyMid: 76, accuracyDeep: 70, decisionSpeed: 76, pocketPresence: 72 } as any)).toBe("DUAL_THREAT");
  });

  it("tags Vick-like profile as scrambler or improviser", () => {
    const tag = resolveQbArchetypeTag({ playerId: "2", fullName: "V", pos: "QB", speed: 97, acceleration: 95, elusiveness: 96, readSpeed: 78, accuracyShort: 72, accuracyMid: 68, accuracyDeep: 74, decisionSpeed: 66, pocketPresence: 60, armOnRunAccuracy: 84 } as any);
    expect(["SCRAMBLER", "IMPROVISER"]).toContain(tag);
  });

  it("tags pocket QB", () => {
    expect(resolveQbArchetypeTag({ playerId: "3", fullName: "P", pos: "QB", speed: 58, acceleration: 56, elusiveness: 55, readSpeed: 72, accuracyShort: 84, accuracyMid: 82, accuracyDeep: 78, decisionSpeed: 86, pocketPresence: 88 } as any)).toBe("GAME_MANAGER");
  });
});
