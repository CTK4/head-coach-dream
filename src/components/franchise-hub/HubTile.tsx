import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export type HubTileProps = {
  title: string;
  subtitle?: string;
  cta?: string;
  to: string;
  badgeCount?: number;
  cornerBubbleCount?: number;
  imageUrl?: string; 
};

export function HubTile({ title, subtitle, cta, to, badgeCount, cornerBubbleCount, imageUrl }: HubTileProps) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(to)} className="relative w-full text-left group" aria-label={`Open ${title}`}>
      <Card
        className={[
          "relative h-32 md:h-40 overflow-hidden rounded-xl border border-slate-300/15 bg-slate-950/35",
          "transition hover:border-slate-300/30 active:scale-[0.99]",
        ].join(" ")}
      >
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0">
             {imageUrl ? (
                 <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500" />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800/30 via-slate-950/10 to-slate-900/40" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        {/* Badges */}
        {typeof badgeCount === "number" && badgeCount > 0 ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-slate-300/15 bg-slate-950/40 px-2 py-1 text-xs text-slate-100">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/80" aria-hidden="true" />
            <span aria-label={`${badgeCount} notifications`}>{badgeCount}</span>
          </div>
        ) : null}

        {typeof cornerBubbleCount === "number" && cornerBubbleCount > 0 ? (
          <div
            className="absolute right-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white shadow"
            aria-label={`${cornerBubbleCount} unread`}
          >
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
