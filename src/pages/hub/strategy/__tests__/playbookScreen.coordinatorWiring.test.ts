import { describe, expect, it, vi } from "vitest";
import * as leagueDb from "@/data/leagueDb";
import { findCoordinatorSystem } from "@/pages/hub/strategy/PlaybookScreen";

describe("PlaybookScreen coordinator wiring", () => {
  it("uses staff.ocId personnel scheme + name when present", () => {
    vi.spyOn(leagueDb, "getPersonnelById").mockReturnValue({
      personId: "oc-air-raid",
      fullName: "Mike Leach",
      scheme: "AIR_RAID",
    } as leagueDb.PersonnelRow);

    const coordinator = findCoordinatorSystem({ staff: { ocId: "oc-air-raid" } }, "OFFENSE");

    expect(coordinator.systemRaw).toBe("AIR_RAID");
    expect(coordinator.coachName).toBe("Mike Leach");
  });
});
