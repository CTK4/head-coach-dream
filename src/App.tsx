import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { GameProvider, useGame, type GameState } from "@/context/GameContext";
import { exportDebugBundle } from "@/lib/debugBundle";
import { getActiveSaveMetadata } from "@/lib/saveManager";
import { logError } from "@/lib/logger";
// Keep layout primitives and always-needed components eager
import { AppShell } from "@/components/layout/AppShell";
import OfferResultModalHost from "@/components/feedback/OfferResultModalHost";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTES } from "@/routes/appRoutes";
import { DEV_TOOLS_ENABLED, isDevToolsEnabled, type DevToolsEnv } from "@/dev/devToolsGate";
import { getUserTeamId } from "@/lib/userTeam";
import NotFound from "./pages/NotFound";
import Landing from "@/pages/Landing";
import RecoveryModePage from "@/pages/RecoveryModePage";
import StoryErrorScreen from "@/pages/story/StoryErrorScreen";

// ---------------------------------------------------------------------------
// Lazy-loaded page chunks — split by feature area for optimal caching.
// Each lazy() call becomes a separate JS chunk in the build output.
// ---------------------------------------------------------------------------

// Onboarding flow (only used once per save; safe to load on-demand)
const CreateCoach = lazy(() => import("./pages/CreateCoach"));
const ChooseBackground = lazy(() => import("./pages/ChooseBackground"));
const Offers = lazy(() => import("./pages/Offers"));
const CoordinatorHiring = lazy(() => import("./pages/CoordinatorHiring"));

// Pre-hub flows
const LoadSave = lazy(() => import("@/pages/LoadSave"));
const SaveModeSelect = lazy(() => import("@/pages/SaveModeSelect"));
const StoryInterview = lazy(() => import("@/pages/story/StoryInterview"));
const FreePlaySetup = lazy(() => import("@/pages/FreePlaySetup"));
const FiredScreen = lazy(() => import("@/pages/FiredScreen"));

// Hub main
const Hub = lazy(() => import("./pages/Hub"));

// Hub route groups (large feature sub-trees)
const StaffRoutes = lazy(() => import("@/pages/hub/StaffRoutes"));
const RosterRoutes = lazy(() => import("@/pages/hub/RosterRoutes"));
const ContractsRoutes = lazy(() => import("@/pages/hub/ContractsRoutes"));
const StrategyRoutes = lazy(() => import("@/pages/hub/StrategyRoutes"));
const OffseasonRoutes = lazy(() => import("@/pages/hub/offseason/OffseasonRoutes"));
const CoachOfficeRoutes = lazy(() => import("@/pages/hub/CoachOfficeRoutes"));
const FreeAgencyRoutes = lazy(() => import("@/pages/hub/PhaseSubsystemRoutes").then((m) => ({ default: m.FreeAgencyRoutes })));
const ReSignRoutes = lazy(() => import("@/pages/hub/PhaseSubsystemRoutes").then((m) => ({ default: m.ReSignRoutes })));
const TradesRoutes = lazy(() => import("@/pages/hub/PhaseSubsystemRoutes").then((m) => ({ default: m.TradesRoutes })));
const ProspectProfileScreen = lazy(() => import("@/pages/hub/PhaseSubsystemRoutes").then((m) => ({ default: m.ProspectProfileScreen })));

// Scouting sub-tree
const ScoutingLayout = lazy(() => import("@/pages/hub/scouting/ScoutingLayout"));
const ScoutingHome = lazy(() => import("@/pages/hub/scouting/ScoutingHome"));
const BigBoard = lazy(() => import("@/pages/hub/scouting/BigBoard"));
const ScoutingCombine = lazy(() => import("@/pages/hub/scouting/ScoutingCombine"));
const PrivateWorkouts = lazy(() => import("@/pages/hub/scouting/PrivateWorkouts"));
const ScoutingInterviews = lazy(() => import("@/pages/hub/scouting/ScoutingInterviews"));
const MedicalBoard = lazy(() => import("@/pages/hub/scouting/MedicalBoard"));
const ScoutAllocation = lazy(() => import("@/pages/hub/scouting/ScoutAllocation"));
const InSeasonScouting = lazy(() => import("@/pages/hub/scouting/InSeasonScouting"));

// Gameplay (heaviest runtime pages)
const Playcall = lazy(() => import("./pages/Playcall"));
const RegularSeason = lazy(() => import("./pages/hub/RegularSeason"));
const PreseasonWeek = lazy(() => import("./pages/hub/PreseasonWeek"));
const GameplanPage = lazy(() => import("@/pages/hub/Gameplan"));
const PlayoffsPage = lazy(() => import("@/pages/hub/Playoffs"));
const PlayoffBracketPage = lazy(() => import("@/pages/hub/PlayoffBracket"));
const PlayoffGamePage = lazy(() => import("@/pages/hub/PlayoffGame"));

