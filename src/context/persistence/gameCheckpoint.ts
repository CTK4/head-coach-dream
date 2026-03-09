import type { GameState } from "@/context/GameContext";

export const GAME_CHECKPOINT_KEY = "hc_game_checkpoint";

export function clearGameCheckpoint() {
  try {
    localStorage.removeItem(GAME_CHECKPOINT_KEY);
  } catch {
    /* silent */
  }
}

export function writeGameCheckpoint(state: GameState) {
  try {
    localStorage.setItem(
      GAME_CHECKPOINT_KEY,
      JSON.stringify({
        saveSeed: state.saveSeed,
        season: state.season,
        leaguePhase: state.league.phase,
        game: state.game,
      }),
    );
  } catch {
    /* quota exceeded — silent */
  }
}
