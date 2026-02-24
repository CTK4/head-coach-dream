import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/r2Assets";
import { useEffect, useState } from "react";

type PlayerAvatarProps = {
  playerId: string;
  name?: string;
  pos?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<PlayerAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
};

function posTint(pos?: string): string {
  const key = String(pos ?? "UNK").toUpperCase();
  if (["QB", "RB", "WR", "TE"].includes(key))
    return "bg-blue-500/20 text-white";
  if (["LT", "LG", "C", "RG", "RT", "OL"].includes(key))
    return "bg-amber-500/20 text-amber-100";
  if (["EDGE", "DT", "DL", "LB", "CB", "FS", "SS", "S"].includes(key))
    return "bg-emerald-500/20 text-emerald-100";
  if (["K", "P"].includes(key)) return "bg-violet-500/20 text-violet-100";
  return "bg-slate-500/20 text-slate-100";
}

export function PlayerAvatar({ playerId, name, pos, size = "md", className }: PlayerAvatarProps) {
  const [missing, setMissing] = useState(false);
  const avatarSrc = `/avatars/${playerId}.png`;

  useEffect(() => {
    setMissing(false);
  }, [playerId]);

  if (missing) {
    return (
      <div
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 font-semibold",
          SIZE_CLASS[size],
          posTint(pos),
          className,
        )}
        aria-label={`${name ?? playerId} avatar fallback`}
        title={name ?? playerId}
      >
        {getInitials(name, "?")}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={name ? `${name} avatar` : `${playerId} avatar`}
      className={cn("shrink-0 rounded-full border border-white/20 bg-white/5 object-cover", SIZE_CLASS[size], className)}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
    />
  );
}
