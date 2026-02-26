import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import HallOfFame from "@/pages/hub/HallOfFame";
import LeagueHistory from "@/pages/hub/LeagueHistory";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { GameProvider, useGame } from "@/context/GameContext";
import CreateCoach from "./pages/CreateCoach";
import ChooseBackground from "./pages/ChooseBackground";
import Interviews from "./pages/Interviews";
import Offers from "./pages/Offers";
import CoordinatorHiring from "./pages/CoordinatorHiring";
import Hub from "./pages/Hub";
import NotFound from "./pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";
import StaffRoutes from "@/pages/hub/StaffRoutes";
import RosterRoutes from "@/pages/hub/RosterRoutes";
import ContractsRoutes from "@/pages/hub/ContractsRoutes";
import StrategyRoutes from "@/pages/hub/StrategyRoutes";
import LeagueNews from "./pages/hub/LeagueNews";
import SettingsPage from "./pages/hub/Settings";
import OffseasonRoutes from "@/pages/hub/offseason/OffseasonRoutes";
import ScoutingLayout from "@/pages/hub/scouting/ScoutingLayout";
import ScoutingHome from "@/pages/hub/scouting/ScoutingHome";
import BigBoard from "@/pages/hub/scouting/BigBoard";
import ScoutingCombine from "@/pages/hub/scouting/ScoutingCombine";
import PrivateWorkouts from "@/pages/hub/scouting/PrivateWorkouts";
import ScoutingInterviews from "@/pages/hub/scouting/ScoutingInterviews";
import MedicalBoard from "@/pages/hub/scouting/MedicalBoard";
import ScoutAllocation from "@/pages/hub/scouting/ScoutAllocation";
import InSeasonScouting from "@/pages/hub/scouting/InSeasonScouting";
import { FreeAgencyRoutes, ProspectProfileScreen, ReSignRoutes, TradesRoutes } from "@/pages/hub/PhaseSubsystemRoutes";

// Import other pages that might be needed or were present
import DraftResults from "@/pages/hub/DraftResults";
import FreeAgencyRecap from "@/pages/hub/FreeAgencyRecap";
import PreseasonWeek from "./pages/hub/PreseasonWeek";
import RegularSeason from "./pages/hub/RegularSeason";
import Playcall from "./pages/Playcall";
import TradesPage from "./pages/hub/Trades";
import ReSignPage from "./pages/hub/ReSign";
import CapBaseline from "./pages/hub/CapBaseline";
import SkillTree from "@/pages/SkillTree";
import StatsPage from "./pages/hub/Stats";
import TeamStrategy from "./pages/hub/TeamStrategy";
import OwnerRelations from "./pages/hub/OwnerRelations";
import ActivityLog from "./pages/hub/ActivityLog";
import PressFeedbackDemo from "./pages/PressFeedbackDemo";
import FrontOffice from "@/pages/hub/FrontOffice";
import CoachOfficeRoutes from "@/pages/hub/CoachOfficeRoutes";
import OfferResultModalHost from "@/components/feedback/OfferResultModalHost";
import InterviewRunner from "@/pages/InterviewRunner";
import Landing from "@/pages/Landing";
import LoadSave from "@/pages/LoadSave";
import SaveModeSelect from "@/pages/SaveModeSelect";
import StoryInterview from "@/pages/story/StoryInterview";
import FreePlaySetup from "@/pages/FreePlaySetup";
import StoryErrorScreen from "@/pages/story/StoryErrorScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTES } from "@/routes/appRoutes";
import { useState } from "react";

const queryClient = new QueryClient();

const shouldEnableDevPanel = import.meta.env.DEV || (typeof window !== "undefined" && localStorage.getItem("DEV_PANEL") === "1");
const DevPanel = shouldEnableDevPanel ? lazy(() => import("@/dev/DevPanel")) : null;

function PhaseGate({ children, requiredPhase }: { children: React.ReactNode; requiredPhase: string[] }) {
  const { state } = useGame();
  if (!requiredPhase.includes(state.phase)) {
    const phaseRoutes: Record<string, string> = {
      CREATE: "/onboarding",
      BACKGROUND: "/onboarding/background",
      INTERVIEWS: "/onboarding/interviews",
      OFFERS: "/onboarding/offers",
      COORD_HIRING: "/onboarding/coordinators",
      HUB: "/hub",
    };
    return <Navigate to={phaseRoutes[state.phase] ?? "/"} replace />;
  }
  return <>{children}</>;
}

