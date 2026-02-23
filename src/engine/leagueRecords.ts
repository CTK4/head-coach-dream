import type { CoachCareerRecord, PlayerSeasonStats } from "@/types/stats";

export interface LeagueRecords {
  singleSeasonPassingYards: { playerName: string; value: number; season: number };
  singleSeasonRushingYards: { playerName: string; value: number; season: number };
  singleSeasonTDs: { playerName: string; value: number; season: number };
  singleSeasonSacks: { playerName: string; value: number; season: number };
  coachMostWins: { coachName: string; value: number };
  coachMostChampionships: { coachName: string; value: number };
}

export function defaultLeagueRecords(): LeagueRecords {
  return {
    singleSeasonPassingYards: { playerName: "—", value: 0, season: 0 },
    singleSeasonRushingYards: { playerName: "—", value: 0, season: 0 },
    singleSeasonTDs: { playerName: "—", value: 0, season: 0 },
    singleSeasonSacks: { playerName: "—", value: 0, season: 0 },
    coachMostWins: { coachName: "—", value: 0 },
    coachMostChampionships: { coachName: "—", value: 0 },
  };
}

export function updateLeagueRecords(records: LeagueRecords, seasonStats: PlayerSeasonStats[], coachRecord: CoachCareerRecord): LeagueRecords {
  let next = { ...records };
  for (const s of seasonStats) {
    const name = String((s as any).playerName ?? s.teamId ?? "Unknown");
    if ((s.passingYards ?? 0) > next.singleSeasonPassingYards.value) next.singleSeasonPassingYards = { playerName: name, value: Number(s.passingYards ?? 0), season: s.season };
    if ((s.rushingYards ?? 0) > next.singleSeasonRushingYards.value) next.singleSeasonRushingYards = { playerName: name, value: Number(s.rushingYards ?? 0), season: s.season };
    const tds = Number(s.passingTDs ?? 0) + Number(s.rushingTDs ?? 0) + Number(s.receivingTDs ?? 0);
    if (tds > next.singleSeasonTDs.value) next.singleSeasonTDs = { playerName: name, value: tds, season: s.season };
    if ((s.sacks ?? 0) > next.singleSeasonSacks.value) next.singleSeasonSacks = { playerName: name, value: Number(s.sacks ?? 0), season: s.season };
  }
  if (coachRecord.allTimeRecord.wins > next.coachMostWins.value) next.coachMostWins = { coachName: coachRecord.coachId, value: coachRecord.allTimeRecord.wins };
  if (coachRecord.championships > next.coachMostChampionships.value) next.coachMostChampionships = { coachName: coachRecord.coachId, value: coachRecord.championships };
  return next;
}
