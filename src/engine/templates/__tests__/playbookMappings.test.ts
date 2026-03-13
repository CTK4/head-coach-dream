import { describe, expect, it } from "vitest";
import {
  inferDefenseTemplateIdFromName,
  inferOffenseTemplateIdFromName,
  mapDefenseCallNameToTemplateId,
  mapOffensePlayNameToTemplateId,
} from "@/engine/templates/playbookMappings";

describe("playbookMappings normalization", () => {
  it("maps normalized offense names to templates", () => {
    expect(mapOffensePlayNameToTemplateId("  Four-Verts!!! ", "PASS")).toBe("P1");
    expect(mapOffensePlayNameToTemplateId("Inside   Zone", "RUN")).toBe("R1");
    expect(mapOffensePlayNameToTemplateId("PLAY-ACTION BOOT", "PLAY_ACTION")).toBe("PA3");
    expect(mapOffensePlayNameToTemplateId("Power", "RUN")).toBe("R3");
    expect(mapOffensePlayNameToTemplateId("RPO Read", "RPO")).toBe("R7");
    expect(mapOffensePlayNameToTemplateId("Counter Trey", "RUN")).toBe("R4");
    expect(mapOffensePlayNameToTemplateId("Speed Option", "RUN")).toBe("R8");
  });

  it("maps normalized defense names to templates", () => {
    expect(mapDefenseCallNameToTemplateId("Cover 1")).toBe("D1");
    expect(mapDefenseCallNameToTemplateId("Cover 1 Man-Free")).toBe("D1");
    expect(mapDefenseCallNameToTemplateId("Drop-8 Spy")).toBe("D10");
    expect(mapDefenseCallNameToTemplateId("Quarters Match")).toBe("D8");
  });

  it("always returns deterministic inference defaults for unknown names", () => {
    expect(inferOffenseTemplateIdFromName("mystery concept", "RUN")).toBe("R1");
    expect(inferDefenseTemplateIdFromName("mystery call")).toBe("D5");
  });
});
