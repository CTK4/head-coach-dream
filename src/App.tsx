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
import Offseason from "./pages/hub/Offseason";
import Roster from "./pages/Roster";
import Draft from "./pages/Draft";
import Playcall from "./pages/Playcall";
import NotFound from "./pages/NotFound";
import HubLayout from "./pages/hub/HubLayout";
import AssistantHiring from "./pages/hub/AssistantHiring";
import PreseasonWeek from "./pages/hub/PreseasonWeek";
import RegularSeason from "./pages/hub/RegularSeason";
import Resigning from "@/pages/hub/offseason/Resigning";
import Combine from "@/pages/hub/offseason/Combine";
import Tampering from "@/pages/hub/offseason/Tampering";
import OffseasonFreeAgency from "@/pages/hub/offseason/FreeAgency";
import FreeAgency from "@/pages/hub/FreeAgency";
import PlayerProfile from "@/pages/hub/PlayerProfile";
import PreDraft from "@/pages/hub/offseason/PreDraft";
import OffseasonDraft from "@/pages/hub/offseason/Draft";
import OffseasonTrainingCamp from "@/pages/hub/offseason/TrainingCamp";
import TrainingCamp from "@/pages/hub/TrainingCamp";
import PreseasonStep from "@/pages/hub/offseason/Preseason";
import CutDowns from "@/pages/hub/offseason/CutDowns";
import Finance from "@/pages/hub/Finance";
import DepthChart from "@/pages/hub/DepthChart";
import StaffManagement from "@/pages/hub/StaffManagement";
import FiringMeter from "@/pages/hub/FiringMeter";

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
              <Route index element={<Navigate to="/hub/offseason" replace />} />
              <Route path="offseason" element={<Offseason />} />
              <Route path="offseason/resigning" element={<Resigning />} />
              <Route path="offseason/combine" element={<Combine />} />
              <Route path="offseason/tampering" element={<Tampering />} />
              <Route path="offseason/free-agency" element={<OffseasonFreeAgency />} />
              <Route path="offseason/pre-draft" element={<PreDraft />} />
              <Route path="offseason/draft" element={<OffseasonDraft />} />
              <Route path="offseason/training-camp" element={<OffseasonTrainingCamp />} />
              <Route path="offseason/preseason" element={<PreseasonStep />} />
              <Route path="offseason/cut-downs" element={<CutDowns />} />
              <Route path="home" element={<Hub />} />
              <Route path="assistant-hiring" element={<AssistantHiring />} />
              <Route path="roster" element={<Roster />} />
              <Route path="draft" element={<Draft />} />
              <Route path="training-camp" element={<TrainingCamp />} />
              <Route path="depth-chart" element={<DepthChart />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="finance" element={<Finance />} />
              <Route path="firing-meter" element={<FiringMeter />} />
              <Route path="preseason" element={<PreseasonWeek />} />
              <Route path="regular-season" element={<RegularSeason />} />
              <Route path="free-agency" element={<FreeAgency />} />
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
