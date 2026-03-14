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

type NativePreferences = {
  get: (opts: { key: string }) => Promise<{ value?: string | null }>;
  set: (opts: { key: string; value: string }) => Promise<void>;
};

function isNativePreferences(x: unknown): x is NativePreferences {
  const obj = x as Record<string, unknown> | null | undefined;
  return !!obj && typeof obj.get === "function" && typeof obj.set === "function";
}

async function getNativeStorage(): Promise<NativePreferences | null> {
  if (!isCapacitorIosEnvironment()) return null;

  try {
    // Avoid bundler static analysis and keep the web build clean.
    const dynamicImport = new Function("moduleName", "return import(moduleName)") as (moduleName: string) => Promise<Record<string, unknown>>;
    const mod = await dynamicImport("@capacitor/preferences");
    const maybePrefs = (mod as { Preferences?: unknown }).Preferences;
    return isNativePreferences(maybePrefs) ? maybePrefs : null;
  } catch {
    return null;
  }
}

function withDefaults(parsed: UserSettings): UserSettings {
  return {
    ...parsed,
    confirmAutoAdvance: parsed?.confirmAutoAdvance ?? DEFAULT_SETTINGS.confirmAutoAdvance,
    showTooltips: parsed?.showTooltips ?? DEFAULT_SETTINGS.showTooltips,
    difficultyPreset: parsed?.difficultyPreset ?? DEFAULT_SETTINGS.difficultyPreset,
    realismPreset: parsed?.realismPreset ?? DEFAULT_SETTINGS.realismPreset,
    offensePlaycallingMode: parsed?.offensePlaycallingMode ?? DEFAULT_SETTINGS.offensePlaycallingMode,
  };
}

let cachedSettings: UserSettings | null = null;

/** Synchronous snapshot for initial UI render; hydrate via `readSettings()` for persisted values. */
export function getSettingsSnapshot(): UserSettings {
  return cachedSettings ?? DEFAULT_SETTINGS;
}

export async function readSettings(): Promise<UserSettings> {
  try {
    const nativeStorage = await getNativeStorage();
    if (nativeStorage) {
      const result = await nativeStorage.get({ key: SETTINGS_KEY });
      if (!result.value) {
        cachedSettings = DEFAULT_SETTINGS;
        return cachedSettings;
      }
      const parsed = JSON.parse(result.value) as UserSettings;
      cachedSettings = withDefaults(parsed);
      return cachedSettings;
    }
  } catch {
    // Fall through to localStorage
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      cachedSettings = DEFAULT_SETTINGS;
      return cachedSettings;
    }
    const parsed = JSON.parse(raw) as UserSettings;
    cachedSettings = withDefaults(parsed);
    return cachedSettings;
  } catch {
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }
}

export async function writeSettings(settings: UserSettings): Promise<void> {
  cachedSettings = withDefaults(settings);
  const serialized = JSON.stringify(cachedSettings);

  try {
    const nativeStorage = await getNativeStorage();
    if (nativeStorage) {
      await nativeStorage.set({ key: SETTINGS_KEY, value: serialized });
      return;
    }
  } catch {
    // Fall through to localStorage
  }

  try {
    localStorage.setItem(SETTINGS_KEY, serialized);
  } catch {
    // ignore
  }
}
