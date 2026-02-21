import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", to: "/hub/scouting" },
  { label: "Big Board", to: "/hub/scouting/big-board" },
  { label: "Combine", to: "/hub/scouting/combine" },
  { label: "Workouts", to: "/hub/scouting/private-workouts" },
  { label: "Interviews", to: "/hub/scouting/interviews" },
  { label: "Medical", to: "/hub/scouting/medical" },
  { label: "Allocation", to: "/hub/scouting/allocation" },
  { label: "In-Season", to: "/hub/scouting/in-season" },
];

export default function ScoutingLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const isHome = loc.pathname === "/hub/scouting" || loc.pathname === "/hub/scouting/";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          {!isHome && (
            <button
              className="rounded border border-white/10 px-3 py-1 text-sm"
              onClick={() => nav("/hub/scouting")}
            >
              ←
            </button>
          )}
          <div className="font-semibold">Scouting</div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/hub/scouting"}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded border px-3 py-1 text-xs font-medium",
                  isActive
                    ? "border-sky-400 text-sky-200"
                    : "border-white/10 text-slate-400 hover:text-slate-200"
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
