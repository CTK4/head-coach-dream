import { Link, Outlet, useLocation } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/hub", label: "Hub" },
  { to: "/hub/assistant-hiring", label: "Staff" },
  { to: "/hub/roster", label: "Roster" },
  { to: "/hub/resign", label: "Re-sign" },
  { to: "/hub/combine", label: "Combine" },
  { to: "/hub/tampering", label: "Tampering" },
  { to: "/hub/free-agency", label: "Free Agency" },
  { to: "/hub/pre-draft", label: "Pre-Draft" },
  { to: "/hub/draft", label: "Draft" },
  { to: "/hub/training-camp", label: "Camp" },
  { to: "/hub/preseason", label: "Preseason" },
  { to: "/hub/cutdowns", label: "Cutdowns" },
  { to: "/hub/regular-season", label: "Regular Season" },
  { to: "/hub/finances", label: "Finances" },
];

const HubLayout = () => {
  const { state, dispatch } = useGame();
  const location = useLocation();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Franchise Hub</h1>
          <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
            Advance Stage
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}>
                <Button variant={active ? "default" : "secondary"} size="sm">
                  {l.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default HubLayout;