function HubGate({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  if (state.phase !== "HUB") {
    const phaseRoutes: Record<string, string> = {
      CREATE: "/onboarding",
      BACKGROUND: "/onboarding/background",
      INTERVIEWS: "/onboarding/interviews",
      OFFERS: "/onboarding/offers",
      COORD_HIRING: "/onboarding/coordinators",
    };
    return <Navigate to={phaseRoutes[state.phase] ?? "/"} replace />;
  }
  return <>{children}</>;
}

function LegacyHubScoutingRedirect() {
  const params = useParams();
  const suffix = params["*"] ? `/${params["*"]}` : "";
  return <Navigate to={`/scouting${suffix}`} replace />;
}

function LegacyHubOffseasonRedirect() {
  const params = useParams();
  const suffix = params["*"] ? `/${params["*"]}` : "";
  return <Navigate to={`/offseason${suffix}`} replace />;
}

function LegacyHubPlayerRedirect() {
  const { playerId } = useParams();
  return <Navigate to={playerId ? `/roster/player/${playerId}` : "/roster/players"} replace />;
}

function RootEntry() {
  const { state } = useGame();
  const showMenu = typeof window !== "undefined" && sessionStorage.getItem("show_main_menu") === "1";
  if (showMenu) {
    sessionStorage.removeItem("show_main_menu");
    return <Landing />;
  }
  if (state.phase === "HUB" && state.coach?.name && state.careerStage) {
    return <Navigate to="/hub" replace />;
  }
  return <Landing />;
}

function StoryRouteShell() {
  const [storyError, setStoryError] = useState<Error | null>(null);

  return (
    <ErrorBoundary fallback={<StoryErrorScreen error={storyError} />} onError={(error) => setStoryError(error)}>
      <StoryInterview />
    </ErrorBoundary>
  );
}

// Scouting Routes Wrapper
function ScoutingRoutes() {
    return (
        <Routes>
             <Route element={<ScoutingLayout />}>
                <Route index element={<ScoutingHome />} />
                <Route path="big-board" element={<BigBoard />} />
                <Route path="combine" element={<ScoutingCombine />} />
                <Route path="prospect/:prospectId" element={<ProspectProfileScreen />} />
                <Route path="private-workouts" element={<PrivateWorkouts />} />
                <Route path="workouts" element={<Navigate to="/scouting/private-workouts" replace />} />
                <Route path="interviews" element={<ScoutingInterviews />} />
                <Route path="medical" element={<MedicalBoard />} />
                <Route path="allocation" element={<ScoutAllocation />} />
                <Route path="in-season" element={<InSeasonScouting />} />
             </Route>
        </Routes>
    )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <OfferResultModalHost />
        <BrowserRouter>
          {DevPanel ? <Suspense fallback={null}><DevPanel /></Suspense> : null}
          <Routes>
            <Route path="/onboarding" element={<PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate>} />
            <Route path="/onboarding/background" element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
            <Route path="/onboarding/interviews" element={<PhaseGate requiredPhase={["INTERVIEWS"]}><Interviews /></PhaseGate>} />
            <Route path="/onboarding/offers" element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
            <Route path="/onboarding/coordinators" element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />

            <Route path={ROUTES.root} element={<RootEntry />} />
            <Route path={ROUTES.loadSave} element={<LoadSave />} />
            <Route path={ROUTES.saveMode} element={<SaveModeSelect />} />
            <Route path={ROUTES.storyInterview} element={<StoryRouteShell />} />
            <Route path={ROUTES.freePlaySetup} element={<FreePlaySetup />} />
            <Route path="/background" element={<Navigate to="/onboarding/background" replace />} />
            <Route path="/interviews" element={<Navigate to="/onboarding/interviews" replace />} />
            <Route path="/offers" element={<Navigate to="/onboarding/offers" replace />} />
            <Route path="/coordinators" element={<Navigate to="/onboarding/coordinators" replace />} />

            {/* Hub Routes wrapped in AppShell and HubGate */}
            <Route element={<HubGate><AppShell /></HubGate>}>
              <Route path="/hub" element={<Hub />} />
              <Route path="/staff/*" element={<StaffRoutes />} />
              <Route path="/roster/*" element={<RosterRoutes />} />
              <Route path="/contracts/*" element={<ContractsRoutes />} />
              <Route path="/strategy/*" element={<StrategyRoutes />} />
              <Route path="/scouting/*" element={<ScoutingRoutes />} />
              <Route path="/hub/scouting/*" element={<LegacyHubScoutingRedirect />} />
              <Route path="/offseason/*" element={<OffseasonRoutes />} />
              <Route path="/hub/offseason/*" element={<LegacyHubOffseasonRedirect />} />
              <Route path="/news" element={<LeagueNews />} />
              <Route path="/hub/stats" element={<StatsPage />} />
              <Route path="/hub/activity" element={<ActivityLog />} />
              <Route path="/hub/owner-relations" element={<OwnerRelations />} />
              <Route path="/hub/team-strategy" element={<TeamStrategy />} />
              <Route path="/hub/front-office" element={<FrontOffice />} />
              <Route path="/coachs-office/*" element={<CoachOfficeRoutes />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/free-agency/*" element={<FreeAgencyRoutes />} />
              <Route path="/re-sign/*" element={<ReSignRoutes />} />
              <Route path="/trades/*" element={<TradesRoutes />} />

              <Route path="/hub/trades" element={<TradesPage />} />
              <Route path="/hub/re-sign" element={<ReSignPage />} />

              <Route path="/hub/free-agency" element={<Navigate to="/free-agency" replace />} />
              
              {/* Other legacy/specific routes that might not fit the main buckets yet but need to be accessible */}
               <Route path="/hub/draft" element={<Navigate to="/offseason/draft" replace />} />
               <Route path="/hub/draft-results" element={<DraftResults />} />
               <Route path="/hub/free-agency-recap" element={<FreeAgencyRecap />} />
               <Route path="/hub/training-camp" element={<Navigate to="/offseason/training-camp" replace />} />
               <Route path="/hub/cutdowns" element={<Navigate to="/offseason/cutdowns" replace />} />
               <Route path="/hub/preseason" element={<PreseasonWeek />} />
               <Route path="/hub/regular-season" element={<RegularSeason />} />
               <Route path="/hub/playcall" element={<Playcall />} />
               <Route path="/hub/player/:playerId" element={<LegacyHubPlayerRedirect />} />
               <Route path="/hub/cap-projection" element={<Navigate to="/contracts/cap-projection" replace />} />
               <Route path="/hub/tag-center" element={<Navigate to="/contracts/tag" replace />} />
               <Route path="/hub/dead-money" element={<Navigate to="/contracts/dead-money" replace />} />
               <Route path="/hub/development" element={<Navigate to="/roster/development" replace />} />
               <Route path="/hub/injury-report" element={<Navigate to="/roster/injury-report" replace />} />
               <Route path="/hub/cap-baseline" element={<Navigate to="/contracts/cap-baseline" replace />} />
               <Route path="/hub/roster-audit" element={<Navigate to="/roster/audit" replace />} />
               <Route path="/hub/assistant-hiring" element={<Navigate to="/staff/hire" replace />} />
               <Route path="/hub/hall-of-fame" element={<HallOfFame />} />
               <Route path="/hub/league-history" element={<LeagueHistory />} />
               <Route path="/hub/combine" element={<Navigate to="/offseason/combine" replace />} />
               <Route path="/hub/tampering" element={<Navigate to="/offseason/tampering" replace />} />
               <Route path="/hub/pre-draft" element={<Navigate to="/offseason/pre-draft" replace />} />
               <Route path="/skill-tree" element={<SkillTree />} />

               <Route path="/hub/resign" element={<Navigate to="/hub/re-sign" replace />} />
               <Route path="/contracts/cap-baseline" element={<CapBaseline />} />
               <Route path="/contracts/roster-audit" element={<Navigate to="/roster/audit" replace />} />
               <Route path="/roster" element={<Navigate to="/roster/depth-chart" replace />} />
            </Route>

            <Route path="/press-feedback-demo" element={<PressFeedbackDemo />} />
            <Route path="/interview/:teamId" element={<InterviewRunner />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
