import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const HAPTICS_STORAGE_KEY = "hapticsEnabled";
let lastGestureId: number | null = null;
let lastTriggeredAt = 0;
let hapticsEnabledCache: boolean | null = null;

function supportsVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

async function getNativeStorage() {
  if (!isCapacitorIosEnvironment()) {
    return null;
  }
  return Preferences;
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
      // Use native haptics on iOS
      await Haptics.impact({ style: ImpactStyle.Light });
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
