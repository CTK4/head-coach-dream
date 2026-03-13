import type { GameState } from "@/context/GameContext";
import { loadCapacitorPreferences } from "@/lib/capacitorRuntime";
import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";

export const GAME_CHECKPOINT_KEY = "hc_game_checkpoint";

type PreferencesApi = {
  remove(options: { key: string }): Promise<void>;
  set(options: { key: string; value: string }): Promise<void>;
};

async function getNativeStorage(): Promise<PreferencesApi | null> {
  if (!isCapacitorIosEnvironment()) {
    return null;
  }
  const module = await loadCapacitorPreferences();
  const preferences = module?.Preferences as PreferencesApi | undefined;
  return preferences ?? null;
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
