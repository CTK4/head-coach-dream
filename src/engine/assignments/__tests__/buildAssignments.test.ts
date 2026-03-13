import { describe, expect, it } from "vitest";
import { buildAssignments } from "@/engine/assignments/buildAssignments";
import { initGameSim, type GameSim } from "@/engine/gameSim";

function makeSim(): GameSim {
  return initGameSim({
    homeTeamId: "A",
    awayTeamId: "B",
    seed: 7,
    trackedPlayers: {
      HOME: {
        QB1: "HOME_QB1", RB1: "HOME_RB1", WR1: "HOME_WR1", WR2: "HOME_WR2", WR3: "HOME_WR3", TE1: "HOME_TE1",
        LT1: "HOME_LT1", LG1: "HOME_LG1", C1: "HOME_C1", RG1: "HOME_RG1", RT1: "HOME_RT1",
      },
      AWAY: {
        CB1: "AWAY_CB1", CB2: "AWAY_CB2", NB: "AWAY_NB", FS: "AWAY_FS", SS: "AWAY_SS", LB1: "AWAY_LB1", LB2: "AWAY_LB2",
        EDGE_L: "AWAY_EDGE_L", EDGE_R: "AWAY_EDGE_R", DT1: "AWAY_DT1", DT2: "AWAY_DT2",
      },
    },
  });
}

describe("buildAssignments", () => {
  it("resolves distinct offense/defense role ids when role-specific tracked players exist", () => {
    const sim = makeSim();
    const out = buildAssignments(sim, {
      playType: "DROPBACK",
      personnelPackage: "11",
      defensivePackage: "Nickel",
      defensiveCall: { kind: "SHELL", shell: "COVER_3", press: false },
    });

    expect(out.offense.eligible.X).toBe("HOME_WR1");
    expect(out.offense.eligible.Z).toBe("HOME_WR2");
    expect(out.offense.eligible.H).toBe("HOME_WR3");
    expect(out.offense.ol.LT).toBe("HOME_LT1");
    expect(out.offense.ol.RT).toBe("HOME_RT1");
    expect(out.log.rushMatchups[0]?.rusherId).toBe("AWAY_EDGE_L");
    expect(out.log.rushMatchups[0]?.blockerIds[0]).toBe("HOME_LT1");
  });

  it("maps responsible defenders by target role for MAN when SS is present", () => {
    const sim = makeSim();
    const out = buildAssignments(sim, {
      playType: "DROPBACK",
      personnelPackage: "11",
      defensivePackage: "Nickel",
      defensiveCall: { kind: "SHELL", shell: "MAN", press: true },
    });
    expect(out.defense.responsibleDefenderByRole.RB).toBe("AWAY_LB1");
    expect(out.defense.responsibleDefenderByRole.H).toBe("AWAY_NB");
    expect(out.defense.responsibleDefenderByRole.Y).toBe("AWAY_SS");
  });

  it("falls back to LB2 for Y in MAN when SS is unavailable and records note", () => {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 7,
      trackedPlayers: {
        HOME: {
          QB1: "HOME_QB1", RB1: "HOME_RB1", WR1: "HOME_WR1", WR2: "HOME_WR2", WR3: "HOME_WR3", TE1: "HOME_TE1",
          LT1: "HOME_LT1", LG1: "HOME_LG1", C1: "HOME_C1", RG1: "HOME_RG1", RT1: "HOME_RT1",
        },
        AWAY: {
          // DB roles fall back to legacy LB bucket when SS is missing.
          CB1: "AWAY_CB1", CB2: "AWAY_CB2", NB: "AWAY_NB", FS: "AWAY_FS", LB: "AWAY_LB2", LB1: "AWAY_LB1", LB2: "AWAY_LB2",
          EDGE_L: "AWAY_EDGE_L", EDGE_R: "AWAY_EDGE_R", DT1: "AWAY_DT1", DT2: "AWAY_DT2",
        },
      },
    });

    const out = buildAssignments(sim, {
      playType: "DROPBACK",
      personnelPackage: "11",
      defensivePackage: "Nickel",
      defensiveCall: { kind: "SHELL", shell: "MAN", press: true },
    });

    expect(out.defense.responsibleDefenderByRole.Y).toBe("AWAY_LB2");
    expect(out.log.notes).toContain("defense-fallback:SS");
  });

  it("is deterministic for same seed/state", () => {
    const simA = makeSim();
    const simB = makeSim();
    const args = {
      playType: "QUICK_GAME" as const,
      personnelPackage: "11" as const,
      defensivePackage: "Nickel" as const,
      defensiveCall: { kind: "PRESSURE", pressure: "SIM", blitzRate: 1 as const },
    };
    expect(buildAssignments(simA, args).log).toEqual(buildAssignments(simB, args).log);
  });

  it("supports legacy tracked player buckets and emits deterministic fallback notes", () => {
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 88,
      trackedPlayers: {
        HOME: { QB: "HOME_QB", RB: "HOME_RB", WR: "HOME_WR", TE: "HOME_TE", OL: "HOME_OL" },
        AWAY: { DL: "AWAY_DL", LB: "AWAY_LB", DB: "AWAY_DB" },
      },
    });
    const out = buildAssignments(sim, {
      playType: "DROPBACK",
      personnelPackage: "11",
      defensivePackage: "Nickel",
      defensiveCall: { kind: "SHELL", shell: "COVER_3", press: false },
    });

    expect(out.offense.eligible.X).toBe("HOME_WR");
    expect(out.offense.ol.C).toBe("HOME_OL");
    expect(out.defense.roles.CB1).toBe("AWAY_DB");
    expect(out.log.notes?.length ?? 0).toBeGreaterThan(0);
  });

  it("maps QB_KEEP to run concept with QB ballcarrier in log", () => {
    const sim = makeSim();
    const out = buildAssignments(sim, {
      playType: "QB_KEEP",
      personnelPackage: "11",
      defensivePackage: "Nickel",
      defensiveCall: { kind: "SHELL", shell: "COVER_3", press: false },
    });

    expect(out.log.targetRole).toBe("QB");
    expect(out.log.targetPlayerId).toBe("HOME_QB1");
    expect(out.log.notes).toContain("target-defender-proxy:QB->RB");
  });
});
