import rawLeagueHistory from "@/data/league_history/ugf_league_history_v1.json";
import type { HofInductee, LeagueHistoryData, MvpEntry, SeasonHistory } from "@/engine/leagueHistory/types";

const leagueHistory = rawLeagueHistory as LeagueHistoryData;

export function getSeasons(): SeasonHistory[] {
  return [...leagueHistory.seasons].sort((a, b) => b.season - a.season);
}

export function getHallOfFame(): HofInductee[] {
  return [...leagueHistory.hallOfFame].sort((a, b) => {
    if (b.classYear !== a.classYear) {
      return b.classYear - a.classYear;
    }
    return a.player.localeCompare(b.player);
  });
}

export function getMvpBySeason(season: number): { ironCrownMvp: MvpEntry | null; regularSeasonMvp: MvpEntry | null } {
  const seasonEntry = leagueHistory.seasons.find((entry) => entry.season === season);
  if (!seasonEntry) {
    return {
      ironCrownMvp: null,
      regularSeasonMvp: null,
    };
  }

  return {
    ironCrownMvp: seasonEntry.ironCrownMvp,
    regularSeasonMvp: seasonEntry.regularSeasonMvp,
  };
}
