import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { readSettings } from "@/lib/settings";

export type HubBadgeKind = "unread" | "task" | "cap" | "scouting" | "info";

function badgeClass(kind: HubBadgeKind | undefined): string {
  switch (kind) {
    case "unread":
      return "bg-accent text-black";
    case "task":
      return "bg-amber-400 text-black";
    case "cap":
      return "bg-violet-500 text-white";
    case "scouting":
      return "bg-cyan-400 text-black";
    case "info":
    default:
      return "bg-emerald-500 text-black";
  }
}

export type HubTileProps = {
  title: string;
  subtitle?: string;
  cta?: string;
  to: string;
  badgeCount?: number;
  cornerBubbleCount?: number;
  imageUrl?: string;
  badgeHint?: string;
  badgeKind?: HubBadgeKind;
  imageObjectPosition?: string;
};

export function HubTile({ title, subtitle, to, badgeCount, cornerBubbleCount, imageUrl, badgeHint, badgeKind, imageObjectPosition }: HubTileProps) {
  const navigate = useNavigate();
  const showTooltips = !!readSettings().showTooltips;
  const [imageHidden, setImageHidden] = useState(false);

  useEffect(() => {
    setImageHidden(false);
  }, [imageUrl]);

  return (
    <button type="button" onClick={() => navigate(to)} className="relative w-full text-left group" aria-label={`Open ${title}`}>
      <Card
        className={[
          "relative h-32 md:h-40 overflow-hidden rounded-xl border border-slate-300/15 bg-slate-950/35",
          "transition hover:border-slate-300/30 active:scale-[0.99]",
        ].join(" ")}
      >
        <div className="absolute inset-0 z-0">
          {imageUrl && !imageHidden ? (
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-70"
              style={{ objectPosition: imageObjectPosition ?? "50% 50%" }}
              onError={() => setImageHidden(true)}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-950/10 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        {typeof badgeCount === "number" && badgeCount > 0
          ? showTooltips && badgeHint
            ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(badgeKind)}`} aria-label={badgeHint}>
                      {badgeCount}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{badgeHint}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
            : (
              <div className={`absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(badgeKind)}`} title={badgeHint}>
                {badgeCount}
              </div>
            )
          : null}

        {typeof cornerBubbleCount === "number" && cornerBubbleCount > 0 ? (
          <div className="absolute right-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white shadow" aria-label={`${cornerBubbleCount} unread`}>
            {cornerBubbleCount}
          </div>
        ) : null}

        <CardContent className="relative z-10 flex h-full flex-col justify-end p-4">
          <div className="space-y-0.5">
            <div className="text-lg font-black tracking-wide text-slate-100 uppercase drop-shadow-md">{title}</div>
            {subtitle && <div className="text-xs text-slate-300 font-medium drop-shadow">{subtitle}</div>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </button>
  );
}
