import { describe, expect, it } from "vitest";
import remapData from "@/data/migrations/draftClassIdRemap_v1.json";
import { doesProspectExist } from "@/data/draftClass";
import { migrateDraftClassIdsInSave } from "@/lib/migrations/migrateDraftClassIds";

describe("migrateDraftClassIdsInSave", () => {
  it("remaps old prospect ids, filters unknown ids, and rebuilds maps", () => {
    const entries = Object.entries(remapData.remap);
    expect(entries.length).toBeGreaterThan(2);
    const [[oldA, newA], [oldB, newB]] = entries;

    const migrated = migrateDraftClassIdsInSave({
      scoutingState: {
        myBoardOrder: [oldA, oldB, "missing-legacy-id"],
        scoutProfiles: { [oldA]: { prospectId: oldA }, [oldB]: { prospectId: oldB }, "missing-legacy-id": { prospectId: "missing-legacy-id" } },
        combine: { resultsByProspectId: { [oldA]: { forty: 4.4 }, "missing-legacy-id": { forty: 4.8 } } },
        interviews: { history: { [oldB]: [{ category: "IQ", outcome: "ok", windowKey: "x" }] } },
      },
      offseasonData: {
        scouting: { intelByProspectId: { [oldA]: { notes: "hello" }, "missing-legacy-id": { notes: "bad" } } },
      },
    } as any);

    expect(migrated.scoutingState?.myBoardOrder).toEqual([newA, newB]);
    expect(Object.keys(migrated.scoutingState?.scoutProfiles ?? {})).toEqual([newA, newB]);
    expect(Object.keys(migrated.scoutingState?.combine?.resultsByProspectId ?? {})).toEqual([newA]);
    expect(Object.keys(migrated.offseasonData?.scouting?.intelByProspectId ?? {})).toEqual([newA]);
    expect(doesProspectExist(newA)).toBe(true);
    expect(doesProspectExist(newB)).toBe(true);
  });
});
