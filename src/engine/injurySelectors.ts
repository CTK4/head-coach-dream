import type { GameState } from "@/context/GameContext";
import type { Injury } from "./injuryTypes";

export function selectInjuriesByTeam(state: GameState, teamId: string): Injury[] {
  return (state.injuries ?? []).filter((inj) => inj.teamId === teamId);
}

export function selectLeagueInjuries(state: GameState): Injury[] {
  return state.injuries ?? [];
}

export type InjurySummaryCounts = {
  total: number;
  out: number;
  doubtful: number;
  questionable: number;
  ir: number;
  pup: number;
};

export function selectInjurySummaryCounts(state: GameState, teamId?: string): InjurySummaryCounts {
  const injuries = teamId ? selectInjuriesByTeam(state, teamId) : selectLeagueInjuries(state);
  return {
    total: injuries.length,
    out: injuries.filter((i) => i.status === "OUT").length,
    doubtful: injuries.filter((i) => i.status === "DOUBTFUL").length,
    questionable: injuries.filter((i) => i.status === "QUESTIONABLE").length,
    ir: injuries.filter((i) => i.status === "IR").length,
    pup: injuries.filter((i) => i.status === "PUP").length,
  };
}
