import { describe, expect, it } from "vitest";
import { getTeamStrategicProfile, applyStrategyToDraftScore, applyStrategyToFaOffer } from "@/engine/strategyEngine";

describe("strategyEngine", () => {
  it("REBUILD has higher pickValueMultiplier than CONTEND", () => {
    const rebuild = getTeamStrategicProfile("REBUILD");
    const contend = getTeamStrategicProfile("CONTEND");
    expect(rebuild.pickValueMultiplier).toBeGreaterThan(contend.pickValueMultiplier);
  });

  it("CONTEND has higher immediateStarterWeight than REBUILD", () => {
    const rebuild = getTeamStrategicProfile("REBUILD");
    const contend = getTeamStrategicProfile("CONTEND");
    expect(contend.immediateStarterWeight).toBeGreaterThan(rebuild.immediateStarterWeight);
  });

  it("RELOAD is balanced between REBUILD and CONTEND", () => {
    const reload = getTeamStrategicProfile("RELOAD");
    expect(reload.pickValueMultiplier).toBe(1.0);
    expect(reload.immediateStarterWeight).toBe(1.0);
  });

  it("applyStrategyToDraftScore boosts picks in REBUILD mode", () => {
    const rebuildProfile = getTeamStrategicProfile("REBUILD");
    const reloadProfile = getTeamStrategicProfile("RELOAD");
    const rebuildScore = applyStrategyToDraftScore(100, 22, 75, true, rebuildProfile);
    const reloadScore = applyStrategyToDraftScore(100, 22, 75, true, reloadProfile);
    expect(rebuildScore).toBeGreaterThan(reloadScore);
  });

  it("applyStrategyToFaOffer reduces vet pay in REBUILD", () => {
    const rebuildProfile = getTeamStrategicProfile("REBUILD");
    const contendProfile = getTeamStrategicProfile("CONTEND");
    const rebuildApy = applyStrategyToFaOffer(10_000_000, 32, 82, rebuildProfile);
    const contendApy = applyStrategyToFaOffer(10_000_000, 32, 82, contendProfile);
    expect(rebuildApy).toBeLessThan(contendApy);
  });
});
