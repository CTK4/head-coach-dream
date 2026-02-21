import { useMemo, useState } from "react";
import { avatarUrlFor, avatarSeedFor, type AvatarEntity } from "@/lib/avatar";

function initials(name?: string) {
  const normalized = (name ?? "").trim();
  if (!normalized) return "—";
  const parts = normalized.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({
  entity,
  size = 44,
  className = "",
  variant = "plain",
}: {
  entity: AvatarEntity;
  size?: number;
  className?: string;
  variant?: "plain" | "raw";
}) {
  const [failed, setFailed] = useState(false);
  const seed = useMemo(() => avatarSeedFor(entity), [entity]);
  const src = useMemo(() => avatarUrlFor(entity), [entity]);

  if (failed) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-md border border-slate-300/15 bg-slate-950/30 text-xs font-bold text-slate-100 ${className}`}
        style={{ width: size, height: size }}
        title={entity.name ?? entity.id}
        aria-label={`Avatar ${entity.name ?? entity.id}`}
      >
        {initials(entity.name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={entity.name ?? "Avatar"}
      className={`rounded-md border border-slate-300/15 bg-slate-950/20 object-cover ${className}`}
      style={{
        filter: variant === "plain" ? "grayscale(0.25) saturate(0.85) contrast(0.98) brightness(0.98)" : undefined,
      }}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      data-seed={seed}
    />
  );
}
