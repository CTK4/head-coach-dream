import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

const baseLinkClass = "block rounded px-3 py-2 hover:bg-secondary";

const HubLayout = () => {
  const { state } = useGame();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.careerStage === "OFFSEASON_HUB") {
      const ok =
        location.pathname.startsWith("/hub/offseason") ||
        location.pathname.startsWith("/hub/staff") ||
        location.pathname.startsWith("/hub/assistant-hiring") ||
        location.pathname.startsWith("/hub/coord-hiring") ||
        location.pathname.startsWith("/hub/coordinators");
      if (!ok) navigate("/hub/offseason", { replace: true });
    }
  }, [state.careerStage, location.pathname, navigate]);

  const preseasonLocked = state.careerStage === "OFFSEASON_HUB" || state.careerStage === "TRAINING_CAMP";
  const regularLocked = state.careerStage !== "REGULAR_SEASON";

  return (
    <div className="min-h-screen">
      <div className="flex">
        <aside className="w-64 border-r p-4 space-y-2">
          <NavLink className={baseLinkClass} to="/hub/offseason">
            Offseason
          </NavLink>
          <NavLink className={baseLinkClass} to="/hub/assistant-hiring">
            Assistant Hiring
          </NavLink>
          <NavLink className={baseLinkClass} to="/hub/roster">
            Roster
          </NavLink>
          <NavLink className={baseLinkClass} to="/hub/draft">
            Draft
          </NavLink>
          <NavLink className={baseLinkClass} to="/hub/training-camp">
            Training Camp
          </NavLink>
          <NavLink
            className={`${baseLinkClass} ${preseasonLocked ? "opacity-50 pointer-events-none" : ""}`}
            to="/hub/preseason"
          >
            Preseason
          </NavLink>
          <NavLink
            className={`${baseLinkClass} ${regularLocked ? "opacity-50 pointer-events-none" : ""}`}
            to="/hub/regular-season"
          >
            Regular Season
          </NavLink>
          <NavLink className={baseLinkClass} to="/hub/playcall">
            Game
          </NavLink>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl font-bold">Franchise Hub</h1>
            <p className="text-sm text-muted-foreground">Career stage: {state.careerStage.replaceAll("_", " ")}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HubLayout;
