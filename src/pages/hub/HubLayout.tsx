import { Outlet, useLocation } from "react-router-dom";
import { HubShell } from "@/components/franchise-hub/HubShell";

const TITLES: Record<string, string> = {
  "/hub/assistant-hiring": "HIRE STAFF",
  "/hub/roster": "ROSTER",
  "/hub/depth-chart": "DEPTH CHART",
  "/hub/roster-audit": "ROSTER REVIEW",
  "/hub/combine": "COMBINE",
  "/hub/pre-draft": "PRE-DRAFT",
  "/hub/draft": "DRAFT",
  "/hub/finances": "FINANCES",
  "/hub/staff-management": "STAFF MANAGEMENT",
  "/hub/league-news": "LEAGUE NEWS",
  "/hub/trades": "TRADES",
  "/hub/tag-center": "TAG CENTER",
  "/hub/cap-baseline": "CAP BASELINE",
};

export default function HubLayout() {
  const location = useLocation();
  if (location.pathname === "/hub") return <Outlet />;
  return (
    <HubShell title={TITLES[location.pathname] ?? "FRANCHISE HUB"}>
      <Outlet />
    </HubShell>
  );
}
