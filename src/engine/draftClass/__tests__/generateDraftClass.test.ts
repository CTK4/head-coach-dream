import { describe, expect, it } from "vitest";
import { generateDraftClass } from "@/engine/draftClass/generateDraftClass";

describe("generateDraftClass", () => {
  it("is deterministic for same inputs", () => {
    const a = generateDraftClass({ year: 2027, count: 224, leagueSeed: 1234, saveSlotId: 2 });
    const b = generateDraftClass({ year: 2027, count: 224, leagueSeed: 1234, saveSlotId: 2 });
    expect(a).toEqual(b);
  });

  it("changes for different years", () => {
    const a = generateDraftClass({ year: 2027, count: 224, leagueSeed: 1234, saveSlotId: 2 });
    const b = generateDraftClass({ year: 2028, count: 224, leagueSeed: 1234, saveSlotId: 2 });
    expect(a).not.toEqual(b);
  });

  it("creates unique prospect ids", () => {
    const cls = generateDraftClass({ year: 2027, count: 224, leagueSeed: 1234, saveSlotId: 2 });
    const ids = new Set(cls.map((p) => p.prospectId));
    expect(ids.size).toBe(cls.length);
  });
});