// Schedule pages
const ScheduleHome = lazy(() => import("@/pages/hub/schedule/ScheduleHome"));
const WeekSlate = lazy(() => import("@/pages/hub/schedule/WeekSlate"));
const TeamSchedule = lazy(() => import("@/pages/hub/schedule/TeamSchedule"));
const GameDetails = lazy(() => import("@/pages/hub/schedule/GameDetails"));

// Transactions & contracts
const TradesPage = lazy(() => import("./pages/hub/Trades"));
const ReSignPage = lazy(() => import("./pages/hub/ReSign"));
const CapBaseline = lazy(() => import("./pages/hub/CapBaseline"));
const DraftResults = lazy(() => import("@/pages/hub/DraftResults"));
const FreeAgencyRecap = lazy(() => import("@/pages/hub/FreeAgencyRecap"));

// Informational / infrequent hub pages
const LeagueNews = lazy(() => import("./pages/hub/LeagueNews"));
const SettingsPage = lazy(() => import("./pages/hub/Settings"));
const StatsPage = lazy(() => import("./pages/hub/Stats"));
const TeamStrategy = lazy(() => import("./pages/hub/TeamStrategy"));
const OwnerRelations = lazy(() => import("./pages/hub/OwnerRelations"));
const ActivityLog = lazy(() => import("./pages/hub/ActivityLog"));
const FrontOffice = lazy(() => import("@/pages/hub/FrontOffice"));
const FiringMeter = lazy(() => import("@/pages/hub/FiringMeter"));
const PowerRankings = lazy(() => import("@/pages/hub/PowerRankings"));
const AnalyticsPage = lazy(() => import("@/pages/hub/Analytics"));
const HallOfFame = lazy(() => import("@/pages/hub/HallOfFame"));
const LeagueHistory = lazy(() => import("@/pages/hub/LeagueHistory"));
const SkillTree = lazy(() => import("@/pages/SkillTree"));
const PressFeedbackDemo = lazy(() => import("./pages/PressFeedbackDemo"));

const queryClient = new QueryClient();
const shouldEnableDevPanel = DEV_TOOLS_ENABLED;
const DevPanel = shouldEnableDevPanel ? lazy(() => import("@/dev/DevPanel")) : null;

export const isDevPanelEnabled = (env: DevToolsEnv) => isDevToolsEnabled(env);

export function DevPanelMount({
  env,
  PanelComponent,
}: {
  env: DevToolsEnv;
  PanelComponent: React.ComponentType;
}) {
  if (!isDevPanelEnabled(env)) return null;
  const Panel = PanelComponent;
  return <Panel />;
}

function PhaseGate({ children, requiredPhase }: { children: React.ReactNode; requiredPhase: string[] }) {
  const { state } = useGame();
  if (!requiredPhase.includes(state.phase)) {
    const phaseRoutes: Record<string, string> = { CREATE: "/onboarding", BACKGROUND: "/onboarding/background", INTERVIEWS: "/story/interview", OFFERS: "/onboarding/offers", COORD_HIRING: "/onboarding/coordinators", HUB: "/hub" };
    return <Navigate to={phaseRoutes[state.phase] ?? "/"} replace />;
  }
  return <>{children}</>;
}

