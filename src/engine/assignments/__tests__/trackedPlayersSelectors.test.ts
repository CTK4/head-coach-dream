import { describe, expect, it } from "vitest";
import { getDefenseRoleId, getOffenseEligibleId, getOLId } from "@/engine/assignments/trackedPlayersSelectors";

describe("trackedPlayersSelectors", () => {
  it("uses role-specific ids when present", () => {
    const tracked = { WR1: "WR_A", WR2: "WR_B", WR3: "WR_C", TE1: "TE_A", LT1: "LT_A", EDGE_L: "EDGE_A", NB: "NB_A" };
    const notes: string[] = [];
    expect(getOffenseEligibleId(tracked, "X", notes).id).toBe("WR_A");
    expect(getOffenseEligibleId(tracked, "Z", notes).id).toBe("WR_B");
    expect(getOffenseEligibleId(tracked, "H", notes).id).toBe("WR_C");
    expect(getOLId(tracked, "LT", notes).id).toBe("LT_A");
    expect(getDefenseRoleId(tracked, "EDGE_L", notes).id).toBe("EDGE_A");
    expect(getDefenseRoleId(tracked, "NB", notes).id).toBe("NB_A");
    expect(notes).toEqual([]);
  });

  it("falls back to legacy buckets deterministically and records notes", () => {
    const tracked = { WR: "WR_LEG", OL: "OL_LEG", DL: "DL_LEG", LB: "LB_LEG", DB: "DB_LEG" };
    const notes: string[] = [];
    expect(getOffenseEligibleId(tracked, "X", notes).id).toBe("WR_LEG");
    expect(getOLId(tracked, "C", notes).id).toBe("OL_LEG");
    expect(getDefenseRoleId(tracked, "DT1", notes).id).toBe("DL_LEG");
    expect(notes.length).toBeGreaterThan(0);
  });
});
