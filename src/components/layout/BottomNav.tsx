import { Link, useLocation } from "react-router-dom";
import { Home, Users, Search, Briefcase, Lightbulb, Handshake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGame } from "@/context/GameContext";

export function BottomNav() {
  const { state } = useGame();
  const location = useLocation();
  const path = location.pathname;
  const isFreeAgency = state.careerStage === "FREE_AGENCY";
  const isResign = state.careerStage === "RESIGN";
  const isRegularSeason = state.careerStage === "REGULAR_SEASON";

  const isActive = (route: string) => {
    if (route === "/hub" && path === "/hub") return true;
    if (route !== "/hub" && path.startsWith(route)) return true;
    return false;
  };

  const navItems = [
    { label: "Home", route: "/hub", icon: Home },
    { label: "Team", route: "/roster", icon: Users },
    { label: "Staff", route: "/staff", icon: Briefcase },
    { label: "Scouting", route: "/scouting", icon: Search },
    {
      label: isFreeAgency ? "Agency" : isRegularSeason ? "Trades" : isResign ? "Re-Sign" : "Strategy",
      route: isFreeAgency ? "/free-agency" : isRegularSeason ? "/trades" : isResign ? "/re-sign" : "/strategy",
      icon: isFreeAgency ? Sparkles : isRegularSeason ? Handshake : isResign ? Handshake : Lightbulb,
      hot: isFreeAgency || isRegularSeason || isResign,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 pb-safe backdrop-blur-lg">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <Link
            key={item.route}
            to={item.route}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[64px]",
              isActive(item.route) ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            {item.hot ? <span className="text-[9px] text-amber-300">HOT</span> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