function HubGate({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  if (state.phase !== "HUB") {
    const phaseRoutes: Record<string, string> = { CREATE: "/onboarding", BACKGROUND: "/onboarding/background", INTERVIEWS: "/story/interview", OFFERS: "/onboarding/offers", COORD_HIRING: "/onboarding/coordinators" };
    return <Navigate to={phaseRoutes[state.phase] ?? "/"} replace />;
  }
  // Redirect fired coaches away from hub to the fired/rehiring flow
  if (state.careerStage === "FIRED") return <Navigate to="/fired" replace />;
  if (state.careerStage === "REHIRING") return <Navigate to={ROUTES.storyInterview} replace />;
  return <>{children}</>;
}

function LegacyHubScoutingRedirect() {
  const params = useParams();
  const wildcard = params["*"];
  return <Navigate to={wildcard ? `/scouting/${wildcard}` : "/scouting"} replace />;
}

function LegacyHubOffseasonRedirect() {
  const params = useParams();
  const wildcard = params["*"];
  return <Navigate to={wildcard ? `/offseason/${wildcard}` : "/offseason"} replace />;
}

function LegacyHubPlayerRedirect() {
  const { playerId } = useParams();
  return <Navigate to={playerId ? `/roster/player/${playerId}` : "/roster/players"} replace />;
}

function OnboardingRouteGuard({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const hasStoryLock = state.storySetup?.teamLocked === true;
  if (!hasStoryLock && !state.acceptedOffer) {
    return <Navigate to={ROUTES.saveMode} replace />;
  }
  return <>{children}</>;
}

function RootEntry() {
  const { state } = useGame();
  const showMenu = typeof window !== "undefined" && sessionStorage.getItem("show_main_menu") === "1";
  if (showMenu) {
    sessionStorage.removeItem("show_main_menu");
    return <Landing />;
  }
  if (shouldRouteRootToHub(state)) return <Navigate to="/hub" replace />;
  return <Landing />;
}

export function shouldRouteRootToHub(state: Parameters<typeof getUserTeamId>[0]) {
  return state.phase === "HUB" && !!state.coach?.name && !!state.careerStage && !!getUserTeamId(state);
}

export function shouldRenderRecoveryMode(state: Pick<GameState, "recoveryNeeded">) {
  return state.recoveryNeeded === true;
}

function StoryRouteShell() {
  const [storyError, setStoryError] = useState<Error | null>(null);
  return <ErrorBoundary fallback={<StoryErrorScreen error={storyError} />} onError={(error) => setStoryError(error)}><StoryInterview /></ErrorBoundary>;
}

function ScoutingRoutes() {
  return <Routes><Route element={<ScoutingLayout />}><Route index element={<ScoutingHome />} /><Route path="big-board" element={<BigBoard />} /><Route path="combine" element={<ScoutingCombine />} /><Route path="prospect/:prospectId" element={<ProspectProfileScreen />} /><Route path="private-workouts" element={<PrivateWorkouts />} /><Route path="workouts" element={<Navigate to="/scouting/private-workouts" replace />} /><Route path="interviews" element={<ScoutingInterviews />} /><Route path="medical" element={<MedicalBoard />} /><Route path="allocation" element={<ScoutAllocation />} /><Route path="in-season" element={<InSeasonScouting />} /></Route></Routes>;
}

function AppRoutes() {
  const { state, dispatch } = useGame();
  const handleExportDebugBundle = () => exportDebugBundle({ state, saveMeta: getActiveSaveMetadata() });
  const handleResetToMainMenu = () => {
    try { dispatch({ type: "RESET" }); } catch { /* no-op */ }
    sessionStorage.setItem("show_main_menu", "1");
    window.location.href = "/";
  };

  return <ErrorBoundary onExportDebugBundle={handleExportDebugBundle} onResetToMainMenu={handleResetToMainMenu} onError={(error, errorInfo) => logError("ui.app_routes.crash", { phase: state.phase, saveId: getActiveSaveMetadata()?.saveId, season: state.season, week: state.week, meta: { message: error.message, stack: errorInfo.componentStack?.slice(0, 1000) } })}>
    <BrowserRouter>
      {DevPanel ? <Suspense fallback={null}><DevPanel /></Suspense> : null}
      <Suspense fallback={null}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingRouteGuard><PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate></OnboardingRouteGuard>} />
        <Route path="/onboarding/background" element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
                <Route path="/onboarding/offers" element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
        <Route path="/onboarding/coordinators" element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />
        <Route path={ROUTES.root} element={<RootEntry />} />
        <Route path={ROUTES.loadSave} element={<LoadSave />} />
        <Route path={ROUTES.saveMode} element={<SaveModeSelect />} />
        <Route path={ROUTES.storyInterview} element={<StoryRouteShell />} />
        <Route path={ROUTES.freePlaySetup} element={<FreePlaySetup />} />
        <Route path="/background" element={<Navigate to="/onboarding/background" replace />} />
                <Route path="/offers" element={<Navigate to="/onboarding/offers" replace />} />
        <Route path="/coordinators" element={<Navigate to="/onboarding/coordinators" replace />} />
        <Route element={<HubGate><AppShell /></HubGate>}>
          <Route path="/hub" element={<Hub />} /><Route path="/staff/*" element={<StaffRoutes />} /><Route path="/roster/*" element={<RosterRoutes />} /><Route path="/contracts/*" element={<ContractsRoutes />} /><Route path="/strategy/*" element={<StrategyRoutes />} /><Route path="/scouting/*" element={<ScoutingRoutes />} />
          <Route path="/hub/scouting/*" element={<LegacyHubScoutingRedirect />} /><Route path="/offseason/*" element={<OffseasonRoutes />} /><Route path="/hub/offseason/*" element={<LegacyHubOffseasonRedirect />} /><Route path="/news" element={<LeagueNews />} /><Route path="/hub/stats" element={<StatsPage />} /><Route path="/hub/activity" element={<ActivityLog />} /><Route path="/hub/owner-relations" element={<OwnerRelations />} /><Route path="/hub/team-strategy" element={<TeamStrategy />} /><Route path="/hub/front-office" element={<FrontOffice />} /><Route path="/hub/firing-meter" element={<FiringMeter />} /><Route path="/hub/power-rankings" element={<PowerRankings />} /><Route path="/coachs-office/*" element={<CoachOfficeRoutes />} /><Route path="/settings" element={<SettingsPage />} />
          <Route path="/free-agency/*" element={<FreeAgencyRoutes />} /><Route path="/re-sign/*" element={<ReSignRoutes />} /><Route path="/trades/*" element={<TradesRoutes />} /><Route path="/hub/trades" element={<TradesPage />} /><Route path="/hub/re-sign" element={<ReSignPage />} /><Route path="/hub/free-agency" element={<Navigate to="/free-agency" replace />} />
          <Route path="/hub/draft" element={<Navigate to="/offseason/draft" replace />} /><Route path="/hub/draft-results" element={<DraftResults />} /><Route path="/hub/free-agency-recap" element={<FreeAgencyRecap />} /><Route path="/hub/training-camp" element={<Navigate to="/offseason/training-camp" replace />} /><Route path="/hub/cutdowns" element={<Navigate to="/offseason/cutdowns" replace />} />
          <Route path="/hub/preseason" element={<PreseasonWeek />} /><Route path="/hub/regular-season" element={<RegularSeason />} /><Route path="/hub/gameplan" element={<GameplanPage />} /><Route path="/hub/playoffs" element={<PlayoffsPage />} /><Route path="/hub/playoffs/bracket" element={<PlayoffBracketPage />} /><Route path="/hub/playoffs/game/:id" element={<PlayoffGamePage />} /><Route path="/hub/schedule" element={<ScheduleHome />} /><Route path="/hub/schedule/week/:weekNumber" element={<WeekSlate />} /><Route path="/hub/schedule/team/:teamId" element={<TeamSchedule />} /><Route path="/hub/schedule/game/:gameKey" element={<GameDetails />} /><Route path="/hub/playcall" element={<Playcall />} /><Route path="/hub/player/:playerId" element={<LegacyHubPlayerRedirect />} /><Route path="/hub/cap-projection" element={<Navigate to="/contracts/cap-projection" replace />} /><Route path="/hub/tag-center" element={<Navigate to="/contracts/tag" replace />} /><Route path="/hub/dead-money" element={<Navigate to="/contracts/dead-money" replace />} /><Route path="/hub/development" element={<Navigate to="/roster/development" replace />} /><Route path="/hub/injury-report" element={<Navigate to="/roster/injury-report" replace />} /><Route path="/hub/cap-baseline" element={<Navigate to="/contracts/cap-baseline" replace />} /><Route path="/hub/roster-audit" element={<Navigate to="/roster/audit" replace />} /><Route path="/hub/assistant-hiring" element={<Navigate to="/staff/hire" replace />} /><Route path="/hub/coordinator-hiring" element={<CoordinatorHiring />} /><Route path="/hub/hall-of-fame" element={<HallOfFame />} /><Route path="/hub/league-history" element={<LeagueHistory />} /><Route path="/hub/analytics" element={<AnalyticsPage />} /><Route path="/hub/combine" element={<Navigate to="/offseason/combine" replace />} /><Route path="/hub/tampering" element={<Navigate to="/free-agency" replace />} /><Route path="/hub/pre-draft" element={<Navigate to="/offseason/pre-draft" replace />} /><Route path="/skill-tree" element={<SkillTree />} /><Route path="/hub/resign" element={<Navigate to="/hub/re-sign" replace />} /><Route path="/contracts/cap-baseline" element={<CapBaseline />} /><Route path="/contracts/roster-audit" element={<Navigate to="/roster/audit" replace />} /><Route path="/roster" element={<Navigate to="/roster/depth-chart" replace />} />
        </Route>
        <Route path="/fired" element={<FiredScreen />} />
        <Route path="/press-feedback-demo" element={<PressFeedbackDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  </ErrorBoundary>;
}

function AppContent() {
  const { state } = useGame();
  if (shouldRenderRecoveryMode(state)) {
    return <RecoveryModePage />;
  }
  return <>
    <OfferResultModalHost />
    <AppRoutes />
  </>;
}

const App = () => <QueryClientProvider client={queryClient}><TooltipProvider><Toaster /><Sonner /><GameProvider><AppContent /></GameProvider></TooltipProvider></QueryClientProvider>;

export default App;
