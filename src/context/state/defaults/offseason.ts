import type { GameState } from "@/context/GameContext";
import type { OffseasonStepId } from "@/engine/offseason";

export function createInitialOffseasonState(stepId: OffseasonStepId): GameState["offseason"] {
  return {
    stepId,
    completed: { SCOUTING: false, INSTALL: false, MEDIA: false, STAFF: false },
    stepsComplete: {},
  };
}

export function createInitialOffseasonDataState(): GameState["offseasonData"] {
  return {
    resigning: { decisions: {} },
    tagCenter: { applied: undefined },
    rosterAudit: { cutDesignations: {} },
    combine: { prospects: [], results: {}, generated: false, resultsByProspectId: {}, interviewPoolIds: [], lastRunSeed: 0, shortlist: {} },
    scouting: {
      windowId: "COMBINE",
      budget: { total: 0, spent: 0, remaining: 0, carryIn: 0 },
      carryover: 0,
      intelByProspectId: {},
      intelByFAId: {},
    },
    tampering: { offers: [] },
    freeAgency: {
      offers: [],
      signings: [],
      rejected: {},
      withdrawn: {},
      capTotal: 82_000_000,
      capUsed: 54_000_000,
      capHitsByPlayerId: {},
      decisionReasonByPlayerId: {},
    },
    preDraft: { board: [], visits: {}, workouts: {}, reveals: {}, viewMode: "CONSENSUS", intelByProspectId: {} },
    draft: { board: [], picks: [], completed: false },
    camp: { settings: { intensity: "NORMAL", installFocus: "BALANCED", positionFocus: "NONE" } },
    cutDowns: { decisions: {} },
  };
}
