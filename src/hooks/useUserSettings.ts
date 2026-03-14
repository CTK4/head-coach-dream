import { useEffect, useState } from "react";
import { getSettingsSnapshot, readSettings, type UserSettings } from "@/lib/settings";

/**
 * Small utility hook for UI surfaces that need settings.
 * - returns an immediate snapshot for first render
 * - hydrates async from storage and updates state
 */
export function useUserSettings(): UserSettings {
  const [settings, setSettings] = useState<UserSettings>(() => getSettingsSnapshot());

  useEffect(() => {
    let alive = true;
    void (async () => {
      const hydrated = await readSettings();
      if (alive) setSettings(hydrated);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
