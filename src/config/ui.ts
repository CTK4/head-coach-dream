export const PHONE_MAX_W = 430;

const LS_PHONE_FRAME = "ui:phoneFrame";
const LS_DENSITY = "ui:density";

export function envPhoneLayoutEnabled() {
  return String(import.meta.env.VITE_PHONE_LAYOUT ?? "").trim() === "1";
}

export function envCompactEnabled() {
  return String(import.meta.env.VITE_MOBILE_DENSITY ?? "").trim() === "compact";
}

export function isLikelyPhone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 480px)").matches ?? false;
}

export function getPhoneFrameOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(LS_PHONE_FRAME);
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

export function setPhoneFrameOverride(v: boolean | null) {
  if (typeof window === "undefined") return;
  if (v === null) {
    window.localStorage.removeItem(LS_PHONE_FRAME);
    return;
  }
  window.localStorage.setItem(LS_PHONE_FRAME, v ? "1" : "0");
}

export type DensityMode = "auto" | "compact" | "comfortable";

export function getDensityOverride(): DensityMode {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem(LS_DENSITY);
  return v === "compact" || v === "comfortable" || v === "auto" ? v : "auto";
}

export function setDensityOverride(v: DensityMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_DENSITY, v);
}
