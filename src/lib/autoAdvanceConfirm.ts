import type { UserSettings } from "@/lib/settings";

/** Whether the app should ask before auto-advancing phases/stages. */
export function shouldConfirmAutoAdvance(settings: UserSettings | undefined): boolean {
  return settings?.confirmAutoAdvance ?? true;
}

/**
 * Generic confirm helper for places that don't have a full dialog UX.
 * Returns true if we should proceed with the action.
 */
export function confirmAutoAdvance(settings: UserSettings | undefined, message: string): boolean {
  if (!shouldConfirmAutoAdvance(settings)) return true;
  return window.confirm(message);
}
