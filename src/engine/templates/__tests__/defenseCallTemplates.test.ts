import { describe, expect, it } from "vitest";
import { getDefenseTemplate } from "@/engine/templates/defenseCallTemplates";

describe("defenseCallTemplates responsibility mapping", () => {
  it("returns man family mapping", () => {
    const d1 = getDefenseTemplate("D1");
    expect(d1.coverageFamily).toBe("Cover1");
    expect(d1.responsibleDefenderByRole).toMatchObject({ X: "CB1", Z: "CB2", H: "NB", Y: "SS", RB: "LB1" });
  });

  it("returns cover3 proxy mapping", () => {
    const d5 = getDefenseTemplate("D5");
    expect(d5.coverageFamily).toBe("Cover3");
    expect(d5.responsibleDefenderByRole).toMatchObject({ X: "CB1", Z: "CB2", H: "NB", Y: "LB2", RB: "LB1" });
  });

  it("returns quarters mapping", () => {
    const d7 = getDefenseTemplate("D7");
    expect(d7.coverageFamily).toBe("Cover4");
    expect(d7.responsibleDefenderByRole).toMatchObject({ X: "CB1", Z: "CB2", H: "SS", Y: "LB2", RB: "LB1" });
  });
});
