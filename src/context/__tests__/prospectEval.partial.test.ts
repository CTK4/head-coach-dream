import { describe, expect, it } from "vitest";
import { createInitialStateForTests, getUserProspectEval } from "@/context/GameContext";
import { evalProspectForGm, valueToRoundBand } from "@/engine/prospectEval";
import { getGmTraits } from "@/engine/gmScouting";
import type { Prospect } from "@/engine/offseasonData";

const prospect: Prospect = {
  id: "P_TEST",
  name: "Eval Prospect",
  pos: "QB",
  archetype: "Prospect",
  grade: 82,
  ras: 76,
  interview: 71,
};

describe("getUserProspectEval partial uncertainty", () => {
  it("applies mechanical uncertainty penalties for PARTIAL input", () => {
    const state = createInitialStateForTests();
    const full = getUserProspectEval(state, prospect, { completeness: "FULL", bandPenalty: 0, confidencePenalty: 0 });
    const partial = getUserProspectEval(state, prospect, {
      completeness: "PARTIAL",
      missingSignals: ["INTERVIEW"],
      bandPenalty: 1,
      confidencePenalty: 0.4,
    });

    expect(partial.sigma).toBeGreaterThan(full.sigma);
    expect(partial.roundBand).toBe(valueToRoundBand(partial.value));
  });

  it("does not change output when options are omitted", () => {
    const state = createInitialStateForTests();
    const base = getUserProspectEval(state, prospect);
    const explicitFull = getUserProspectEval(state, prospect, { completeness: "FULL", bandPenalty: 0, confidencePenalty: 0 });
    expect(explicitFull.roundBand).toBe(base.roundBand);
    expect(explicitFull.sigma).toBe(base.sigma);
  });

  it("passes uncertainty into evaluator path", () => {
    const state = createInitialStateForTests();
    const gm = getGmTraits(state.league.gmByTeamId[String(state.userTeamId ?? state.teamId ?? "")] ?? "");
    const full = evalProspectForGm({ prospect, gm, seedRand: () => 0.42, spentPoints: 20, teamNeedAtPos01: 0.4, uncertainty: { completeness: "FULL", confidencePenalty: 0, bandPenalty: 0 } });
    const partial = evalProspectForGm({ prospect, gm, seedRand: () => 0.42, spentPoints: 20, teamNeedAtPos01: 0.4, uncertainty: { completeness: "PARTIAL", missingSignals: ["INTERVIEW"], confidencePenalty: 0.5, bandPenalty: 1 } });
    expect(partial.sigma).toBeGreaterThan(full.sigma);
    expect(partial.roundBand).toBe(valueToRoundBand(partial.value));
  });
});
