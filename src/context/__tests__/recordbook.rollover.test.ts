import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer, type GameState } from "@/context/GameContext";
import { hydrateLoadedState } from "@/context/boot/hydrateState";
import { defaultLeagueRecords } from "@/engine/leagueRecords";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";

describe("recordbook rollover", () => {
  it("updates league/franchise recordbook and milestones at season rollover from stored stats", () => {
    const base = createInitialStateForTests();
    const userTeamId = String(base.acceptedOffer?.teamId ?? "");
    const player = getEffectivePlayersByTeam(base, userTeamId)[0] as any;
    expect(player).toBeTruthy();

    const bracket = buildPlayoffBracket({ league: base.league, season: base.season });
    const teamIds = Object.keys(base.league.standings ?? {});
    const superBowl = {
      gameId: `SUPER_BOWL:LEAGUE:1:${teamIds[0]}:${teamIds[1]}`,
      round: "SUPER_BOWL" as const,
      homeTeamId: teamIds[0],
      awayTeamId: teamIds[1],
    };
    const playoffs = {
      ...bracket,
      round: "SUPER_BOWL" as const,
      bracket: { ...bracket.bracket, superBowl },
      pendingUserGame: undefined,
      completedGames: {
        [superBowl.gameId]: { homeScore: 31, awayScore: 24, winnerTeamId: superBowl.homeTeamId },
      },
    };

    const withSeasonStats: GameState = {
      ...base,
      playoffs,
      gameHistory: [
        {
          season: base.season,
          players: [
            {
              playerId: String(player.playerId),
              passing: { yards: 420, tds: 4, ints: 0 },
              rushing: { yards: 0, tds: 0 },
              receiving: { receptions: 0, yards: 0, tds: 0 },
              defense: { sacks: 0 },
            },
          ],
        } as any,
      ],
    };

    const next = gameReducer(withSeasonStats, { type: "PLAYOFFS_COMPLETE_SEASON" });

    expect(next.leagueRecords.singleSeasonPassingYards.value).toBe(420);
    expect(next.franchiseRecordsByTeamId[userTeamId]?.singleSeasonPassingYards.value).toBe(420);
    expect(next.earnedMilestoneIds).toContain("FRANCHISE_RECORD_PASS_YARDS_SINGLE");
  }, 30_000);

  it("hydrateLoadedState preserves safety when legacy saves miss new recordbook shape", () => {
    const initial = createInitialStateForTests();
    const hydrated = hydrateLoadedState(
      initial,
      { season: 2030, leagueRecords: undefined } as any,
      initial.saveVersion,
      initial.deterministicCounters,
      {
        normalizePriorityList: () => [],
        defaultLeagueRecords,
        clampFatigue: (n) => n,
        FATIGUE_DEFAULT: 50,
        migratePracticePlan: (plan) => (plan as any) ?? initial.practicePlan,
        DEFAULT_PRACTICE_PLAN: { neglectWeeks: {} },
      },
    );

    expect(hydrated.franchiseRecordsByTeamId).toBeDefined();
    expect(typeof hydrated.franchiseRecordsByTeamId).toBe("object");
    expect(hydrated.leagueRecords.singleSeasonPassingYards.value).toBeGreaterThanOrEqual(0);
  });


  it("hydrateLoadedState backfills contract overrides from base contracts for rostered players", () => {
    const initial = createInitialStateForTests();
    const hydrated = hydrateLoadedState(
      initial,
      { playerContractOverrides: {} } as any,
      initial.saveVersion,
      initial.deterministicCounters,
      {
        normalizePriorityList: () => [],
        defaultLeagueRecords,
        clampFatigue: (n) => n,
        FATIGUE_DEFAULT: 50,
        migratePracticePlan: (plan) => (plan as any) ?? initial.practicePlan,
        DEFAULT_PRACTICE_PLAN: { neglectWeeks: {} },
      },
    );

    const rosteredPlayer = getEffectivePlayersByTeam(hydrated, String(hydrated.userTeamId ?? hydrated.teamId))[0] as any;
    expect(rosteredPlayer).toBeTruthy();
    expect(hydrated.playerContractOverrides[String(rosteredPlayer.playerId)]).toBeTruthy();
  });

});
