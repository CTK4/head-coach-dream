export type AvatarEntity = {
  id: string;
  name?: string;
  type: "player" | "personnel";
  avatarUrl?: string;
};

function stableSeed(parts: Array<string | undefined | null>): string {
  const raw = parts.filter(Boolean).join("|").trim();
  return encodeURIComponent(raw || "unknown");
}

export function avatarSeedFor(entity: AvatarEntity): string {
  return stableSeed([entity.type, entity.id, entity.name]);
}

export function diceBearUrl(seed: string, style: "personas" | "lorelei" = "personas"): string {
  const backgroundColor = ["0b1220", "111827", "0f172a", "0b1020"].join(",");
  const query = new URLSearchParams({
    seed,
    radius: "8",
    backgroundColor,
    flip: "false",
  });

  return `https://api.dicebear.com/9.x/${style}/svg?${query.toString()}`;
}

export function avatarUrlFor(entity: AvatarEntity): string {
  if (entity.avatarUrl) return entity.avatarUrl;
  const seed = avatarSeedFor(entity);
  return diceBearUrl(seed, "personas");
}
