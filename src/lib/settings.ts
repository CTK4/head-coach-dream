import { DEFAULT_SIM_TUNING, type DifficultyPresetId, type RealismPresetId } from "@/config/simTuning";
import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";

export const SETTINGS_KEY = "hcd:settings";

export type OffensePlaycallingMode = "FULL_AUTO" | "KEY_SITUATIONS" | "FULL_PLAYCALLING";

export type UserSettings = {
  simSpeed?: "SLOW" | "NORMAL" | "FAST";
  injuryNotifications?: boolean;
  messagePopups?: boolean;
  confirmAutoAdvance?: boolean;
  reduceMotion?: boolean;
  theme?: "DARK" | "OLED" | "SYSTEM" | "LIGHT";
  useTop51CapRule?: boolean;
  units?: "IMPERIAL" | "METRIC";
  showTooltips?: boolean;
  difficultyPreset?: DifficultyPresetId;
  realismPreset?: RealismPresetId;
  offensePlaycallingMode?: OffensePlaycallingMode;
};

const DEFAULT_SETTINGS: Required<Pick<UserSettings, "confirmAutoAdvance" | "showTooltips" | "difficultyPreset" | "realismPreset" | "offensePlaycallingMode">> = {
  confirmAutoAdvance: true,
  showTooltips: true,
  difficultyPreset: DEFAULT_SIM_TUNING.difficultyPreset,
  realismPreset: DEFAULT_SIM_TUNING.realismPreset,
  offensePlaycallingMode: "FULL_AUTO",
};

function normalizeSettings(parsed: UserSettings | null | undefined): UserSettings {
  return {
    ...parsed,
    confirmAutoAdvance: parsed?.confirmAutoAdvance ?? DEFAULT_SETTINGS.confirmAutoAdvance,
    showTooltips: parsed?.showTooltips ?? DEFAULT_SETTINGS.showTooltips,
    difficultyPreset: parsed?.difficultyPreset ?? DEFAULT_SETTINGS.difficultyPreset,
    realismPreset: parsed?.realismPreset ?? DEFAULT_SETTINGS.realismPreset,
    offensePlaycallingMode: parsed?.offensePlaycallingMode ?? DEFAULT_SETTINGS.offensePlaycallingMode,
  };
}

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

export async function readSettings(): Promise<UserSettings> {
  try {
    const nativeStorage = await getNativeStorage();
    if (nativeStorage) {
      const result = await nativeStorage.get({ key: SETTINGS_KEY });
      if (!result.value) return DEFAULT_SETTINGS;
      return normalizeSettings(JSON.parse(result.value) as UserSettings);
    }
  } catch {
    // Fall through to localStorage
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw) as UserSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function readSettingsSync(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw) as UserSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: UserSettings): void {
  const serialized = JSON.stringify(settings);

  try {
    localStorage.setItem(SETTINGS_KEY, serialized);
  } catch {
    // ignore
  }

  void (async () => {
    try {
      const nativeStorage = await getNativeStorage();
      if (nativeStorage) {
        await nativeStorage.set({
          key: SETTINGS_KEY,
          value: serialized,
        });
      }
    } catch {
      // ignore
    }
  })();
}
