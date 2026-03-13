import type { GameState } from "@/context/GameContext";
import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";

export const GAME_CHECKPOINT_KEY = "hc_game_checkpoint";

async function getNativeStorage() {
  if (!isCapacitorIosEnvironment()) {
    return null;
  }

  try {
    const moduleName = "@capacitor/preferences";
    const { Preferences } = await import(/* @vite-ignore */ moduleName);
    return Preferences;
  } catch {
    return null;
  }
}

export async function clearGameCheckpoint() {
  try {
    const nativeStorage = await getNativeStorage();
    if (nativeStorage) {
      await nativeStorage.remove({ key: GAME_CHECKPOINT_KEY });
      return;
    }
  } catch {
    /* silent */
  }

  try {
    localStorage.removeItem(GAME_CHECKPOINT_KEY);
  } catch {
    /* silent */
  }
}

export async function writeGameCheckpoint(state: GameState) {
  const checkpoint = JSON.stringify({
    saveSeed: state.saveSeed,
    season: state.season,
    leaguePhase: state.league.phase,
    game: state.game,
  });

  try {
    const nativeStorage = await getNativeStorage();
    if (nativeStorage) {
      await nativeStorage.set({
        key: GAME_CHECKPOINT_KEY,
        value: checkpoint,
      });
      return;
    }
  } catch {
    /* quota exceeded — silent */
  }

  try {
    localStorage.setItem(GAME_CHECKPOINT_KEY, checkpoint);
  } catch {
    /* quota exceeded — silent */
  }
}
