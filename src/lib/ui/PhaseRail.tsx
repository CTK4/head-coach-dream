import { Link, useLocation } from "react-router-dom";
import { type AppRouteKey, routePath } from "@/lib/routes/appRoutes";

const PHASE_TABS: Array<{ label: string; routeKey: AppRouteKey }> = [
  { label: "Rookie Draft", routeKey: "draft" },
  { label: "Rookie Signings", routeKey: "rookieSignings" },
  { label: "Free Agency", routeKey: "freeAgency" },
  { label: "Training Camp", routeKey: "trainingCamp" },
  { label: "Preseason", routeKey: "preseason" },
  { label: "Season Start", routeKey: "seasonStart" },
];

export function PhaseRail() {
  const { pathname } = useLocation();

  return (
    <div>
      <div className="text-lg font-semibold tracking-wide">OFFSEASON ACTIVITIES</div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {PHASE_TABS.map((tab) => {
          const href = routePath(tab.routeKey);
          const active = pathname === href;
          return (
            <Link
              key={tab.routeKey}
              to={href}
              className={[
                "whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-semibold",
                active
                  ? "border-blue-500 bg-blue-600/20 text-blue-100"
                  : "border-slate-800 bg-slate-900/40 text-slate-200",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
