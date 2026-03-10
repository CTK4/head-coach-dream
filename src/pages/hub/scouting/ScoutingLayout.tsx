import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", to: "/scouting" },
  { label: "Big Board", to: "/scouting/big-board" },
  { label: "Combine", to: "/scouting/combine" },
  { label: "Workouts", to: "/scouting/private-workouts" },
  { label: "Interviews", to: "/scouting/interviews" },
  { label: "Medical", to: "/scouting/medical" },
  { label: "Allocation", to: "/scouting/allocation" },
  { label: "In-Season", to: "/scouting/in-season" },
];

export default function ScoutingLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const isHome = loc.pathname === "/scouting" || loc.pathname === "/scouting/";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          {!isHome && (
            <button
              className="rounded border border-white/10 px-3 py-1 text-sm"
              onClick={() => nav("/scouting")}
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
              end={tab.to === "/scouting"}
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
