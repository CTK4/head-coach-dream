import { Link, Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

function setCapModeQuery(mode: "standard" | "postjune1") {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("capMode", mode);
  window.history.replaceState({}, "", url.toString());
}

const links = [
  { to: "/hub", label: "Hub" },
  { to: "/hub/assistant-hiring", label: "Staff" },
  { to: "/hub/roster", label: "Roster" },
  { to: "/hub/depth-chart", label: "Depth Chart" },
  { to: "/hub/roster-audit", label: "Audit" },
  { to: "/hub/resign", label: "Re-sign" },
  { to: "/hub/tag-center", label: "Tags" },
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
  { to: "/hub/cap-baseline", label: "Cap Baseline" },
];

const HubLayout = () => {
  const { state, dispatch } = useGame();
  const location = useLocation();
  const capMode = useMemo(() => (state.finances.postJune1Sim ? "postjune1" : "standard"), [state.finances.postJune1Sim]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Franchise Hub</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Cap Mode</Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Standard</span>
                <Switch
                  checked={!!state.finances.postJune1Sim}
                  onCheckedChange={() => {
                    const next = !state.finances.postJune1Sim;
                    dispatch({ type: "FINANCES_PATCH", payload: { postJune1Sim: next } });
                    setCapModeQuery(next ? "postjune1" : "standard");
                  }}
                />
                <span className="text-xs text-muted-foreground">Post–June 1</span>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{capMode}</Badge>
            </div>
          </div>
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
