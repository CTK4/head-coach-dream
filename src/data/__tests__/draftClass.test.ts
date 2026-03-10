import { describe, expect, it } from "vitest";
import { doesProspectExist, getProspectById } from "@/data/draftClass";
import remapData from "@/data/migrations/draftClassIdRemap_v1.json";

describe("draftClass selectors", () => {
  it("getProspectById resolves the current mapped id", () => {
    const [, newId] = Object.entries(remapData.remap)[0];
    const prospect = getProspectById(newId);
    expect(prospect).toBeTruthy();
    expect(doesProspectExist(newId)).toBe(true);
  });
});
