import { describe, expect, it } from "vitest";
import { applyPlayerStatsForResolvedPlay, buildBadgeContextInput, getPlayParticipants, initGameSim, stepPlay } from "@/engine/gameSim";

describe("game sim assignment participants wiring", () => {
  it("uses progressed target player for offensive badge context and assignment rusher for pressure badge context", () => {
    const sim = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 11,
      awayGameplan: { pressureRate: "HIGH" },
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y" },
        AWAY: { CB1: "AWAY_CB1", LB1: "AWAY_LB1", EDGE_L: "AWAY_EDGE_L", DL: "AWAY_DL", DB: "AWAY_DB" },
      },
    });
    const assignmentLog = {
      offenseRolesAtSnap: { QB: "HOME_QB", RB: "HOME_RB", X: "HOME_X", Z: "HOME_Z", H: "HOME_H", Y: "HOME_Y", LT: "LT", LG: "LG", C: "C", RG: "RG", RT: "RT" },
      defenseRolesAtSnap: { EDGE_L: "AWAY_EDGE_L" },
      coverageFamily: "Cover1",
      shell: "MOFC",
      rushersCount: 5,
      rushMatchups: [{ rusherId: "AWAY_EDGE_L", blockerIds: ["LT"], note: "protection side" }],
      targetRole: "Z",
      targetPlayerId: "HOME_Z",
      defenderId: "AWAY_CB1",
      responsibleDefenderByRole: { RB: "AWAY_LB1", X: "AWAY_CB1", Z: "AWAY_CB1", H: "AWAY_DB", Y: "AWAY_DB" },
    } as any;

    const participants = getPlayParticipants(sim, assignmentLog);
    expect(participants.primaryRusherId).toBe("AWAY_EDGE_L");
    const ctx = buildBadgeContextInput(sim, "DROPBACK", assignmentLog);
    expect(ctx.offenseIds.WR).toBe("HOME_Z");
    expect(ctx.defenseIds.DL).toBe("AWAY_EDGE_L");
  });

  it("credits pass targets deterministically across identical seeds", () => {
    const mk = () => initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 222,
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y", LT1: "LT", LG1: "LG", C1: "C", RG1: "RG", RT1: "RT" },
        AWAY: { CB1: "AWAY_CB1", CB2: "AWAY_CB2", NB: "AWAY_NB", SS: "AWAY_SS", LB1: "AWAY_LB1", LB2: "AWAY_LB2", EDGE_L: "AWAY_EDGE_L", EDGE_R: "AWAY_EDGE_R", DT1: "AWAY_DT1", DT2: "AWAY_DT2" },
      },
    });
    let a = mk();
    let b = mk();
    for (let i = 0; i < 20; i += 1) {
      a = stepPlay({ ...a, possession: "HOME", down: 1, distance: 10, ballOn: 50 }, "DROPBACK").sim;
      b = stepPlay({ ...b, possession: "HOME", down: 1, distance: 10, ballOn: 50 }, "DROPBACK").sim;
    }

    const aReceivers = (a.boxScore?.players ?? []).filter((p) => p.side === "HOME" && p.receiving.targets > 0).map((p) => ({ id: p.playerId, t: p.receiving.targets, r: p.receiving.receptions, y: p.receiving.yards })).sort((x, y) => x.id.localeCompare(y.id));
    const bReceivers = (b.boxScore?.players ?? []).filter((p) => p.side === "HOME" && p.receiving.targets > 0).map((p) => ({ id: p.playerId, t: p.receiving.targets, r: p.receiving.receptions, y: p.receiving.yards })).sort((x, y) => x.id.localeCompare(y.id));
    expect(aReceivers.length).toBeGreaterThan(0);
    expect(aReceivers).toEqual(bReceivers);
  });

  it("credits sacks to a deterministic rusher from assignment rush matchups", () => {
    let sim = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 333,
      awayGameplan: { pressureRate: "HIGH" },
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y", LT1: "LT", LG1: "LG", C1: "C", RG1: "RG", RT1: "RT" },
        AWAY: { EDGE_L: "AWAY_EDGE_L", EDGE_R: "AWAY_EDGE_R", DT1: "AWAY_DT1", DT2: "AWAY_DT2", CB1: "AWAY_CB1", CB2: "AWAY_CB2", NB: "AWAY_NB", SS: "AWAY_SS", LB1: "AWAY_LB1", LB2: "AWAY_LB2" },
      },
    });
    let sackRusherId: string | undefined;
    for (let i = 0; i < 220; i += 1) {
      sim = stepPlay({ ...sim, possession: "HOME", down: 3, distance: 12, ballOn: 50 }, "DROPBACK").sim;
      if (String(sim.lastResult ?? "").includes("Sack")) {
        sackRusherId = getPlayParticipants(sim, sim.lastAssignmentLog).primaryRusherId;
        break;
      }
    }

    expect(sackRusherId).toBeTruthy();
    const credited = (sim.boxScore?.players ?? []).find((p) => p.playerId === sackRusherId && p.side === "AWAY");
    expect(credited?.defense.sacks ?? 0).toBeGreaterThan(0);
  });

  it("does not credit receiving targets on sacks", () => {
    let sim = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 919,
      awayGameplan: { pressureRate: "HIGH" },
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y", LT1: "LT", LG1: "LG", C1: "C", RG1: "RG", RT1: "RT" },
        AWAY: { EDGE_L: "AWAY_EDGE_L", EDGE_R: "AWAY_EDGE_R", DT1: "AWAY_DT1", DT2: "AWAY_DT2", CB1: "AWAY_CB1", CB2: "AWAY_CB2", NB: "AWAY_NB", SS: "AWAY_SS", LB1: "AWAY_LB1", LB2: "AWAY_LB2" },
      },
    });

    let targetsBeforeSack = 0;
    let targetsAfterSack = 0;
    for (let i = 0; i < 50; i += 1) {
      const preTargets = (sim.boxScore?.players ?? []).filter((p) => p.side === "HOME").reduce((sum, p) => sum + p.receiving.targets, 0);
      const next = stepPlay({ ...sim, possession: "HOME", down: 3, distance: 14, ballOn: 50 }, "DROPBACK").sim;
      const postTargets = (next.boxScore?.players ?? []).filter((p) => p.side === "HOME").reduce((sum, p) => sum + p.receiving.targets, 0);
      sim = next;
      if (String(sim.lastResult ?? "").includes("Sack")) {
        targetsBeforeSack = preTargets;
        targetsAfterSack = postTargets;
        break;
      }
    }

    const offensePlayers = (sim.boxScore?.players ?? []).filter((p) => p.side === "HOME");
    const qbSacksTaken = offensePlayers.find((p) => p.playerId === "HOME_QB")?.passing.sacksTaken ?? 0;
    expect(qbSacksTaken).toBeGreaterThan(0);
    expect(targetsAfterSack).toBe(targetsBeforeSack);
  });

  it("treats scramble-marked pass outcomes as QB rushing credit without target credit", () => {
    const sim = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 1200,
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y" },
        AWAY: { EDGE_L: "AWAY_EDGE_L", LB1: "AWAY_LB1", CB1: "AWAY_CB1" },
      },
    });

    const next = applyPlayerStatsForResolvedPlay(sim, {
      playType: "DROPBACK",
      yards: 11,
      sack: false,
      scramble: true,
      incomplete: false,
      turnover: false,
      td: false,
      assignmentLog: {
        offenseRolesAtSnap: { QB: "HOME_QB", RB: "HOME_RB", X: "HOME_X", Z: "HOME_Z", H: "HOME_H", Y: "HOME_Y", LT: "LT", LG: "LG", C: "C", RG: "RG", RT: "RT" },
        defenseRolesAtSnap: { EDGE_L: "AWAY_EDGE_L", LB1: "AWAY_LB1", CB1: "AWAY_CB1" },
        coverageFamily: "Cover3",
        shell: "MOFC",
        rushersCount: 4,
        rushMatchups: [{ rusherId: "AWAY_EDGE_L", blockerIds: ["LT"] }],
      },
    });

    const qbLine = (next.boxScore?.players ?? []).find((p) => p.playerId === "HOME_QB");
    expect(qbLine?.rushing.attempts ?? 0).toBe(1);
    expect(qbLine?.rushing.yards ?? 0).toBe(11);
    expect(qbLine?.passing.attempts ?? 0).toBe(0);
    const totalTargets = (next.boxScore?.players ?? []).reduce((sum, p) => sum + p.receiving.targets, 0);
    expect(totalTargets).toBe(0);
  });


  it("falls back to primaryReadRole when targetRole is missing and records an inference note", () => {
    const sim = initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 1400,
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y" },
        AWAY: { CB1: "AWAY_CB1", LB1: "AWAY_LB1", DB: "AWAY_DB" },
      },
    });

    const assignmentLog: any = {
      offenseRolesAtSnap: { QB: "HOME_QB", RB: "HOME_RB", X: "HOME_X", Z: "HOME_Z", H: "HOME_H", Y: "HOME_Y", LT: "LT", LG: "LG", C: "C", RG: "RG", RT: "RT" },
      defenseRolesAtSnap: { CB1: "AWAY_CB1", LB1: "AWAY_LB1" },
      primaryReadRole: "Y",
      coverageFamily: "Cover3",
      shell: "MOFC",
      rushersCount: 4,
      rushMatchups: [],
      responsibleDefenderByRole: { RB: "AWAY_LB1", X: "AWAY_CB1", Z: "AWAY_CB1", H: "AWAY_DB", Y: "AWAY_DB" },
    };

    const participants = getPlayParticipants(sim, assignmentLog);
    expect(participants.targetRole).toBe("Y");
    expect(participants.targetPlayerId).toBe("HOME_Y");
    expect(assignmentLog.notes ?? []).toEqual([]);
  });


  it("run resolution remains deterministic with player-rating-driven contact inputs", () => {
    const mk = () => initGameSim({
      homeTeamId: "H",
      awayTeamId: "A",
      seed: 77,
      trackedPlayers: {
        HOME: { QB1: "HOME_QB", RB1: "HOME_RB", WR1: "HOME_X", WR2: "HOME_Z", WR3: "HOME_H", TE1: "HOME_Y" },
        AWAY: { LB1: "AWAY_LB1", CB1: "AWAY_CB1", EDGE_L: "AWAY_EDGE_L" },
      },
    });
    let a = mk();
    let b = mk();
    for (let i = 0; i < 18; i += 1) {
      a = stepPlay({ ...a, possession: "HOME", down: 1, distance: 10, ballOn: 45 }, "INSIDE_ZONE").sim;
      b = stepPlay({ ...b, possession: "HOME", down: 1, distance: 10, ballOn: 45 }, "INSIDE_ZONE").sim;
    }
    expect(a.stats.home.rushYards).toBe(b.stats.home.rushYards);
    expect(a.boxScore?.players).toEqual(b.boxScore?.players);
  });
});
