import { Link, Outlet, useLocation } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/hub", label: "Hub" },
  { to: "/hub/assistant-hiring", label: "Assistant Hiring" },
  { to: "/hub/roster", label: "Roster" },
  { to: "/hub/draft", label: "Draft" },
  { to: "/hub/preseason", label: "Preseason" },
  { to: "/hub/regular-season", label: "Regular Season" },
  { to: "/hub/playcall", label: "Game" },
];

const HubLayout = () => {
  const { state } = useGame();
  const location = useLocation();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Franchise Hub</h1>
          <p className="text-sm text-muted-foreground">Career stage: {state.careerStage.replaceAll("_", " ")}</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((item) => (
            <Button
              key={item.to}
              asChild
              variant={location.pathname === item.to ? "default" : "secondary"}
              size="sm"
            >
              <Link to={item.to}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
};

export default HubLayout;
