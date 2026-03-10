import { SIM_SYSTEMS_CONFIG } from "@/config/simSystems";

export type TeamWeeklyPerformance = {
  teamId: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  strengthOfSchedule: number;
  last4Wins: number;
  last4Games: number;
  offensiveEfficiency: number;
  defensiveEfficiency: number;
};

export type PowerRankingRow = { teamId: string; score: number; rank: number };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computePowerRankingScore(team: TeamWeeklyPerformance): number {
  const games = Math.max(1, team.wins + team.losses);
  const winPct = team.wins / games;
  const pointDiffPerGame = (team.pointsFor - team.pointsAgainst) / games;
  const recentForm = team.last4Games > 0 ? team.last4Wins / team.last4Games : winPct;

  const normalizedPointDiff = clamp((pointDiffPerGame + 20) / 40, 0, 1);
  const normalizedSos = clamp(team.strengthOfSchedule, 0, 1);
  const normalizedOff = clamp(team.offensiveEfficiency, 0, 1);
  const normalizedDef = clamp(team.defensiveEfficiency, 0, 1);

  const c = SIM_SYSTEMS_CONFIG.powerRankings;
  return (
    winPct * c.recordWeight +
    normalizedPointDiff * c.pointDifferentialWeight +
    normalizedSos * c.strengthOfScheduleWeight +
    recentForm * c.recentFormWeight +
    normalizedOff * c.offenseEfficiencyWeight +
    normalizedDef * c.defenseEfficiencyWeight
  );
}

export function computeWeeklyPowerRankings(rows: TeamWeeklyPerformance[]): PowerRankingRow[] {
  return [...rows]
    .map((row) => ({ teamId: row.teamId, score: Number(computePowerRankingScore(row).toFixed(4)), rank: 0 }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
