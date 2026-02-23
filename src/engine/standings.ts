import { getTeamById } from "@/data/leagueDb";
import type { AIGameResult } from "@/engine/leagueSim";

export interface TeamStanding {
  teamId: string;
  teamName: string;
  division: string;
  conference: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  divisionRecord: { w: number; l: number; t: number };
  streak: string;
  lastFive: Array<"W" | "L" | "T">;
}

function pct(w: number, l: number, t: number) {
  const g = w + l + t;
  if (g <= 0) return 0;
  return Number(((w + t * 0.5) / g).toFixed(3));
}

function resultForTeam(game: AIGameResult, teamId: string): "W" | "L" | "T" {
  const isHome = game.homeTeamId === teamId;
  const my = isHome ? game.homeScore : game.awayScore;
  const opp = isHome ? game.awayScore : game.homeScore;
  if (my > opp) return "W";
  if (my < opp) return "L";
  return "T";
}

function divisionPct(s: TeamStanding) {
  return pct(s.divisionRecord.w, s.divisionRecord.l, s.divisionRecord.t);
}

function sortConference(a: TeamStanding, b: TeamStanding) {
  return b.winPct - a.winPct || divisionPct(b) - divisionPct(a) || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) || b.pointsFor - a.pointsFor || a.teamName.localeCompare(b.teamName);
}

export function computeStandings(allGameResults: AIGameResult[], previousStandings: TeamStanding[]): TeamStanding[] {
  const byId = new Map(previousStandings.map((s) => [s.teamId, { ...s, divisionRecord: { ...s.divisionRecord }, lastFive: [...(s.lastFive ?? [])] }]));

  for (const game of allGameResults) {
    const homeMeta = getTeamById(game.homeTeamId);
    const awayMeta = getTeamById(game.awayTeamId);

    const home = byId.get(game.homeTeamId);
    const away = byId.get(game.awayTeamId);
    if (!home || !away) continue;

    home.pointsFor += game.homeScore;
    home.pointsAgainst += game.awayScore;
    away.pointsFor += game.awayScore;
    away.pointsAgainst += game.homeScore;

    const homeRes = resultForTeam(game, game.homeTeamId);
    const awayRes = resultForTeam(game, game.awayTeamId);

    if (homeRes === "W") {
      home.wins += 1;
      away.losses += 1;
    } else if (homeRes === "L") {
      home.losses += 1;
      away.wins += 1;
    } else {
      home.ties += 1;
      away.ties += 1;
    }

    if (homeMeta?.divisionId && awayMeta?.divisionId && homeMeta.divisionId === awayMeta.divisionId) {
      if (homeRes === "W") {
        home.divisionRecord.w += 1;
        away.divisionRecord.l += 1;
      } else if (homeRes === "L") {
        home.divisionRecord.l += 1;
        away.divisionRecord.w += 1;
      } else {
        home.divisionRecord.t += 1;
        away.divisionRecord.t += 1;
      }
    }

    home.lastFive = [...home.lastFive, homeRes].slice(-5);
    away.lastFive = [...away.lastFive, awayRes].slice(-5);
    home.streak = `${homeRes}${home.lastFive.slice().reverse().findIndex((r) => r !== homeRes) === -1 ? home.lastFive.length : home.lastFive.length - home.lastFive.slice().reverse().findIndex((r) => r !== homeRes)}`;
    away.streak = `${awayRes}${away.lastFive.slice().reverse().findIndex((r) => r !== awayRes) === -1 ? away.lastFive.length : away.lastFive.length - away.lastFive.slice().reverse().findIndex((r) => r !== awayRes)}`;

    home.winPct = pct(home.wins, home.losses, home.ties);
    away.winPct = pct(away.wins, away.losses, away.ties);

    byId.set(home.teamId, home);
    byId.set(away.teamId, away);
  }

  const all = Array.from(byId.values());
  const conferences = new Map<string, TeamStanding[]>();
  for (const s of all) {
    const list = conferences.get(s.conference) ?? [];
    list.push(s);
    conferences.set(s.conference, list);
  }

  const ordered: TeamStanding[] = [];
  for (const [, teams] of Array.from(conferences.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const byDivision = new Map<string, TeamStanding[]>();
    for (const t of teams) {
      const list = byDivision.get(t.division) ?? [];
      list.push(t);
      byDivision.set(t.division, list);
    }

    const divisionWinners: TeamStanding[] = [];
    const nonWinners: TeamStanding[] = [];
    for (const [, divisionTeams] of byDivision) {
      const sorted = divisionTeams.slice().sort(sortConference);
      if (sorted[0]) divisionWinners.push(sorted[0]);
      nonWinners.push(...sorted.slice(1));
    }
    ordered.push(...divisionWinners.sort(sortConference), ...nonWinners.sort(sortConference));
  }
  return ordered;
}

