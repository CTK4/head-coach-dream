import { describe, expect, it } from "vitest";
import offenseInventory from "@/engine/templates/_inventory.offense.json";
import defenseInventory from "@/engine/templates/_inventory.defense.json";
import coverageReport from "@/engine/templates/_coverageReport.md?raw";
import { mapDefenseCallNameToTemplateId, mapOffensePlayNameToTemplateId } from "@/engine/templates/playbookMappings";

describe("template coverage inventory", () => {
  it("resolves every offense inventory entry", () => {
    for (const item of offenseInventory) {
      const hint = item.playType === "RUN" || item.playType === "RPO"
        ? "RUN"
        : item.playType === "PA"
          ? "PLAY_ACTION"
          : item.playType === "SCREEN"
            ? "SCREEN"
            : "PASS";
      const resolved = mapOffensePlayNameToTemplateId(item.name ?? item.id, hint);
      expect(resolved).toMatch(/^(R\d+|P\d+|PA\d+|S\d+)$/);
    }
  });

  it("resolves every defense inventory entry", () => {
    for (const item of defenseInventory) {
      const resolved = mapDefenseCallNameToTemplateId(item.name ?? item.id, item.tags ?? []);
      expect(resolved).toMatch(/^D\d+$/);
    }
  });

  it("coverage report counts remain deterministic", () => {
    expect(coverageReport).toMatchSnapshot();
  });
});
