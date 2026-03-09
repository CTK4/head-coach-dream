import type { GameSim } from "@/engine/gameSim";
import type { GameState } from "@/context/GameContext";

export const GAME_CHECKPOINT_KEY = "hc_game_checkpoint";

export function restoreCheckpointOverlay(out: GameState): GameState {
  try {
    const cpRaw = localStorage.getItem(GAME_CHECKPOINT_KEY);
    if (cpRaw) {
      const cp = JSON.parse(cpRaw) as { saveSeed?: number; season?: number; leaguePhase?: string; game?: GameSim };
      const cpActive =
        cp.leaguePhase === "REGULAR_SEASON_GAME" ||
        (cp.game?.weekType === "PLAYOFFS" && cp.game?.homeTeamId !== "HOME");
      const mainIdle =
        out.league.phase !== "REGULAR_SEASON_GAME" &&
        !(out.game?.weekType === "PLAYOFFS" && out.game?.homeTeamId !== "HOME");
      if (cp.saveSeed === out.saveSeed && cp.season === out.season && cpActive && mainIdle && cp.game) {
        return { ...out, game: cp.game, league: { ...out.league, phase: cp.leaguePhase as typeof out.league.phase } };
      }
    }
  } catch {
    /* corrupt checkpoint — ignore and proceed with main save */
  }

  return out;
}
