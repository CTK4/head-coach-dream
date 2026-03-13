import { describe, expect, it } from "vitest";
import { mapDefenseCallNameToTemplateId } from "@/engine/templates/playbookMappings";
import { getDefenseTemplate } from "@/engine/templates/defenseCallTemplates";

describe("defense mapping semantic family integrity", () => {
  it("maps Cover 0 to a Cover0-family template", () => {
    const id = mapDefenseCallNameToTemplateId("Cover 0");
    expect(getDefenseTemplate(id).coverageFamily).toBe("Cover0");
  });

  it("maps 2 Man to a 2Man-family template", () => {
    const id = mapDefenseCallNameToTemplateId("2 Man");
    expect(getDefenseTemplate(id).coverageFamily).toBe("2Man");
  });

  it("maps Drop 8 to a Drop8-family template", () => {
    const id = mapDefenseCallNameToTemplateId("Drop 8");
    expect(getDefenseTemplate(id).coverageFamily).toBe("Drop8");
  });
});
