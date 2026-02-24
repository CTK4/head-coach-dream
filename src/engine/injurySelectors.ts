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
  const counts: InjurySummaryCounts = { total: injuries.length, out: 0, doubtful: 0, questionable: 0, ir: 0, pup: 0 };
  for (const i of injuries) {
    if (i.status === "OUT") counts.out++;
    else if (i.status === "DOUBTFUL") counts.doubtful++;
    else if (i.status === "QUESTIONABLE") counts.questionable++;
    else if (i.status === "IR") counts.ir++;
    else if (i.status === "PUP") counts.pup++;
  }
  return counts;
}
