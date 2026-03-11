import { DEFAULT_SIM_TUNING, type DifficultyPresetId, type RealismPresetId } from "@/config/simTuning";

export const SETTINGS_KEY = "hcd:settings";

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
};

const DEFAULT_SETTINGS: Required<Pick<UserSettings, "confirmAutoAdvance" | "showTooltips" | "difficultyPreset" | "realismPreset">> = {
  confirmAutoAdvance: true,
  showTooltips: true,
  difficultyPreset: DEFAULT_SIM_TUNING.difficultyPreset,
  realismPreset: DEFAULT_SIM_TUNING.realismPreset,
};

export function readSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as UserSettings;
    return {
      ...parsed,
      confirmAutoAdvance: parsed?.confirmAutoAdvance ?? DEFAULT_SETTINGS.confirmAutoAdvance,
      showTooltips: parsed?.showTooltips ?? DEFAULT_SETTINGS.showTooltips,
      difficultyPreset: parsed?.difficultyPreset ?? DEFAULT_SETTINGS.difficultyPreset,
      realismPreset: parsed?.realismPreset ?? DEFAULT_SETTINGS.realismPreset,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
