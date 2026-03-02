const HAPTICS_STORAGE_KEY = "hapticsEnabled";
let lastGestureId: number | null = null;
let lastTriggeredAt = 0;

function supportsVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

export function getHapticsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = window.localStorage.getItem(HAPTICS_STORAGE_KEY);
  if (stored === "true") {
    return true;
  }

  if (stored === "false") {
    return false;
  }

  return supportsVibrate() && !prefersReducedMotion();
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HAPTICS_STORAGE_KEY, String(enabled));
}

/**
 * Best-effort haptic tap for user-initiated press gestures.
 * Call only inside pointer/touch event handlers.
 */
export function triggerHapticTap(gestureId?: number): void {
  if (!supportsVibrate() || !getHapticsEnabled()) {
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

  navigator.vibrate(10);
}

/**
 * Backward-compatible adapter used by existing screens.
 */
export async function hapticTap(_kind: "light" | "medium" | "heavy" = "light"): Promise<void> {
  triggerHapticTap();
}
