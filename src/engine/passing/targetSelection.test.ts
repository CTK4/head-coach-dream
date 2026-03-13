import { describe, expect, it } from "vitest";
import { chooseTargetRole } from "@/engine/passing/targetSelection";

describe("chooseTargetRole", () => {
  it("uses progression when primary is covered and time allows", () => {
    const out = chooseTargetRole({
      reads: { primary: "X", progression: ["Y", "RB"] },
      qb: { footballIq: 85, vision: 84, awareness: 83, focus: 82, poise: 84, pocketPresence: 83, release: 82 },
      openScoreByRole: { X: -0.4, Y: 0.5, RB: 0.2 },
      timeToPressureMs: 2200,
    });
    expect(out.chosenRole).toBe("Y");
    expect(out.progressionIndexUsed).toBe(1);
  });

  it("stays on primary when pressure closes quickly", () => {
    const out = chooseTargetRole({
      reads: { primary: "X", progression: ["Y", "RB"] },
      qb: { footballIq: 70, vision: 70, awareness: 70, focus: 70, poise: 70, pocketPresence: 70, release: 70 },
      openScoreByRole: { X: -0.2, Y: 0.8, RB: 0.8 },
      timeToPressureMs: 180,
    });
    expect(out.chosenRole).toBe("X");
  });
});
