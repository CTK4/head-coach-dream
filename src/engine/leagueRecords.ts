import type { CoachCareerRecord, PlayerCareerStats, PlayerSeasonStats } from "@/types/stats";

export interface PlayerSeasonRecordEntry {
  playerId: string;
  playerName: string;
  teamId: string;
  value: number;
  season: number;
}

export interface PlayerCareerRecordEntry {
  playerId: string;
  playerName: string;
  value: number;
  lastSeason: number;
}

export interface LeagueRecords {
  singleSeasonPassingYards: PlayerSeasonRecordEntry;
  singleSeasonRushingYards: PlayerSeasonRecordEntry;
  singleSeasonReceivingYards: PlayerSeasonRecordEntry;
  singleSeasonTDs: PlayerSeasonRecordEntry;
  singleSeasonSacks: PlayerSeasonRecordEntry;
  coachMostWins: { coachName: string; value: number };
  coachMostChampionships: { coachName: string; value: number };
}

export interface FranchiseRecords {
  teamId: string;
  singleSeasonPassingYards: PlayerSeasonRecordEntry;
  singleSeasonRushingYards: PlayerSeasonRecordEntry;
  singleSeasonReceivingYards: PlayerSeasonRecordEntry;
  singleSeasonTDs: PlayerSeasonRecordEntry;
  singleSeasonSacks: PlayerSeasonRecordEntry;
  careerPassingYards: PlayerCareerRecordEntry;
  careerRushingYards: PlayerCareerRecordEntry;
  careerReceivingYards: PlayerCareerRecordEntry;
  careerTDs: PlayerCareerRecordEntry;
  careerSacks: PlayerCareerRecordEntry;
}

const EMPTY_SEASON_RECORD: PlayerSeasonRecordEntry = { playerId: "", playerName: "—", teamId: "", value: 0, season: 0 };
const EMPTY_CAREER_RECORD: PlayerCareerRecordEntry = { playerId: "", playerName: "—", value: 0, lastSeason: 0 };

export function defaultLeagueRecords(): LeagueRecords {
  return {
    singleSeasonPassingYards: { ...EMPTY_SEASON_RECORD },
    singleSeasonRushingYards: { ...EMPTY_SEASON_RECORD },
    singleSeasonReceivingYards: { ...EMPTY_SEASON_RECORD },
    singleSeasonTDs: { ...EMPTY_SEASON_RECORD },
    singleSeasonSacks: { ...EMPTY_SEASON_RECORD },
    coachMostWins: { coachName: "—", value: 0 },
    coachMostChampionships: { coachName: "—", value: 0 },
  };
}

export function defaultFranchiseRecords(teamId: string): FranchiseRecords {
  return {
    teamId,
    singleSeasonPassingYards: { ...EMPTY_SEASON_RECORD, teamId },
    singleSeasonRushingYards: { ...EMPTY_SEASON_RECORD, teamId },
    singleSeasonReceivingYards: { ...EMPTY_SEASON_RECORD, teamId },
    singleSeasonTDs: { ...EMPTY_SEASON_RECORD, teamId },
    singleSeasonSacks: { ...EMPTY_SEASON_RECORD, teamId },
    careerPassingYards: { ...EMPTY_CAREER_RECORD },
    careerRushingYards: { ...EMPTY_CAREER_RECORD },
    careerReceivingYards: { ...EMPTY_CAREER_RECORD },
    careerTDs: { ...EMPTY_CAREER_RECORD },
    careerSacks: { ...EMPTY_CAREER_RECORD },
  };
}

function totalTds(stats: Pick<PlayerSeasonStats, "passingTDs" | "rushingTDs" | "receivingTDs">): number {
  return Number(stats.passingTDs ?? 0) + Number(stats.rushingTDs ?? 0) + Number(stats.receivingTDs ?? 0);
}

function sumFranchiseCareer(career: PlayerCareerStats, teamId: string, picker: (season: PlayerSeasonStats) => number): number {
  return (career.seasons ?? [])
    .filter((season) => String(season.teamId ?? "") === String(teamId))
    .reduce((acc, season) => acc + picker(season), 0);
}

