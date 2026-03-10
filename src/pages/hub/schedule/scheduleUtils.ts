import { getTeamById } from "@/data/leagueDb";
import type { GameState } from "@/context/GameContext";

export const gameKey = (gameType: string, week: number, homeTeamId: string, awayTeamId: string) => `${gameType}:${week}:${homeTeamId}:${awayTeamId}`;

export function parseGameKey(key: string) {
  const [gameType, weekRaw, homeTeamId, awayTeamId] = key.split(":");
  return { gameType, week: Number(weekRaw), homeTeamId, awayTeamId };
}

export function teamName(teamId: string) {
  return getTeamById(teamId)?.name ?? teamId;
}

export function scoreForGame(state: GameState, key: string) {
  const target = parseGameKey(key);
  return state.league.results.find((r) => r.gameType === target.gameType && r.week === target.week && r.homeTeamId === target.homeTeamId && r.awayTeamId === target.awayTeamId);
}
