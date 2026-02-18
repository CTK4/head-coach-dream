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
import Roster from "./pages/Roster";
import Draft from "./pages/Draft";
import Playcall from "./pages/Playcall";
import NotFound from "./pages/NotFound";
import HubLayout from "./pages/hub/HubLayout";
import AssistantHiring from "./pages/hub/AssistantHiring";
import PreseasonWeek from "./pages/hub/PreseasonWeek";
import RegularSeason from "./pages/hub/RegularSeason";
import FreeAgency from "./pages/hub/FreeAgency";
import ResignPlayers from "./pages/hub/ResignPlayers";
import Combine from "./pages/hub/Combine";
import Tampering from "./pages/hub/Tampering";
import PreDraft from "./pages/hub/PreDraft";
import TrainingCamp from "./pages/hub/TrainingCamp";
import Cutdowns from "./pages/hub/Cutdowns";
import Finances from "./pages/hub/Finances";
import PlayerProfile from "./pages/hub/PlayerProfile";
import TagCenter from "./pages/hub/TagCenter";
import RosterAudit from "./pages/hub/RosterAudit";
import DepthChart from "./pages/hub/DepthChart";
import LeagueMenuPage from "@/pages/main/league-menu/page";
import SeasonPage from "@/pages/main/season/page";
import TimelinePage from "@/pages/main/timeline/page";
import NewsPage from "@/pages/main/news/page";
import SearchPage from "@/pages/main/search/page";
import StaffPage from "@/pages/main/staff/page";
import StaffHirePage from "@/pages/main/staff/hire/page";
import ScoutingPage from "@/pages/main/scouting/page";
import InjuriesPage from "@/pages/main/injuries/page";
import LockerRoomPage from "@/pages/main/locker-room/page";
import FinancesPage from "@/pages/main/finances/page";
import StatsPage from "@/pages/main/stats/page";
import TeamPage from "@/pages/main/team/page";
import TeamDepthChartPage from "@/pages/main/team/depth-chart/page";
import TeamTransactionsPage from "@/pages/main/team/transactions/page";
import FreeAgencyPage from "@/pages/main/free-agency/page";
import FreeAgencyPreviewPage from "@/pages/main/free-agency/preview/page";
import RookieSigningsPage from "@/pages/main/rookie-signings/page";
import RookieDraftPage from "@/pages/main/draft/page";
import DraftRoomPage from "@/pages/main/draft/room/page";
import TrainingCampPage from "@/pages/main/training-camp/page";
import PreseasonPage from "@/pages/main/preseason/page";
import SeasonStartPage from "@/pages/main/season-start/page";
import CoachHiringPage from "@/pages/main/coach-hiring/page";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/hub" replace />} />
            <Route path="/background" element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
            <Route path="/interviews" element={<PhaseGate requiredPhase={["INTERVIEWS"]}><Interviews /></PhaseGate>} />
            <Route path="/offers" element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
            <Route path="/coordinators" element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />
            <Route path="/create-coach" element={<PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate>} />

            <Route path="/hub" element={<HubGate><Hub /></HubGate>} />
            <Route path="/league-menu" element={<HubGate><LeagueMenuPage /></HubGate>} />
            <Route path="/season" element={<HubGate><SeasonPage /></HubGate>} />
            <Route path="/timeline" element={<HubGate><TimelinePage /></HubGate>} />
            <Route path="/news" element={<HubGate><NewsPage /></HubGate>} />
            <Route path="/search" element={<HubGate><SearchPage /></HubGate>} />
            <Route path="/staff" element={<HubGate><StaffPage /></HubGate>} />
            <Route path="/staff/hire" element={<HubGate><StaffHirePage /></HubGate>} />
            <Route path="/scouting" element={<HubGate><ScoutingPage /></HubGate>} />
            <Route path="/injuries" element={<HubGate><InjuriesPage /></HubGate>} />
            <Route path="/locker-room" element={<HubGate><LockerRoomPage /></HubGate>} />
            <Route path="/finances" element={<HubGate><FinancesPage /></HubGate>} />
            <Route path="/stats" element={<HubGate><StatsPage /></HubGate>} />
            <Route path="/team" element={<HubGate><TeamPage /></HubGate>} />
            <Route path="/team/depth-chart" element={<HubGate><TeamDepthChartPage /></HubGate>} />
            <Route path="/team/transactions" element={<HubGate><TeamTransactionsPage /></HubGate>} />
            <Route path="/free-agency" element={<HubGate><FreeAgencyPage /></HubGate>} />
            <Route path="/free-agency/preview" element={<HubGate><FreeAgencyPreviewPage /></HubGate>} />
            <Route path="/rookie-signings" element={<HubGate><RookieSigningsPage /></HubGate>} />
            <Route path="/draft" element={<HubGate><RookieDraftPage /></HubGate>} />
            <Route path="/draft/room" element={<HubGate><DraftRoomPage /></HubGate>} />
            <Route path="/training-camp" element={<HubGate><TrainingCampPage /></HubGate>} />
            <Route path="/preseason" element={<HubGate><PreseasonPage /></HubGate>} />
            <Route path="/season-start" element={<HubGate><SeasonStartPage /></HubGate>} />
            <Route path="/coach-hiring" element={<HubGate><CoachHiringPage /></HubGate>} />

            <Route path="/legacy-hub" element={<HubGate><HubLayout /></HubGate>}>
              <Route index element={<Hub />} />
              <Route path="assistant-hiring" element={<AssistantHiring />} />
              <Route path="roster" element={<Roster />} />
              <Route path="depth-chart" element={<DepthChart />} />
              <Route path="roster-audit" element={<RosterAudit />} />
              <Route path="resign" element={<ResignPlayers />} />
              <Route path="tag-center" element={<TagCenter />} />
              <Route path="combine" element={<Combine />} />
              <Route path="tampering" element={<Tampering />} />
              <Route path="free-agency" element={<FreeAgency />} />
              <Route path="pre-draft" element={<PreDraft />} />
              <Route path="draft" element={<Draft />} />
              <Route path="training-camp" element={<TrainingCamp />} />
              <Route path="preseason" element={<PreseasonWeek />} />
              <Route path="cutdowns" element={<Cutdowns />} />
              <Route path="regular-season" element={<RegularSeason />} />
              <Route path="finances" element={<Finances />} />
              <Route path="player/:playerId" element={<PlayerProfile />} />
              <Route path="playcall" element={<Playcall />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
