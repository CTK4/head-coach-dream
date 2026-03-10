/**
 * Stabilization Regression Suite (Prompts 2-10)
 *
 * Aggregates the key invariants fixed across the stabilization run so that
 * every future change is tested against the same set of critical invariants.
 *
 * Tests are grouped by prompt so regressions are easy to bisect.
 */

import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, migrateSave, type GameState } from "@/context/GameContext";
import { validateCriticalSaveState } from "@/lib/migrations/saveSchema";
import { StateMachine } from "@/lib/stateMachine";
import { buildPlayoffBracket, simulateCpuPlayoffGamesForRound, advancePlayoffRound, buildPostseasonResults, getPlayoffRoundGames } from "@/engine/playoffsSim";
import { initLeagueState } from "@/engine/leagueSim";
import { playerTradeValue } from "@/engine/tradeEngine";
import { netCoachImpact } from "@/engine/coachImpact";
import type { CoachProfile, CoachTrait } from "@/data/coachTraits";
import { definePlay, player, route, pt } from "@/engine/playbooks/playbookDSL";
import { runGoldenSeason } from "@/testHarness/goldenSeasonRunner";

// ─────────────────────────────────────────────────────────────────────────────
// Prompt 3 — Offseason state machine
// ─────────────────────────────────────────────────────────────────────────────

