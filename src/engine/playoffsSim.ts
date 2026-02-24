import { simulateFullGame } from "@/engine/gameSim";
import type { LeagueState } from "@/engine/leagueSim";
import type { PlayoffRound, PostseasonState, PostseasonTeamResult } from "@/engine/postseason";

function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sortTeamsForSeeding(league: LeagueState): string[] {
  const ids = Object.keys(league.standings ?? {});
  return ids.slice().sort((a, b) => {
    const A = league.standings[a];
    const B = league.standings[b];
    if (B.w !== A.w) return B.w - A.w;
    const diffA = (A.pf ?? 0) - (A.pa ?? 0);
    const diffB = (B.pf ?? 0) - (B.pa ?? 0);
    if (diffB !== diffA) return diffB - diffA;
    return (B.pf ?? 0) - (A.pf ?? 0);
  });
}

type BracketGame = { homeTeamId: string; awayTeamId: string; round: PlayoffRound };

function simulateGame(seed: number, g: BracketGame): { winner: string; loser: string } {
  const h = fnv1a32(`${g.round}|${g.homeTeamId}|${g.awayTeamId}`);
  const r = simulateFullGame({ homeTeamId: g.homeTeamId, awayTeamId: g.awayTeamId, seed: seed + h });
  const homeWins = r.homeScore >= r.awayScore;
  return homeWins ? { winner: g.homeTeamId, loser: g.awayTeamId } : { winner: g.awayTeamId, loser: g.homeTeamId };
}

export function simulatePlayoffs(params: { league: LeagueState; season: number; seed: number }): { postseason: PostseasonState; championTeamId: string } {
  const { league, season, seed } = params;
  const seeded = sortTeamsForSeeding(league);
  const playoffTeams = seeded.slice(0, Math.min(4, seeded.length));

  const resultsByTeamId: Record<string, PostseasonTeamResult> = {};
  for (const id of Object.keys(league.standings)) {
    resultsByTeamId[id] = { teamId: id, madePlayoffs: playoffTeams.includes(id) };
  }

  if (playoffTeams.length < 2) {
    const champ = playoffTeams[0] ?? seeded[0];
    resultsByTeamId[champ] = { teamId: champ, madePlayoffs: true, isChampion: true };
    return { postseason: { season, resultsByTeamId }, championTeamId: champ };
  }

  const semi1: BracketGame = {
    round: "DIVISIONAL",
    homeTeamId: playoffTeams[0],
    awayTeamId: playoffTeams[3] ?? playoffTeams[1],
  };
  const semi2: BracketGame = {
    round: "DIVISIONAL",
    homeTeamId: playoffTeams[1],
    awayTeamId: playoffTeams[2] ?? playoffTeams[0],
  };

  const s1 = simulateGame(seed + 1000, semi1);
  const s2 = simulateGame(seed + 2000, semi2);

  resultsByTeamId[s1.loser] = { teamId: s1.loser, madePlayoffs: true, eliminatedIn: "DIVISIONAL" };
  resultsByTeamId[s2.loser] = { teamId: s2.loser, madePlayoffs: true, eliminatedIn: "DIVISIONAL" };

  const final: BracketGame = { round: "SUPER_BOWL", homeTeamId: s1.winner, awayTeamId: s2.winner };
  const f = simulateGame(seed + 3000, final);

  resultsByTeamId[f.loser] = { teamId: f.loser, madePlayoffs: true, eliminatedIn: "SUPER_BOWL" };
  resultsByTeamId[f.winner] = { teamId: f.winner, madePlayoffs: true, isChampion: true };

  return { postseason: { season, resultsByTeamId }, championTeamId: f.winner };
}
