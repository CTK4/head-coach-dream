import { describe, expect, it } from "vitest";
import { cancelPendingTradesAtDeadline, getDeadlineStatus, isTradeAllowed, TRADE_DEADLINE_DEFAULT_WEEK } from "@/engine/tradeDeadline";
import { initLeagueState } from "@/engine/leagueSim";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";

describe("trade deadline utility", () => {
  it("isTradeAllowed false when currentWeek > deadlineWeek", () => {
    expect(isTradeAllowed(11, 10)).toBe(false);
  });

  it("isTradeAllowed true when currentWeek <= deadlineWeek", () => {
    expect(isTradeAllowed(10, 10)).toBe(true);
    expect(isTradeAllowed(9, 10)).toBe(true);
  });

  it("deadline status boundaries", () => {
    expect(getDeadlineStatus(5, 10)).toBe("open");
    expect(getDeadlineStatus(9, 10)).toBe("approaching");
    expect(getDeadlineStatus(10, 10)).toBe("approaching");
    expect(getDeadlineStatus(11, 10)).toBe("passed");
  });
});

describe("league creation validation", () => {
  it("throws for invalid deadline values", () => {
    expect(() => initLeagueState(["A", "B"], 2026, 0)).toThrow();
    expect(() => initLeagueState(["A", "B"], 2026, -2)).toThrow();
    expect(() => initLeagueState(["A", "B"], 2026, 99)).toThrow();
  });
});

describe("engine enforcement", () => {
  function baseState(teamId: string): GameState {
    const s = migrateSave({ saveVersion: 1, saveSeed: 1, season: 2026, acceptedOffer: { teamId } as unknown as GameState["acceptedOffer"] }) as GameState;
    return {
      ...s,
      coach: s.coach ?? ({ name: "", ageTier: "32-35", hometown: "", archetypeId: "", tenureYear: 1 } as GameState["coach"]),
      acceptedOffer: { teamId } as unknown as GameState["acceptedOffer"],
      playerTeamOverrides: s.playerTeamOverrides ?? {},
      playerContractOverrides: s.playerContractOverrides ?? {},
      pendingTradeOffers: s.pendingTradeOffers ?? [],
      league: { ...s.league, week: 12, tradeDeadlineWeek: 10 },
    };
  }

  it("TRADE_ACCEPT rejected after deadline", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baseState(teamId);
    const out = gameReducer(state, { type: "TRADE_ACCEPT", payload: { playerId: "PLY_10001", toTeamId: "AI_TEAM_01", valueTier: "2nd" } });
    expect(out.tradeError?.code).toBe("TRADE_DEADLINE_PASSED");
  });

  it("pending offers cancellation policy marks all pending as cancelled", () => {
    const cancelled = cancelPendingTradesAtDeadline([
      { status: "PENDING" as const },
      { status: "ACCEPTED" as const },
      { status: "PENDING" as const },
    ]);
    expect(cancelled.cancelledOffers).toBe(2);
    expect(cancelled.offers.map((o) => o.status)).toEqual(["CANCELLED", "ACCEPTED", "CANCELLED"]);
  });

  it("missing tradeDeadlineWeek in save defaults to locked", () => {
    const migrated = migrateSave({ saveVersion: 1, saveSeed: 1, season: 2026, league: { standings: {}, results: [], gmByTeamId: {}, week: 1 } as unknown as GameState["league"] }) as GameState;
    expect(migrated.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK).toBe(TRADE_DEADLINE_DEFAULT_WEEK);
    expect(isTradeAllowed(Number(migrated.league.week ?? 1), Number(migrated.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK))).toBe(false);
  });
});
