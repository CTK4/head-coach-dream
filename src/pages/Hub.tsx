import {
  Briefcase,
  CalendarClock,
  ClipboardList,
  Globe,
  HandCoins,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Button } from "@/components/ui/button";
import HeaderBar from "@/components/hub/HeaderBar";
import StatusStrip from "@/components/hub/StatusStrip";
import ActivityStepper, { type ActivityStep } from "@/components/hub/ActivityStepper";
import DashboardCard from "@/components/hub/DashboardCard";
import BottomNav from "@/components/hub/BottomNav";

const activitySteps: ActivityStep[] = [
  { id: "rookie-draft", label: "Rookie Draft", icon: UserRoundPlus },
  { id: "rookie-signings", label: "Rookie Signings", icon: ClipboardList },
  { id: "free-agency", label: "Free Agency", icon: HandCoins },
  { id: "training-camp", label: "Training Camp", icon: Briefcase },
  { id: "preseason", label: "Preseason", icon: Globe },
  { id: "season-start", label: "Season Start", icon: CalendarClock },
];

const dashboardCards = [
  {
    eyebrow: "Team",
    title: "New Head Coach",
    subtitle: "Choose a new leader for your organization.",
    meta: [
      { label: "Status", value: "Decision Needed" },
      { label: "Priority", value: "Critical" },
    ],
    cta: "Decision Needed",
    backgroundClass: "bg-[url('/Cover.jpeg')]",
    featured: true,
  },
  {
    eyebrow: "Rookie Draft",
    title: "Rookie Draft",
    subtitle: "Finalize your board and lock in top targets.",
    meta: [
      { label: "Rounds", value: "1-7" },
      { label: "Begins In", value: "7 Hours" },
      { label: "Pick", value: "#23" },
      { label: "War Room", value: "Ready" },
    ],
    cta: "Begin Draft",
    backgroundClass: "bg-[url('/badges/Champion.jpeg')]",
  },
  {
    eyebrow: "Roster Management",
    title: "Depth Chart",
    subtitle: "Roster move recommendations are ready to review.",
    meta: [
      { label: "Roster Holes", value: "2 Positions" },
      { label: "Urgency", value: "Medium" },
    ],
    cta: "Explore",
    backgroundClass: "bg-[url('/badges/various.jpeg')]",
  },
  {
    eyebrow: "Market Intel",
    title: "Free Agency Preview",
    subtitle: "Scout top available free agents before the bidding starts.",
    meta: [
      { label: "Top 1", value: "C. Wallace • WR" },
      { label: "Top 2", value: "A. Ramsey • CB" },
      { label: "Top 3", value: "M. Jordan • HB" },
      { label: "Class Grade", value: "A" },
    ],
    cta: "Early Look",
    backgroundClass: "bg-[url('/badges/All_Pro.jpeg')]",
  },
];

const bottomNavItems = [
  { id: "home", label: "Home", icon: "home" as const },
  { id: "my-team", label: "My Team", icon: "team" as const, badge: 2 },
  { id: "stats", label: "Stats", icon: "stats" as const, badge: 3 },
  { id: "finances", label: "Finances", icon: "finances" as const },
];

const Hub = () => {
  const { state } = useGame();
  const navigate = useNavigate();

  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : null;

  if (!teamId || !team) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-xl">
        <p className="text-slate-200">No team assigned. Please complete the hiring process.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#0e2246_0%,#081124_38%,#04070f_100%)] pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,6,23,0.55)_100%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 pb-6 pt-4 sm:px-4 md:pt-6">
        <HeaderBar title="Franchise Hub" season={2026} teamLogo={team.logoKey ? `/icons/${team.logoKey}.png` : undefined} />
        <StatusStrip
          items={[
            { label: "Record", value: "10-7" },
            { label: "Phase", value: "Offseason" },
            { label: "Cap Room", value: "$17.6M" },
            { label: "Draft Pick", value: "#23" },
          ]}
        />
        <ActivityStepper steps={activitySteps} activeStep="rookie-draft" />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dashboardCards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </section>
      </div>

      <BottomNav items={bottomNavItems} activeItem="home" />
    </div>
  );
};

export default Hub;
