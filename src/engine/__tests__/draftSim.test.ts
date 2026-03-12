import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock leagueDB.json with a minimal draft order for season 2026.
// We create 5 slots: picks 1-4 for CPU teams, pick 5 for the USER team.
// ---------------------------------------------------------------------------
vi.mock("@/data/leagueDB.json", () => ({
  default: {
    DraftOrder: [
      { season: 2026, round: 1, pick: 1, teamId: "CPU_A" },
      { season: 2026, round: 1, pick: 2, teamId: "CPU_B" },
      { season: 2026, round: 1, pick: 3, teamId: "CPU_C" },
      { season: 2026, round: 1, pick: 4, teamId: "CPU_D" },
      { season: 2026, round: 1, pick: 5, teamId: "USER_TEAM" },
    ],
    DraftPicks: [],
    Personnel: [
      // Give each CPU team a GM so getGmTraitsByTeam can find one
      { personId: "GM_A", teamId: "CPU_A", role: "GENERAL_MANAGER" },
      { personId: "GM_B", teamId: "CPU_B", role: "GENERAL_MANAGER" },
      { personId: "GM_C", teamId: "CPU_C", role: "GENERAL_MANAGER" },
      { personId: "GM_D", teamId: "CPU_D", role: "GENERAL_MANAGER" },
    ],
  },
}));

// ---------------------------------------------------------------------------
// Mock draftClass.json with a small deterministic prospect pool.
// ---------------------------------------------------------------------------
vi.mock("@/data/draftClass.json", () => ({
  default: [
    { "Player ID": 1, Rank: 1, Name: "Alpha QB", POS: "QB", College: "State U", DraftTier: "1", Age: 22, "40": 4.8 },
    { "Player ID": 2, Rank: 2, Name: "Bravo WR", POS: "WR", College: "State U", DraftTier: "1", Age: 22, "40": 4.4 },
    { "Player ID": 3, Rank: 3, Name: "Charlie RB", POS: "RB", College: "State U", DraftTier: "2", Age: 21, "40": 4.5 },
    { "Player ID": 4, Rank: 4, Name: "Delta CB", POS: "CB", College: "State U", DraftTier: "2", Age: 23, "40": 4.45 },
    { "Player ID": 5, Rank: 5, Name: "Echo LB",  POS: "LB", College: "State U", DraftTier: "2", Age: 24, "40": 4.65 },
    { "Player ID": 6, Rank: 6, Name: "Foxtrot EDGE", POS: "DE", College: "State U", DraftTier: "3", Age: 22, "40": 4.6 },
    { "Player ID": 7, Rank: 7, Name: "Golf OT", POS: "OT", College: "State U", DraftTier: "3", Age: 23, "40": 5.1 },
    { "Player ID": 8, Rank: 8, Name: "Hotel S",  POS: "SS", College: "State U", DraftTier: "3", Age: 22, "40": 4.55 },
  ],
}));

// Mock gmScouting with a fixed neutral GM profile
vi.mock("@/engine/gmScouting", () => ({
  getGmTraits: vi.fn(() => ({
    analytics_orientation: 50,
    film_process: 50,
    intel_network: 50,
    urgency_bias: 50,
    bias_star: 50,
    bias_athleticism: 50,
    bias_trenches: 50,
    bias_defense: 50,
    bias_value: 50,
    discipline: 50,
    aggression: 50,
  })),
}));

import {
  initDraftSim,
  getDraftClass,
  pickCpuProspect,
  cpuAdvanceUntilUser,
  applySelection,
  type DraftSimState,
  type Prospect,
} from "@/engine/draftSim";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEASON = 2026;
const USER_TEAM = "USER_TEAM";
const SAVE_SEED_A = 42;
const SAVE_SEED_B = 99;

function makeInitialSim(seed = SAVE_SEED_A): DraftSimState {
  return initDraftSim({ saveSeed: seed, season: SEASON, userTeamId: USER_TEAM });
}

function runCpuUntilUser(seed: number, sim: DraftSimState, prospects: Prospect[]) {
  return cpuAdvanceUntilUser({
    saveSeed: seed,
    state: sim,
    prospects,
    rosterCountsByTeamBucket: {},
    draftedCountsByTeamBucket: {},
  });
}

// ---------------------------------------------------------------------------
// initDraftSim — initial state shape
// ---------------------------------------------------------------------------

