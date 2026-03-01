import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay } from "@/engine/gameSim";

describe("dual threat branching", () => {
  it("branches on discipline deterministically", () => {
    const simBase = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 1234,
      homeRatings: { qbProcessing: 75, olPassBlock: 58, wrSeparation: 75, rbBurst: 72, dlPassRush: 60, runStop: 70, dbCoverage: 70, blitzImpact: 70 },
      awayRatings: { qbProcessing: 70, olPassBlock: 70, wrSeparation: 70, rbBurst: 70, dlPassRush: 85, runStop: 80, dbCoverage: 78, blitzImpact: 82 },
      trackedPlayers: { HOME: { QB: "QB_HIGH" }, AWAY: {} },
    });
    const hi = stepPlay({ ...simBase }, "DROPBACK");
    expect(hi.sim.lastResultTags?.some((t) => t.text.includes("QB_SCRAMBLE")) || hi.sim.lastResultTags?.some((t) => t.text.includes("SNAP_KEY"))).toBeTruthy();
  });
});
