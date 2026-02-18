import type { LeagueState } from "@/engine/leagueSim";

export function computeOverallPickNumber(league: LeagueState, teamId: string): number | null {
  const entries = Object.entries(league.standings);
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(([teamA, standingA], [teamB, standingB]) => {
    if (standingA.w !== standingB.w) return standingA.w - standingB.w;
    if (standingA.l !== standingB.l) return standingB.l - standingA.l;

    const differentialA = standingA.pf - standingA.pa;
    const differentialB = standingB.pf - standingB.pa;
    if (differentialA !== differentialB) return differentialA - differentialB;

    if (standingA.pf !== standingB.pf) return standingA.pf - standingB.pf;
    return teamA.localeCompare(teamB);
  });

  const index = sorted.findIndex(([id]) => id === teamId);
  return index === -1 ? null : index + 1;
}
