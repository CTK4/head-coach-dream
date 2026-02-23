export type AssetKind =
  | "avatars"
  | "badges"
  | "icons"
  | "placeholders"
  | "utility";

const DEFAULT_R2_BASE_URLS: Record<AssetKind, string> = {
  avatars:
    "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/avatars",
  badges:
    "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/badges",
  icons:
    "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/icons",
  placeholders:
    "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/placeholders",
  utility:
    "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/utility",
};

const ENV_KEY_BY_KIND: Record<AssetKind, keyof ImportMetaEnv> = {
  avatars: "VITE_R2_AVATARS_BASE_URL",
  badges: "VITE_R2_BADGES_BASE_URL",
  icons: "VITE_R2_ICONS_BASE_URL",
  placeholders: "VITE_R2_PLACEHOLDERS_BASE_URL",
  utility: "VITE_R2_UTILITY_BASE_URL",
};

export function getR2BaseUrl(kind: AssetKind): string {
  const envKey = ENV_KEY_BY_KIND[kind];
  const configured = String(import.meta.env[envKey] ?? "").trim();
  return configured || DEFAULT_R2_BASE_URLS[kind];
}

export function joinUrl(base: string, path: string): string {
  const left = String(base ?? "").replace(/\/+$/, "");
  const right = String(path ?? "").replace(/^\/+/, "");
  if (!left) return right;
  if (!right) return left;
  return `${left}/${right}`;
}

export function buildR2Url(kind: AssetKind, filename: string): string {
  return joinUrl(getR2BaseUrl(kind), filename);
}

export function buildAvatarCandidates(playerId: string): string[] {
  const normalizedId = String(playerId ?? "").trim();
  const exts = ["jpg", "png", "webp"];

  return [
    ...exts.map((ext) => buildR2Url("avatars", `${normalizedId}.${ext}`)),
    ...exts.map((ext) => `/avatars/${normalizedId}.${ext}`),
  ];
}

export function getInitials(name?: string, fallback = "?"): string {
  const normalized = String(name ?? "").trim();
  if (!normalized) return fallback;
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  const picks = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return picks || fallback;
}
