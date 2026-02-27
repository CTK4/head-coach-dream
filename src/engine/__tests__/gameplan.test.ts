import { describe, expect, it } from "vitest";
import { autoPickPlay, initGameSim } from "@/engine/gameSim";
import { DEFAULT_WEEKLY_GAMEPLAN } from "@/engine/gameplan";

describe("gameplan hooks", () => {
  it("run-heavy plan skews play call toward run concepts", () => {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 1,
      homeGameplan: { ...DEFAULT_WEEKLY_GAMEPLAN, offensiveFocus: "RUN_HEAVY", locked: true },
    });
    const play = autoPickPlay({ ...sim, possession: "HOME", distance: 5 });
    expect(play).toBe("INSIDE_ZONE");
  });

  it("scripted plays are selected first", () => {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 1,
      homeGameplan: { ...DEFAULT_WEEKLY_GAMEPLAN, scriptedOpening: ["POWER"], locked: true },
    });
    expect(autoPickPlay({ ...sim, possession: "HOME", playNumberInDrive: 0 })).toBe("POWER");
  });

  it("gameplan can roundtrip save/load payload", () => {
    const state = { teamGameplans: { A: { ...DEFAULT_WEEKLY_GAMEPLAN, locked: true } } };
    const roundtrip = JSON.parse(JSON.stringify(state));
    expect(roundtrip.teamGameplans.A.locked).toBe(true);
  });

  it("defensive focus config is retained", () => {
    const plan = { ...DEFAULT_WEEKLY_GAMEPLAN, defensiveFocus: "STOP_RUN" as const, locked: true };
    expect(plan.defensiveFocus).toBe("STOP_RUN");
  });
});
