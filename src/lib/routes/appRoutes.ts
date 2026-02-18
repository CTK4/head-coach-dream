export type AppRouteKey =
  | "hub"
  | "leagueMenu"
  | "season"
  | "timeline"
  | "news"
  | "search"
  | "staff"
  | "staffHire"
  | "scouting"
  | "injuries"
  | "lockerRoom"
  | "finances"
  | "stats"
  | "team"
  | "teamDepthChart"
  | "teamTransactions"
  | "freeAgency"
  | "freeAgencyPreview"
  | "trainingCamp"
  | "preseason"
  | "seasonStart"
  | "rookieSignings"
  | "draft"
  | "draftRoom"
  | "coachHiring";

export type AppRoute = {
  key: AppRouteKey;
  path: string;
  title: string;
  description: string;
};

export const APP_ROUTES: AppRoute[] = [
  { key: "hub", path: "/hub", title: "Franchise Hub", description: "Offseason command center." },
  { key: "leagueMenu", path: "/league-menu", title: "League Menu", description: "Team switcher / league settings." },
  { key: "season", path: "/season", title: "Season", description: "Year selector and season overview." },
  { key: "timeline", path: "/timeline", title: "Timeline", description: "Full offseason/season calendar." },
  { key: "news", path: "/news", title: "News", description: "League-wide news and narrative feed." },
  { key: "search", path: "/search", title: "Search", description: "Global player and asset search." },
  { key: "staff", path: "/staff", title: "Coaching Staff", description: "Staff overview, schemes, budgets." },
  { key: "staffHire", path: "/staff/hire", title: "Hire Staff", description: "Coordinator/assistant hiring flow." },
  { key: "scouting", path: "/scouting", title: "Scouting", description: "Scouts, reports, board intel." },
  { key: "injuries", path: "/injuries", title: "Injuries", description: "Injury dashboard and rehab timeline." },
  { key: "lockerRoom", path: "/locker-room", title: "Locker Room", description: "Morale, chemistry, requests." },
  { key: "finances", path: "/finances", title: "Finances", description: "Cap, cash budget, ledger." },
  { key: "stats", path: "/stats", title: "Stats", description: "League/team/player stats and leaders." },
  { key: "team", path: "/team", title: "My Team", description: "Roster, contracts, depth chart access." },
  { key: "teamDepthChart", path: "/team/depth-chart", title: "Depth Chart", description: "Depth chart + auto-fill + reset to best." },
  { key: "teamTransactions", path: "/team/transactions", title: "Transactions", description: "Cuts, IR moves, waivers, signings." },
  { key: "freeAgency", path: "/free-agency", title: "Free Agency", description: "FA lists, offers, bidding stages." },
  { key: "freeAgencyPreview", path: "/free-agency/preview", title: "Free Agency Preview", description: "Early look at the FA class." },
  { key: "rookieSignings", path: "/rookie-signings", title: "Rookie Signings", description: "Draft picks signing and slotting." },
  { key: "draft", path: "/draft", title: "Rookie Draft", description: "Draft preparation and board." },
  { key: "draftRoom", path: "/draft/room", title: "Draft Room", description: "Live draft on-the-clock experience." },
  { key: "trainingCamp", path: "/training-camp", title: "Training Camp", description: "Camp roster cuts, battles, installs." },
  { key: "preseason", path: "/preseason", title: "Preseason", description: "Preseason games, evaluations, cuts." },
  { key: "seasonStart", path: "/season-start", title: "Season Start", description: "Week 1 readiness checklist." },
  { key: "coachHiring", path: "/coach-hiring", title: "Coach Hiring", description: "Head coach selection flow (special start states)." },
];

export function routePath(key: AppRouteKey): string {
  const found = APP_ROUTES.find((route) => route.key === key);
  if (!found) throw new Error(`Unknown route key: ${key}`);
  return found.path;
}