export function updateLeagueRecords(
  records: LeagueRecords,
  seasonStats: PlayerSeasonStats[],
  coachRecord: CoachCareerRecord,
  options?: { playerNameById?: Record<string, string> },
): LeagueRecords {
  const playerNameById = options?.playerNameById ?? {};
  const next = { ...defaultLeagueRecords(), ...records };

  for (const s of seasonStats) {
    const playerId = String(s.playerId ?? "");
    const playerName = String(playerNameById[playerId] ?? "Unknown Player");
    const teamId = String(s.teamId ?? "");
    const season = Number(s.season ?? 0);

    if (Number(s.passingYards ?? 0) > next.singleSeasonPassingYards.value) {
      next.singleSeasonPassingYards = { playerId, playerName, teamId, value: Number(s.passingYards ?? 0), season };
    }
    if (Number(s.rushingYards ?? 0) > next.singleSeasonRushingYards.value) {
      next.singleSeasonRushingYards = { playerId, playerName, teamId, value: Number(s.rushingYards ?? 0), season };
    }
    if (Number(s.receivingYards ?? 0) > next.singleSeasonReceivingYards.value) {
      next.singleSeasonReceivingYards = { playerId, playerName, teamId, value: Number(s.receivingYards ?? 0), season };
    }
    const tds = totalTds(s);
    if (tds > next.singleSeasonTDs.value) {
      next.singleSeasonTDs = { playerId, playerName, teamId, value: tds, season };
    }
    if (Number(s.sacks ?? 0) > next.singleSeasonSacks.value) {
      next.singleSeasonSacks = { playerId, playerName, teamId, value: Number(s.sacks ?? 0), season };
    }
  }

  if (coachRecord.allTimeRecord.wins > next.coachMostWins.value) {
    next.coachMostWins = { coachName: coachRecord.coachId, value: coachRecord.allTimeRecord.wins };
  }
  if (coachRecord.championships > next.coachMostChampionships.value) {
    next.coachMostChampionships = { coachName: coachRecord.coachId, value: coachRecord.championships };
  }

  return next;
}

export function updateFranchiseRecordsAtRollover(
  existingByTeamId: Record<string, FranchiseRecords>,
  seasonStats: PlayerSeasonStats[],
  playerCareerStatsById: Record<string, PlayerCareerStats>,
  options?: { playerNameById?: Record<string, string> },
): Record<string, FranchiseRecords> {
  const playerNameById = options?.playerNameById ?? {};
  const next = { ...existingByTeamId };

  for (const s of seasonStats) {
    const teamId = String(s.teamId ?? "");
    if (!teamId) continue;
    const playerId = String(s.playerId ?? "");
    const playerName = String(playerNameById[playerId] ?? "Unknown Player");
    const entry = next[teamId] ?? defaultFranchiseRecords(teamId);

    if (Number(s.passingYards ?? 0) > entry.singleSeasonPassingYards.value) entry.singleSeasonPassingYards = { playerId, playerName, teamId, value: Number(s.passingYards ?? 0), season: Number(s.season ?? 0) };
    if (Number(s.rushingYards ?? 0) > entry.singleSeasonRushingYards.value) entry.singleSeasonRushingYards = { playerId, playerName, teamId, value: Number(s.rushingYards ?? 0), season: Number(s.season ?? 0) };
    if (Number(s.receivingYards ?? 0) > entry.singleSeasonReceivingYards.value) entry.singleSeasonReceivingYards = { playerId, playerName, teamId, value: Number(s.receivingYards ?? 0), season: Number(s.season ?? 0) };
    const tds = totalTds(s);
    if (tds > entry.singleSeasonTDs.value) entry.singleSeasonTDs = { playerId, playerName, teamId, value: tds, season: Number(s.season ?? 0) };
    if (Number(s.sacks ?? 0) > entry.singleSeasonSacks.value) entry.singleSeasonSacks = { playerId, playerName, teamId, value: Number(s.sacks ?? 0), season: Number(s.season ?? 0) };

    const career = playerCareerStatsById[playerId];
    if (career) {
      const latestSeason = (career.seasons ?? []).reduce((max, cs) => Math.max(max, Number(cs.season ?? 0)), 0);
      const pass = sumFranchiseCareer(career, teamId, (cs) => Number(cs.passingYards ?? 0));
      const rush = sumFranchiseCareer(career, teamId, (cs) => Number(cs.rushingYards ?? 0));
      const rec = sumFranchiseCareer(career, teamId, (cs) => Number(cs.receivingYards ?? 0));
      const sack = sumFranchiseCareer(career, teamId, (cs) => Number(cs.sacks ?? 0));
      const td = sumFranchiseCareer(career, teamId, (cs) => totalTds(cs));

      if (pass > entry.careerPassingYards.value) entry.careerPassingYards = { playerId, playerName, value: pass, lastSeason: latestSeason };
      if (rush > entry.careerRushingYards.value) entry.careerRushingYards = { playerId, playerName, value: rush, lastSeason: latestSeason };
      if (rec > entry.careerReceivingYards.value) entry.careerReceivingYards = { playerId, playerName, value: rec, lastSeason: latestSeason };
      if (td > entry.careerTDs.value) entry.careerTDs = { playerId, playerName, value: td, lastSeason: latestSeason };
      if (sack > entry.careerSacks.value) entry.careerSacks = { playerId, playerName, value: sack, lastSeason: latestSeason };
    }

    next[teamId] = entry;
  }

  return next;
}
