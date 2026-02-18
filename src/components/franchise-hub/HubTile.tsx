import { Link } from "react-router-dom";
import { BadgePill } from "@/components/franchise-hub/BadgePill";
import { hubTheme } from "@/components/franchise-hub/theme";

type HubTileProps = {
  title: string;
  subtitle?: string;
  cta: string;
  to: string;
  badgeCount?: number;
  notificationCount?: number;
};

export function HubTile({ title, subtitle, cta, to, badgeCount, notificationCount }: HubTileProps) {
  return (
    <Link to={to} aria-label={`Open ${title}`} className={`${hubTheme.tileCard} ${hubTheme.tileDepth}`}>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-3xl font-bold leading-none tracking-wide text-slate-100">{title}</h3>
            {badgeCount ? <BadgePill count={badgeCount} /> : null}
          </div>
          {subtitle ? <p className="text-lg text-slate-200/95">{subtitle}</p> : null}
        </div>

        <div className="relative mt-5">
          {notificationCount && notificationCount > 0 ? (
            <span className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
              {notificationCount}
            </span>
          ) : null}
          <div className={hubTheme.ctaBar}>{cta}</div>
        </div>
      </div>
    </Link>
  );
}
