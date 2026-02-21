/**
 * Best-effort haptics:
 * - Capacitor Haptics if present
 * - Vibration API fallback (Android)
 * - no-op otherwise
 */
export async function hapticTap(kind: "light" | "medium" | "heavy" = "light"): Promise<void> {
  const w = window as any;
  try {
    const cap = w?.Capacitor;
    const h = cap?.Plugins?.Haptics;
    if (h?.impact) {
      const style = kind === "heavy" ? "HEAVY" : kind === "medium" ? "MEDIUM" : "LIGHT";
      await h.impact({ style });
      return;
    }
  } catch {
    // ignore
  }

  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const ms = kind === "heavy" ? 18 : kind === "medium" ? 12 : 8;
      (navigator as any).vibrate(ms);
    }
  } catch {
    // ignore
  }
}
