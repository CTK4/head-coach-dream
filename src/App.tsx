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
import DraftResults from "@/pages/hub/DraftResults";
import TrainingCamp from "./pages/hub/TrainingCamp";
import Cutdowns from "./pages/hub/Cutdowns";
import Finances from "./pages/hub/Finances";
import PlayerProfile from "./pages/hub/PlayerProfile";
import TagCenter from "./pages/hub/TagCenter";
import RosterAudit from "./pages/hub/RosterAudit";
import DepthChart from "./pages/hub/DepthChart";
import CapBaseline from "@/pages/hub/CapBaseline";
import TradeHub from "./pages/hub/TradeHub";
import DraftOrderDebug from "./pages/hub/DraftOrderDebug";
import StaffManagement from "./pages/hub/StaffManagement";
import LeagueNews from "./pages/hub/LeagueNews";

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
            <Route path="/" element={<PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate>} />
            <Route path="/background" element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
            <Route path="/interviews" element={<PhaseGate requiredPhase={["INTERVIEWS"]}><Interviews /></PhaseGate>} />
            <Route path="/offers" element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
            <Route path="/coordinators" element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />

            <Route path="/hub" element={<HubGate><HubLayout /></HubGate>}>
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
              <Route path="trades" element={<TradeHub />} />
              <Route path="staff-management" element={<StaffManagement />} />
              <Route path="league-news" element={<LeagueNews />} />
              <Route path="pre-draft" element={<PreDraft />} />
              <Route path="draft" element={<Draft />} />
              <Route path="draft-results" element={<DraftResults />} />
              <Route path="training-camp" element={<TrainingCamp />} />
              <Route path="preseason" element={<PreseasonWeek />} />
              <Route path="cutdowns" element={<Cutdowns />} />
              <Route path="regular-season" element={<RegularSeason />} />
              <Route path="finances" element={<Finances />} />
              <Route path="cap-baseline" element={<CapBaseline />} />
              <Route path="player/:playerId" element={<PlayerProfile />} />
              <Route path="playcall" element={<Playcall />} />
              {import.meta.env.DEV ? <Route path="draft-order-debug" element={<DraftOrderDebug />} /> : null}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
