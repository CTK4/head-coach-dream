import type { GameBoxScore } from "@/engine/gameSim";
import type { SeasonSummary } from "@/types/season";
import type { CoachCareerRecord, PlayerCareerStats, PlayerSeasonStats } from "@/types/stats";

export function accumulateSeasonStats(gameHistory: GameBoxScore[], roster: any[]): PlayerSeasonStats[] {
  const byId = new Map<string, PlayerSeasonStats>();
  const teamById = new Map(roster.map((p) => [String(p.playerId), String(p.teamId ?? "")]))

  for (const box of gameHistory) {
    for (const line of box.players ?? []) {
      const pid = String(line.playerId);
      const cur = byId.get(pid) ?? {
        playerId: pid,
        season: Number(box.season ?? 0),
        teamId: teamById.get(pid) ?? "",
        gamesPlayed: 0,
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 0,
        rushingTDs: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
        tackles: 0,
        sacks: 0,
        interceptionsDef: 0,
        passDeflections: 0,
        fieldGoalsMade: 0,
        fieldGoalAttempts: 0,
        puntAverage: 0,
      };
      cur.gamesPlayed += 1;
      cur.passingYards = Number(cur.passingYards ?? 0) + Number(line.passing?.yards ?? 0);
      cur.passingTDs = Number(cur.passingTDs ?? 0) + Number(line.passing?.tds ?? 0);
      cur.interceptions = Number(cur.interceptions ?? 0) + Number(line.passing?.ints ?? 0);
      cur.rushingYards = Number(cur.rushingYards ?? 0) + Number(line.rushing?.yards ?? 0);
      cur.rushingTDs = Number(cur.rushingTDs ?? 0) + Number(line.rushing?.tds ?? 0);
      cur.receptions = Number(cur.receptions ?? 0) + Number(line.receiving?.receptions ?? 0);
      cur.receivingYards = Number(cur.receivingYards ?? 0) + Number(line.receiving?.yards ?? 0);
      cur.receivingTDs = Number(cur.receivingTDs ?? 0) + Number(line.receiving?.tds ?? 0);
      cur.tackles = Number(cur.tackles ?? 0) + Number((line as any).defense?.tackles ?? 0);
      cur.sacks = Number(cur.sacks ?? 0) + Number((line as any).defense?.sacks ?? 0);
      cur.interceptionsDef = Number(cur.interceptionsDef ?? 0) + Number((line as any).defense?.interceptionsDef ?? 0);
      cur.passDeflections = Number(cur.passDeflections ?? 0) + Number((line as any).defense?.passDeflections ?? 0);
      cur.fieldGoalsMade = Number(cur.fieldGoalsMade ?? 0) + Number((line as any).specialTeams?.fieldGoalsMade ?? 0);
      cur.fieldGoalAttempts = Number(cur.fieldGoalAttempts ?? 0) + Number((line as any).specialTeams?.fieldGoalAttempts ?? 0);
      byId.set(pid, cur);
    }
  }
  return Array.from(byId.values());
}

export function finalizeCareerStats(player: any, seasonStats: PlayerSeasonStats): any {
  const career: PlayerCareerStats = player.careerStats ?? { playerId: String(player.playerId), seasons: [], careerTotals: { gamesPlayed: 0 } as any };
  const seasons = [...career.seasons, seasonStats];
  const totals: any = { gamesPlayed: 0 };
  for (const s of seasons) {
    for (const [k, v] of Object.entries(s)) {
      if (k === "season" || k === "teamId") continue;
      totals[k] = Number(totals[k] ?? 0) + Number(v ?? 0);
    }
  }
  return { ...player, careerStats: { ...career, seasons, careerTotals: totals } };
}

export function updateCoachCareerRecord(coach: any, summary: SeasonSummary): any {
  const record: CoachCareerRecord = coach.careerRecord ?? {
    coachId: String(coach.name ?? "Coach"),
    seasons: [],
    allTimeRecord: { wins: 0, losses: 0 },
    playoffAppearances: 0,
    championships: 0,
  };
  const teamId = String((coach as any).teamId ?? "");
  const seasons = [...record.seasons, {
    season: Number(summary.tenureYear ?? 0),
    teamId,
    wins: Number(summary.wins ?? 0),
    losses: Number(summary.losses ?? 0),
    playoffResult: summary.playoffResult ?? null,
    divisionWinner: Boolean(summary.divisionWinner),
    finalStanding: Number(summary.finalStanding ?? 32),
  }];
  const allTimeRecord = seasons.reduce((a, s) => ({ wins: a.wins + Number(s.wins ?? 0), losses: a.losses + Number(s.losses ?? 0) }), { wins: 0, losses: 0 });
  const playoffAppearances = seasons.filter((s) => s.playoffResult && s.playoffResult !== "missed").length;
  const championships = seasons.filter((s) => s.playoffResult === "champion").length;
  return { ...coach, careerRecord: { ...record, seasons, allTimeRecord, playoffAppearances, championships } };
}
