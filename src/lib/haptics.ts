import { loadCapacitorHaptics, loadCapacitorPreferences } from "@/lib/capacitorRuntime";
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

type HapticsModule = {
  Haptics?: HapticsApi;
  ImpactStyle?: {
    Light?: string;
  };
};

function supportsVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

async function getNativeStorage(): Promise<PreferencesApi | null> {
  if (!isCapacitorIosEnvironment()) {
    return null;
  }
  const module = await loadCapacitorPreferences();
  const preferences = module?.Preferences as PreferencesApi | undefined;
  return preferences ?? null;
}

export async function getHapticsEnabled(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  // Return cached value if available
  if (hapticsEnabledCache !== null) {
    return hapticsEnabledCache;
  }

  try {
    const nativeStorage = await getNativeStorage();
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
    const nativeStorage = await getNativeStorage();
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

/**
 * Best-effort haptic tap for user-initiated press gestures.
 * Uses Capacitor Haptics on iOS, navigator.vibrate on web.
 * Call only inside pointer/touch event handlers.
 */
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
    if (isCapacitorIosEnvironment()) {
      const module = (await loadCapacitorHaptics()) as HapticsModule | null;
      const haptics = module?.Haptics;
      const impactStyle = module?.ImpactStyle?.Light;
      if (haptics && impactStyle) {
        await haptics.impact({ style: impactStyle });
      }
    } else if (supportsVibrate()) {
      // Fall back to navigator.vibrate on web
      navigator.vibrate(10);
    }
  } catch {
    // Silently fail if haptics not available
  }
}

/**
 * Backward-compatible adapter used by existing screens.
 */
export async function hapticTap(_kind: "light" | "medium" | "heavy" = "light"): Promise<void> {
  await triggerHapticTap();
}
