import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import Draft from "@/pages/hub/offseason/Draft";
import DraftResults from "@/pages/hub/DraftResults";
import FreeAgencyRecap from "@/pages/hub/FreeAgencyRecap";
import TrainingCamp from "./pages/hub/TrainingCamp";
import Cutdowns from "./pages/hub/Cutdowns";
import PreseasonWeek from "./pages/hub/PreseasonWeek";
import RegularSeason from "./pages/hub/RegularSeason";
import Playcall from "./pages/Playcall";
import PlayerProfile from "./pages/hub/PlayerProfile";
import TradesPage from "./pages/hub/Trades";
import ReSignPage from "./pages/hub/ReSign";
import CapProjection from "@/pages/hub/CapProjection";
import TagCenter from "./pages/hub/TagCenter";
import DeadMoney from "./pages/hub/DeadMoney";
import Development from "./pages/hub/Development";
import InjuryReport from "./pages/hub/InjuryReport";
import CapBaseline from "./pages/hub/CapBaseline";
import RosterAudit from "./pages/hub/RosterAudit";
import AssistantHiring from "./pages/hub/AssistantHiring";
import Combine from "./pages/hub/Combine";
import Tampering from "./pages/hub/Tampering";
import PreDraft from "./pages/hub/PreDraft";
import SkillTree from "@/pages/SkillTree";

const queryClient = new QueryClient();

function PhaseGate({ children, requiredPhase }: { children: React.ReactNode; requiredPhase: string[] }) {
  const { state } = useGame();
  if (!requiredPhase.includes(state.phase)) {
    const phaseRoutes: Record<string, string> = {
      CREATE: "/",
      BACKGROUND: "/background",
      INTERVIEWS: "/interviews",
      OFFERS: "/offers",
      COORD_HIRING: "/coordinators",
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
      CREATE: "/",
      BACKGROUND: "/background",
      INTERVIEWS: "/interviews",
      OFFERS: "/offers",
      COORD_HIRING: "/coordinators",
    };
    return <Navigate to={phaseRoutes[state.phase] ?? "/"} replace />;
  }
  return <>{children}</>;
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
                <Route path="workouts" element={<PrivateWorkouts />} />
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate>} />
            <Route path="/background" element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
            <Route path="/interviews" element={<PhaseGate requiredPhase={["INTERVIEWS"]}><Interviews /></PhaseGate>} />
            <Route path="/offers" element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
            <Route path="/coordinators" element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />

            {/* Hub Routes wrapped in AppShell and HubGate */}
            <Route element={<HubGate><AppShell /></HubGate>}>
              <Route path="/hub" element={<Hub />} />
              <Route path="/staff/*" element={<StaffRoutes />} />
              <Route path="/roster/*" element={<RosterRoutes />} />
              <Route path="/contracts/*" element={<ContractsRoutes />} />
              <Route path="/strategy/*" element={<StrategyRoutes />} />
              <Route path="/hub/scouting/*" element={<ScoutingRoutes />} />
              <Route path="/scouting/*" element={<Navigate to="/hub/scouting" replace />} />
              <Route path="/hub/offseason/*" element={<OffseasonRoutes />} />
              <Route path="/news" element={<LeagueNews />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/free-agency/*" element={<FreeAgencyRoutes />} />
              <Route path="/re-sign/*" element={<ReSignRoutes />} />
              <Route path="/trades/*" element={<TradesRoutes />} />

              <Route path="/hub/trades" element={<TradesPage />} />
              <Route path="/hub/re-sign" element={<ReSignPage />} />

              <Route path="/hub/free-agency" element={<Navigate to="/free-agency" replace />} />
              
              {/* Other legacy/specific routes that might not fit the main buckets yet but need to be accessible */}
               <Route path="/hub/draft" element={<Draft />} />
               <Route path="/hub/draft-results" element={<DraftResults />} />
               <Route path="/hub/free-agency-recap" element={<FreeAgencyRecap />} />
               <Route path="/hub/training-camp" element={<TrainingCamp />} />
               <Route path="/hub/cutdowns" element={<Cutdowns />} />
               <Route path="/hub/preseason" element={<PreseasonWeek />} />
               <Route path="/hub/regular-season" element={<RegularSeason />} />
               <Route path="/hub/playcall" element={<Playcall />} />
               <Route path="/hub/player/:playerId" element={<PlayerProfile />} />
               <Route path="/hub/cap-projection" element={<CapProjection />} />
               <Route path="/hub/tag-center" element={<TagCenter />} />
               <Route path="/hub/dead-money" element={<DeadMoney />} />
               <Route path="/hub/development" element={<Development />} />
               <Route path="/hub/injury-report" element={<InjuryReport />} />
               <Route path="/hub/cap-baseline" element={<CapBaseline />} />
               <Route path="/hub/roster-audit" element={<RosterAudit />} />
               <Route path="/hub/assistant-hiring" element={<AssistantHiring />} />
               <Route path="/hub/combine" element={<Combine />} />
               <Route path="/hub/tampering" element={<Tampering />} />
               <Route path="/hub/pre-draft" element={<PreDraft />} />
               <Route path="/skill-tree" element={<SkillTree />} />

               <Route path="/hub/resign" element={<Navigate to="/hub/re-sign" replace />} />
               <Route path="/contracts/cap-baseline" element={<Navigate to="/hub/cap-baseline" replace />} />
               <Route path="/contracts/roster-audit" element={<Navigate to="/hub/roster-audit" replace />} />
               <Route path="/roster" element={<Navigate to="/roster/depth-chart" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
