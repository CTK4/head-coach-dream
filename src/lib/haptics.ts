import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";

const HAPTICS_STORAGE_KEY = "hapticsEnabled";
let lastGestureId: number | null = null;
let lastTriggeredAt = 0;
let hapticsEnabledCache: boolean | null = null;

type PreferencesApi = {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
};

type HapticsApi = {
  impact(options: { style: string }): Promise<void>;
};

async function getPreferences(): Promise<PreferencesApi | null> {
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

async function getNativeHaptics(): Promise<HapticsApi | null> {
  if (!isCapacitorIosEnvironment()) {
    return null;
  }

  try {
    const moduleName = "@capacitor/haptics";
    const { Haptics } = await import(/* @vite-ignore */ moduleName);
    return Haptics;
  } catch {
    return null;
  }
}

function supportsVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

export async function getHapticsEnabled(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (hapticsEnabledCache !== null) {
    return hapticsEnabledCache;
  }

  try {
    const nativeStorage = await getPreferences();
    if (nativeStorage) {
      const stored = await nativeStorage.get({ key: HAPTICS_STORAGE_KEY });
      if (stored.value === "true") {
        hapticsEnabledCache = true;
        return true;
      }
      if (stored.value === "false") {
        hapticsEnabledCache = false;
        return false;
      }
    }
  } catch {
    // Fall through to localStorage
  }

  try {
    const stored = window.localStorage.getItem(HAPTICS_STORAGE_KEY);
    if (stored === "true") {
      hapticsEnabledCache = true;
      return true;
    }
    if (stored === "false") {
      hapticsEnabledCache = false;
      return false;
    }
  } catch {
    // Ignore
  }

  const defaultEnabled = supportsVibrate() && !prefersReducedMotion();
  hapticsEnabledCache = defaultEnabled;
  return defaultEnabled;
}

export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  hapticsEnabledCache = enabled;

  try {
    const nativeStorage = await getPreferences();
    if (nativeStorage) {
      await nativeStorage.set({
        key: HAPTICS_STORAGE_KEY,
        value: String(enabled),
      });
      return;
    }
  } catch {
    // Fall through to localStorage
  }

  try {
    window.localStorage.setItem(HAPTICS_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export async function triggerHapticTap(gestureId?: number): Promise<void> {
  const enabled = await getHapticsEnabled();
  if (!enabled) {
    return;
  }

  if (typeof gestureId === "number") {
    if (lastGestureId === gestureId) {
      return;
    }
    lastGestureId = gestureId;
  } else {
    const now = Date.now();
    if (now - lastTriggeredAt < 32) {
      return;
    }
    lastTriggeredAt = now;
  }

  try {
    const nativeHaptics = await getNativeHaptics();
    if (nativeHaptics) {
      await nativeHaptics.impact({ style: "LIGHT" });
    } else if (supportsVibrate()) {
      navigator.vibrate(10);
    }
  } catch {
    // Silently fail if haptics not available
  }
}

export async function hapticTap(_kind: "light" | "medium" | "heavy" = "light"): Promise<void> {
  await triggerHapticTap();
}
