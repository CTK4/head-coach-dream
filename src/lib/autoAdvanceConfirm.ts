import type { UserSettings } from "@/lib/settings";

export function shouldConfirmAutoAdvance(settings: UserSettings | null | undefined): boolean {
  return settings?.confirmAutoAdvance ?? true;
}

export function confirmAutoAdvance(
  settings: UserSettings | null | undefined,
  message: string,
): boolean {
  if (!shouldConfirmAutoAdvance(settings)) return true;
  if (typeof globalThis.confirm === "function") {
    return globalThis.confirm(message);
  }
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(message);
  }
  return true;
}
