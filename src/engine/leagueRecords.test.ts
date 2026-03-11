import { describe, expect, it } from "vitest";
import { defaultFranchiseRecords, defaultLeagueRecords, updateFranchiseRecordsAtRollover, updateLeagueRecords } from "@/engine/leagueRecords";
import type { CoachCareerRecord, PlayerCareerStats, PlayerSeasonStats } from "@/types/stats";

const coachRecord: CoachCareerRecord = {
  coachId: "USER_COACH",
  seasons: [],
  allTimeRecord: { wins: 0, losses: 0 },
  playoffAppearances: 0,
  championships: 0,
};

describe("leagueRecords", () => {
  it("replaces franchise and league records when higher totals are posted", () => {
    const seasonStats: PlayerSeasonStats[] = [
      { playerId: "P1", season: 2028, teamId: "TEAM_A", gamesPlayed: 17, passingYards: 5100, passingTDs: 42, rushingTDs: 1, receivingTDs: 0 },
    ];
    const careers: Record<string, PlayerCareerStats> = {
      P1: {
        playerId: "P1",
        seasons: [
          { playerId: "P1", season: 2027, teamId: "TEAM_A", gamesPlayed: 17, passingYards: 3000, passingTDs: 20 },
          { playerId: "P1", season: 2028, teamId: "TEAM_A", gamesPlayed: 17, passingYards: 5100, passingTDs: 42 },
        ],
        careerTotals: { playerId: "P1", gamesPlayed: 34, passingYards: 8100, passingTDs: 62 } as any,
      },
    };

    const nextLeague = updateLeagueRecords(defaultLeagueRecords(), seasonStats, coachRecord, { playerNameById: { P1: "Record Setter" } });
    const nextFranchise = updateFranchiseRecordsAtRollover({ TEAM_A: defaultFranchiseRecords("TEAM_A") }, seasonStats, careers, { playerNameById: { P1: "Record Setter" } });

    expect(nextLeague.singleSeasonPassingYards.value).toBe(5100);
    expect(nextLeague.singleSeasonPassingYards.playerName).toBe("Record Setter");
    expect(nextFranchise.TEAM_A.careerPassingYards.value).toBe(8100);
  });

  it("keeps existing records on ties", () => {
    const existing = defaultLeagueRecords();
    existing.singleSeasonPassingYards = { playerId: "OLD", playerName: "Old Name", teamId: "TEAM_A", value: 5000, season: 2026 };

    const tiedSeason: PlayerSeasonStats[] = [
      { playerId: "NEW", season: 2028, teamId: "TEAM_B", gamesPlayed: 17, passingYards: 5000 },
    ];

    const next = updateLeagueRecords(existing, tiedSeason, coachRecord, { playerNameById: { NEW: "New Name" } });
    expect(next.singleSeasonPassingYards.playerId).toBe("OLD");
    expect(next.singleSeasonPassingYards.playerName).toBe("Old Name");
  });
});
