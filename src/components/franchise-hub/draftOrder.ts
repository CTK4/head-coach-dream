import type { LeagueState } from "@/engine/leagueSim";

type StandingTuple = [teamId: string, wins: number, losses: number, pointDiff: number, pointsFor: number];

function toStandingTuple(teamId: string, value: LeagueState["standings"][string]): StandingTuple {
  const wins = typeof value?.w === "number" ? value.w : 0;
  const losses = typeof value?.l === "number" ? value.l : 0;
  const pointsFor = typeof value?.pf === "number" ? value.pf : 0;
  const pointsAgainst = typeof value?.pa === "number" ? value.pa : 0;
  const pointDiff = pointsFor - pointsAgainst;
  return [teamId, wins, losses, pointDiff, pointsFor];
}

export function computeOverallPickNumber(league: LeagueState, teamId: string): number | null {
  const standingsEntries = Object.entries(league?.standings ?? {});
  if (!standingsEntries.length) return null;

  const ordered = standingsEntries
    .map(([id, standing]) => toStandingTuple(id, standing))
    .sort((a, b) => {
      if (a[1] !== b[1]) return a[1] - b[1];
      if (a[2] !== b[2]) return b[2] - a[2];
      if (a[3] !== b[3]) return a[3] - b[3];
      if (a[4] !== b[4]) return a[4] - b[4];
      return a[0].localeCompare(b[0]);
    });

  const index = ordered.findIndex(([id]) => id === teamId);
  return index === -1 ? null : index + 1;
}