describe("P3 – offseason state machine", () => {
  it("getOffseasonSequence without tampering omits TAMPERING step", () => {
    const seq = StateMachine.getOffseasonSequence({ enableTamperingStep: false });
    expect(seq).not.toContain("TAMPERING");
  });

  it("getOffseasonSequence with tampering includes TAMPERING step", () => {
    const seq = StateMachine.getOffseasonSequence({ enableTamperingStep: true });
    expect(seq).toContain("TAMPERING");
  });

  it("RESIGNING always precedes CUT_DOWNS in the sequence", () => {
    const seq = StateMachine.getOffseasonSequence({ enableTamperingStep: false });
    const resignIdx = seq.indexOf("RESIGNING");
    const cutIdx = seq.indexOf("CUT_DOWNS");
    expect(resignIdx).toBeGreaterThanOrEqual(0);
    expect(cutIdx).toBeGreaterThan(resignIdx);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt 6 — Recovery mode
// ─────────────────────────────────────────────────────────────────────────────

describe("P6 – recovery mode", () => {
  it("RECOVERY_RETURN_TO_HUB clears recoveryNeeded", () => {
    const state = { ...createInitialStateForTests(), recoveryNeeded: true, recoveryErrors: ["err"] };
    const next = gameReducer(state as GameState, { type: "RECOVERY_RETURN_TO_HUB" });
    expect(next.recoveryNeeded).toBe(false);
    expect(next.recoveryErrors).toEqual([]);
  });

  it("RECOVERY_REBUILD_INDICES clears recoveryNeeded", () => {
    const state = { ...createInitialStateForTests(), recoveryNeeded: true, recoveryErrors: ["err"] };
    const next = gameReducer(state as GameState, { type: "RECOVERY_REBUILD_INDICES" });
    expect(next.recoveryNeeded).toBe(false);
  });

  it("validateCriticalSaveState rejects INVALID_PHASE", () => {
    const state = { ...createInitialStateForTests(), phase: "BOGUS_PHASE" as any };
    const result = validateCriticalSaveState(state);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_PHASE");
  });

  it("validateCriticalSaveState accepts valid HUB state", () => {
    const state = { ...createInitialStateForTests(), phase: "HUB" as any };
    const result = validateCriticalSaveState(state);
    expect(result.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt 9 — Playbook DSL
// ─────────────────────────────────────────────────────────────────────────────

describe("P9 – playbook DSL", () => {
  it("definePlay creates a valid ExpandedPlay", () => {
    const play = definePlay({
      playId: "CURL_FLAT",
      name: "Curl Flat",
      type: "PASS",
      family: "Quick Game",
      players: [
        player("QB", 50, 35),
        player("WR1", 10, 48),
        player("WR2", 90, 48),
        player("RB", 58, 35),
      ],
      routes: [
        route("WR1", [pt(10, 48), pt(10, 62), pt(14, 62)], "route"),
        route("WR2", [pt(90, 48), pt(90, 62), pt(86, 62)], "route"),
        route("RB", [pt(58, 35), pt(65, 42)], "route"),
      ],
      tags: ["quick_game", "curl"],
    });
    expect(play.playId).toBe("CURL_FLAT");
    expect(play.diagram.players.length).toBe(4);
    expect(play.diagram.paths.length).toBe(3);
    expect(play.tags).toContain("curl");
  });

  it("definePlay throws when a route references a missing player role", () => {
    expect(() =>
      definePlay({
        playId: "BAD",
        name: "Bad Play",
        type: "RUN",
        family: "Run",
        players: [player("QB", 50, 35)],
        routes: [route("WR1", [pt(10, 48), pt(10, 60)], "route")],
      }),
    ).toThrow(/WR1/);
  });

  it("route throws when fewer than 2 points provided", () => {
    expect(() => route("QB", [pt(50, 35)], "route")).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt 10 — Determinism + cross-system invariants
// ─────────────────────────────────────────────────────────────────────────────

describe("P10 – determinism and cross-system invariants", () => {
  it("tradeEngine: isPick=true returns overall directly (no age adjustment)", () => {
    const pickValue = playerTradeValue({ playerId: "P", name: "Pick", teamId: "T", overall: 400, isPick: true });
    expect(pickValue).toBe(400);
    // Verify picks are not subject to age penalty
    const noAgePenalty = playerTradeValue({ playerId: "P2", name: "Pick", teamId: "T", overall: 400, isPick: true, age: 35 });
    expect(noAgePenalty).toBe(400);
  });

  it("tradeEngine: player value respects age (younger > older at same overall)", () => {
    const young = playerTradeValue({ playerId: "A", name: "A", teamId: "T", overall: 80, age: 22 });
    const old = playerTradeValue({ playerId: "B", name: "B", teamId: "T", overall: 80, age: 35 });
    expect(young).toBeGreaterThan(old);
  });

  it("coachImpact: negative-leaning coach has negative netCoachImpact", () => {
    // 6 negatives, 1 positive → net negative even with boost > drag magnitude
    const dragTrait: CoachTrait = {
      id: "drag",
      label: "Drag",
      tier: "Elite",
      description: "",
      affinityMap: { a: -1, b: -1, c: -1, d: -1, e: -1, f: -1, g: 1 },
    };
    const coach: CoachProfile = { coachId: "c1", name: "Coach", role: "OC", traits: [dragTrait], tenureYears: 0, salary: 1 };
    const impact = netCoachImpact(coach, { a: 50, b: 50, c: 50, d: 50, e: 50, f: 50, g: 50 });
    expect(impact).toBeLessThan(0);
  });

  it("golden playoffs: same seed yields same champion", () => {
    const TEAMS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BALTIMORE_ADMIRALS", "BOSTON_HARBORMEN"];
    function runPlayoffs(seed: number) {
      const league = initLeagueState(TEAMS, 2026);
      league.standings.MILWAUKEE_NORTHSHORE = { w: 14, l: 3, pf: 450, pa: 280 };
      league.standings.ATLANTA_APEX = { w: 13, l: 4, pf: 430, pa: 300 };
      league.standings.BALTIMORE_ADMIRALS = { w: 12, l: 5, pf: 410, pa: 320 };
      league.standings.BOSTON_HARBORMEN = { w: 11, l: 6, pf: 390, pa: 340 };
      let playoffs = buildPlayoffBracket({ league, season: 2026 });
      for (let i = 0; i < 4; i++) {
        const sim = simulateCpuPlayoffGamesForRound({ playoffs, seed });
        playoffs = { ...playoffs, completedGames: sim.completedGames };
        const done = getPlayoffRoundGames(playoffs).every((g) => playoffs.completedGames[g.gameId]);
        if (playoffs.round === "SUPER_BOWL" && done) break;
        playoffs = advancePlayoffRound(playoffs);
      }
      return buildPostseasonResults({ league, playoffs }).championTeamId;
    }
    expect(runPlayoffs(99999)).toBe(runPlayoffs(99999));
  });

  it("golden season: same seed produces same determinism hash", () => {
    const a = runGoldenSeason({ careerSeed: 777, userTeamId: "MILWAUKEE_NORTHSHORE", stopAt: "OFFSEASON_DONE" });
    const b = runGoldenSeason({ careerSeed: 777, userTeamId: "MILWAUKEE_NORTHSHORE", stopAt: "OFFSEASON_DONE" });
    expect(a.determinismHash).toBe(b.determinismHash);
  }, 300_000);
}, 300_000);
