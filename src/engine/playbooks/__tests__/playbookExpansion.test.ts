import { describe, expect, it } from "vitest";
import { getPlaybookPlaysExpanded } from "@/engine/playbooks/getPlaybookPlaysExpanded";

describe("getPlaybookPlaysExpanded", () => {
  it("returns plays for air-raid-playbook", () => {
    const plays = getPlaybookPlaysExpanded("air-raid-playbook");
    expect(plays.length).toBeGreaterThan(0);
  });

  it("returns only plays with route/run/block geometry", () => {
    const plays = getPlaybookPlaysExpanded("air-raid-playbook");
    plays.forEach((play) => {
      expect(play.diagram.paths.length).toBeGreaterThan(0);
    });
  });
});
