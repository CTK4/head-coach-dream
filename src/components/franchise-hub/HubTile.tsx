import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export type HubTileProps = {
  title: string;
  subtitle?: string;
  cta: string;
  to: string;
  badgeCount?: number;
  cornerBubbleCount?: number;
};

export function HubTile({ title, subtitle, cta, to, badgeCount, cornerBubbleCount }: HubTileProps) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(to)} className="relative w-full text-left" aria-label={`Open ${title}`}>
      <Card
        className={[
          "relative h-full overflow-hidden rounded-xl border border-slate-300/15 bg-slate-950/35",
          "transition hover:bg-slate-950/45 active:scale-[0.99]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-950/10 to-slate-900/40" />
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-slate-200/5 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-indigo-400/5 blur-2xl" />
        </div>

        {typeof badgeCount === "number" ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-slate-300/15 bg-slate-950/40 px-2 py-1 text-xs text-slate-100">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/80" aria-hidden="true" />
            <span aria-label={`${badgeCount} notifications`}>{badgeCount}</span>
          </div>
        ) : null}

        {typeof cornerBubbleCount === "number" ? (
          <div
            className="absolute right-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white shadow"
            aria-label={`${cornerBubbleCount} unread`}
          >
            {cornerBubbleCount}
          </div>
        ) : null}

        <CardContent className="relative z-10 flex h-full flex-col justify-between gap-4 p-5">
          <div className="space-y-1">
            <div className="text-sm font-black tracking-[0.14em] text-slate-100">{title}</div>
            {subtitle ? <div className="text-xs text-slate-200/70">{subtitle}</div> : null}
          </div>

          <div className="mt-2">
            <div className="inline-flex w-full items-center justify-between rounded-lg border border-slate-300/15 bg-gradient-to-b from-indigo-500/20 to-slate-950/10 px-3 py-2">
              <span className="text-xs font-semibold tracking-[0.12em] text-slate-100">{cta}</span>
              <span className="text-slate-200/70" aria-hidden="true">
                →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