describe("initDraftSim", () => {
  it("starts with cursor = 0", () => {
    const sim = makeInitialSim();
    expect(sim.cursor).toBe(0);
  });

  it("starts with complete = false", () => {
    const sim = makeInitialSim();
    expect(sim.complete).toBe(false);
  });

  it("starts with empty selections", () => {
    const sim = makeInitialSim();
    expect(sim.selections).toHaveLength(0);
  });

  it("starts with empty takenProspectIds", () => {
    const sim = makeInitialSim();
    expect(Object.keys(sim.takenProspectIds)).toHaveLength(0);
  });

  it("loads slots from DraftOrder for the given season", () => {
    const sim = makeInitialSim();
    // Our mock has 5 picks for season 2026
    expect(sim.slots.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// cpuAdvanceUntilUser — seed determinism
// ---------------------------------------------------------------------------

describe("cpuAdvanceUntilUser — seed determinism", () => {
  it("same seed → identical selections array (strict determinism)", () => {
    const prospects = getDraftClass();
    const sim = makeInitialSim(SAVE_SEED_A);

    const result1 = runCpuUntilUser(SAVE_SEED_A, sim, prospects);
    const result2 = runCpuUntilUser(SAVE_SEED_A, makeInitialSim(SAVE_SEED_A), prospects);

    expect(result1.sim.selections.map((s) => s.prospectId))
      .toEqual(result2.sim.selections.map((s) => s.prospectId));
  });

  it("same seed → same cursor position after advancing", () => {
    const prospects = getDraftClass();
    const result1 = runCpuUntilUser(SAVE_SEED_A, makeInitialSim(SAVE_SEED_A), prospects);
    const result2 = runCpuUntilUser(SAVE_SEED_A, makeInitialSim(SAVE_SEED_A), prospects);
    expect(result1.sim.cursor).toBe(result2.sim.cursor);
  });

  it("different seeds → different pick selections (probabilistic divergence)", () => {
    const prospects = getDraftClass();
    const resultA = runCpuUntilUser(SAVE_SEED_A, makeInitialSim(SAVE_SEED_A), prospects);
    const resultB = runCpuUntilUser(SAVE_SEED_B, makeInitialSim(SAVE_SEED_B), prospects);

    const picksA = resultA.sim.selections.map((s) => s.prospectId).join(",");
    const picksB = resultB.sim.selections.map((s) => s.prospectId).join(",");

    // With 8 prospects and 4 CPU picks, different seeds should produce different orderings
    // (the probability of identical picks across different seeds is extremely low)
    expect(picksA).not.toBe(picksB);
  });

  it("CPU stops before user pick slot", () => {
    const prospects = getDraftClass();
    const sim = makeInitialSim(SAVE_SEED_A);
    const result = runCpuUntilUser(SAVE_SEED_A, sim, prospects);

    // The cursor should be pointing at the user's pick or beyond
    const cursorSlot = result.sim.slots[result.sim.cursor];
    if (cursorSlot) {
      expect(cursorSlot.teamId).toBe(USER_TEAM);
    }
  });

  it("CPU makes picks for each CPU slot before the user pick", () => {
    const prospects = getDraftClass();
    const sim = makeInitialSim(SAVE_SEED_A);
    const result = runCpuUntilUser(SAVE_SEED_A, sim, prospects);

    // Our mock has 4 CPU slots before the user pick
    expect(result.sim.selections.length).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// pickCpuProspect — determinism
// ---------------------------------------------------------------------------

describe("pickCpuProspect — seed determinism", () => {
  it("same team + same seed + same pool → same pick every time", () => {
    const prospects = getDraftClass();

    const pick1 = pickCpuProspect({
      saveSeed: SAVE_SEED_A,
      season: SEASON,
      teamId: "CPU_A",
      prospects,
      takenProspectIds: {},
      rosterCountsByBucket: {},
      draftedCountsByBucket: {},
    });

    const pick2 = pickCpuProspect({
      saveSeed: SAVE_SEED_A,
      season: SEASON,
      teamId: "CPU_A",
      prospects,
      takenProspectIds: {},
      rosterCountsByBucket: {},
      draftedCountsByBucket: {},
    });

    expect(pick1).not.toBeNull();
    expect(pick2).not.toBeNull();
    expect(pick1!.prospectId).toBe(pick2!.prospectId);
  });

  it("returns null when all prospects are taken", () => {
    const prospects = getDraftClass();
    const takenProspectIds = Object.fromEntries(prospects.map((p) => [p.prospectId, true as const]));

    const pick = pickCpuProspect({
      saveSeed: SAVE_SEED_A,
      season: SEASON,
      teamId: "CPU_A",
      prospects,
      takenProspectIds,
      rosterCountsByBucket: {},
      draftedCountsByBucket: {},
    });

    expect(pick).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Draft completion via applySelection
// ---------------------------------------------------------------------------

describe("draft completion", () => {
  it("marks draft complete after all slots are filled", () => {
    const prospects = getDraftClass();
    const sim = makeInitialSim(SAVE_SEED_A);
    const { sim: advanced } = runCpuUntilUser(SAVE_SEED_A, sim, prospects);

    // Simulate user pick at the user pick slot
    const userSlot = advanced.slots[advanced.cursor];
    const remaining = prospects.filter((p) => !advanced.takenProspectIds[p.prospectId]);
    if (userSlot && remaining.length > 0) {
      const finalSim = applySelection(advanced, userSlot, remaining[0]);
      expect(finalSim.complete).toBe(true);
    }
  });
});
