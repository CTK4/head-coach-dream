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

// Query client remains mounted for incremental adoption of server-state hooks.
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
    const phaseRoutes: Record<string, string> = {
      CREATE: ROUTES.phase.create,
      BACKGROUND: ROUTES.phase.background,
      INTERVIEWS: ROUTES.phase.interviews,
      OFFERS: ROUTES.phase.offers,
      COORD_HIRING: ROUTES.phase.coordinatorHiring,
      HUB: ROUTES.phase.hub,
    };
    return <Navigate to={phaseRoutes[state.phase] ?? ROUTES.root} replace />;
  }
  return <>{children}</>;
}

function HubGate({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  if (state.phase !== "HUB") {
    const phaseRoutes: Record<string, string> = {
      CREATE: ROUTES.phase.create,
      BACKGROUND: ROUTES.phase.background,
      INTERVIEWS: ROUTES.phase.interviews,
      OFFERS: ROUTES.phase.offers,
      COORD_HIRING: ROUTES.phase.coordinatorHiring,
    };
    return <Navigate to={phaseRoutes[state.phase] ?? ROUTES.root} replace />;
  }
  // Redirect fired coaches away from hub to the fired/rehiring flow
  if (state.careerStage === "FIRED") return <Navigate to={ROUTES.fired} replace />;
  if (state.careerStage === "REHIRING") return <Navigate to={ROUTES.storyInterview} replace />;
  return <>{children}</>;
}

function LegacyHubScoutingRedirect() {
  const params = useParams();
  const wildcard = params["*"];
  return <Navigate to={ROUTES.helpers.scoutingWildcard(wildcard)} replace />;
}

function LegacyHubOffseasonRedirect() {
  const params = useParams();
  const wildcard = params["*"];
  return <Navigate to={ROUTES.helpers.offseasonWildcard(wildcard)} replace />;
}

function LegacyHubPlayerRedirect() {
  const { playerId } = useParams();
  return <Navigate to={playerId ? ROUTES.helpers.rosterPlayer(playerId) : ROUTES.roster.players} replace />;
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
  if (shouldRouteRootToHub(state)) return <Navigate to={ROUTES.hub} replace />;
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
  return <Routes><Route element={<ScoutingLayout />}><Route index element={<ScoutingHome />} /><Route path="big-board" element={<BigBoard />} /><Route path="combine" element={<ScoutingCombine />} /><Route path="prospect/:prospectId" element={<ProspectProfileScreen />} /><Route path="private-workouts" element={<PrivateWorkouts />} /><Route path="workouts" element={<Navigate to={ROUTES.scouting.privateWorkouts} replace />} /><Route path="interviews" element={<ScoutingInterviews />} /><Route path="medical" element={<MedicalBoard />} /><Route path="allocation" element={<ScoutAllocation />} /><Route path="in-season" element={<InSeasonScouting />} /></Route></Routes>;
}

function AppRoutes() {
  const { state, dispatch } = useGame();
  const handleExportDebugBundle = () => exportDebugBundle({ state, saveMeta: getActiveSaveMetadata() });
  const handleResetToMainMenu = () => {
    try { dispatch({ type: "RESET" }); } catch { /* no-op */ }
    sessionStorage.setItem("show_main_menu", "1");
    window.location.href = ROUTES.root;
  };

  return <ErrorBoundary onExportDebugBundle={handleExportDebugBundle} onResetToMainMenu={handleResetToMainMenu} onError={(error, errorInfo) => logError("ui.app_routes.crash", { phase: state.phase, saveId: getActiveSaveMetadata()?.saveId, season: state.season, week: state.week, meta: { message: error.message, stack: errorInfo.componentStack?.slice(0, 1000) } })}>
    <BrowserRouter>
      {DevPanel ? <Suspense fallback={null}><DevPanel /></Suspense> : null}
      <Suspense fallback={null}>
      <Routes>
        <Route path={ROUTES.onboarding} element={<OnboardingRouteGuard><PhaseGate requiredPhase={["CREATE"]}><CreateCoach /></PhaseGate></OnboardingRouteGuard>} />
        <Route path={ROUTES.onboardingBackground} element={<PhaseGate requiredPhase={["BACKGROUND"]}><ChooseBackground /></PhaseGate>} />
                <Route path={ROUTES.onboardingOffers} element={<PhaseGate requiredPhase={["OFFERS"]}><Offers /></PhaseGate>} />
        <Route path={ROUTES.onboardingCoordinators} element={<PhaseGate requiredPhase={["COORD_HIRING"]}><CoordinatorHiring /></PhaseGate>} />
        <Route path={ROUTES.root} element={<RootEntry />} />
        <Route path={ROUTES.loadSave} element={<LoadSave />} />
        <Route path={ROUTES.saveMode} element={<SaveModeSelect />} />
        <Route path={ROUTES.storyInterview} element={<StoryRouteShell />} />
        <Route path={ROUTES.freePlaySetup} element={<FreePlaySetup />} />
        <Route path={ROUTES.legacy.background} element={<Navigate to={ROUTES.onboardingBackground} replace />} />
                <Route path={ROUTES.legacy.offers} element={<Navigate to={ROUTES.onboardingOffers} replace />} />
        <Route path={ROUTES.legacy.coordinators} element={<Navigate to={ROUTES.onboardingCoordinators} replace />} />
        <Route element={<HubGate><AppShell /></HubGate>}>
          <Route path={ROUTES.hub} element={<Hub />} /><Route path={ROUTES.sections.staff} element={<StaffRoutes />} /><Route path={ROUTES.sections.roster} element={<RosterRoutes />} /><Route path={ROUTES.sections.contracts} element={<ContractsRoutes />} /><Route path={ROUTES.sections.strategy} element={<StrategyRoutes />} /><Route path={ROUTES.sections.scouting} element={<ScoutingRoutes />} />
          <Route path={ROUTES.hubPages.scoutingLegacy} element={<LegacyHubScoutingRedirect />} /><Route path={ROUTES.sections.offseason} element={<OffseasonRoutes />} /><Route path={ROUTES.hubPages.offseasonLegacy} element={<LegacyHubOffseasonRedirect />} /><Route path={ROUTES.news} element={<LeagueNews />} /><Route path={ROUTES.hubPages.stats} element={<StatsPage />} /><Route path={ROUTES.hubPages.activity} element={<ActivityLog />} /><Route path={ROUTES.hubPages.ownerRelations} element={<OwnerRelations />} /><Route path={ROUTES.hubPages.teamStrategy} element={<Navigate to="/strategy" replace />} /><Route path={ROUTES.hubPages.frontOffice} element={<FrontOffice />} /><Route path={ROUTES.hubPages.firingMeter} element={<FiringMeter />} /><Route path={ROUTES.hubPages.powerRankings} element={<PowerRankings />} /><Route path={ROUTES.coachingOffice} element={<CoachOfficeRoutes />} /><Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path={ROUTES.sections.freeAgency} element={<FreeAgencyRoutes />} /><Route path={ROUTES.sections.reSign} element={<ReSignRoutes />} /><Route path={ROUTES.sections.trades} element={<TradesRoutes />} /><Route path={ROUTES.hubPages.trades} element={<TradesPage />} /><Route path={ROUTES.hubPages.reSign} element={<ReSignPage />} /><Route path={ROUTES.hubPages.freeAgency} element={<Navigate to={ROUTES.redirects.hubToPrimary.freeAgency} replace />} />
          <Route path={ROUTES.hubPages.draft} element={<Navigate to={ROUTES.offseason.draft} replace />} /><Route path={ROUTES.hubPages.draftResults} element={<DraftResults />} /><Route path={ROUTES.hubPages.freeAgencyRecap} element={<FreeAgencyRecap />} /><Route path={ROUTES.hubPages.trainingCamp} element={<Navigate to={ROUTES.offseason.trainingCamp} replace />} /><Route path={ROUTES.hubPages.cutdowns} element={<Navigate to={ROUTES.offseason.cutdowns} replace />} />
          <Route path={ROUTES.hubPages.preseason} element={<PreseasonWeek />} /><Route path={ROUTES.hubPages.regularSeason} element={<RegularSeason />} /><Route path={ROUTES.hubPages.gameplan} element={<GameplanPage />} /><Route path={ROUTES.hubPages.playoffs} element={<PlayoffsPage />} /><Route path={ROUTES.hubPages.playoffsBracket} element={<PlayoffBracketPage />} /><Route path={ROUTES.hubPages.playoffsGame} element={<PlayoffGamePage />} /><Route path={ROUTES.hubPages.schedule} element={<ScheduleHome />} /><Route path={ROUTES.hubPages.scheduleWeek} element={<WeekSlate />} /><Route path={ROUTES.hubPages.scheduleTeam} element={<TeamSchedule />} /><Route path={ROUTES.hubPages.scheduleGame} element={<GameDetails />} /><Route path={ROUTES.hubPages.playcall} element={<Playcall />} /><Route path={ROUTES.hubPages.player} element={<LegacyHubPlayerRedirect />} /><Route path={ROUTES.hubPages.capProjection} element={<Navigate to={ROUTES.contracts.capProjection} replace />} /><Route path={ROUTES.hubPages.tagCenter} element={<Navigate to={ROUTES.contracts.tag} replace />} /><Route path={ROUTES.hubPages.deadMoney} element={<Navigate to={ROUTES.contracts.deadMoney} replace />} /><Route path={ROUTES.hubPages.development} element={<Navigate to={ROUTES.roster.development} replace />} /><Route path={ROUTES.hubPages.injuryReport} element={<Navigate to={ROUTES.roster.injuryReport} replace />} /><Route path={ROUTES.hubPages.capBaseline} element={<Navigate to={ROUTES.contracts.capBaseline} replace />} /><Route path={ROUTES.hubPages.rosterAudit} element={<Navigate to={ROUTES.roster.audit} replace />} /><Route path={ROUTES.hubPages.assistantHiring} element={<Navigate to={ROUTES.redirects.hubToStaff.assistantHiring} replace />} /><Route path={ROUTES.hubPages.coordinatorHiring} element={<CoordinatorHiring />} /><Route path={ROUTES.hubPages.hallOfFame} element={<HallOfFame />} /><Route path={ROUTES.hubPages.leagueHistory} element={<LeagueHistory />} /><Route path={ROUTES.hubPages.analytics} element={<AnalyticsPage />} /><Route path={ROUTES.hubPages.combine} element={<Navigate to={ROUTES.offseason.combine} replace />} /><Route path={ROUTES.hubPages.tampering} element={<Navigate to={ROUTES.redirects.hubToPrimary.freeAgency} replace />} /><Route path={ROUTES.hubPages.preDraft} element={<Navigate to={ROUTES.offseason.preDraft} replace />} /><Route path={ROUTES.skillTree} element={<SkillTree />} /><Route path={ROUTES.hubPages.resignAlias} element={<Navigate to={ROUTES.hubPages.reSign} replace />} /><Route path={ROUTES.contracts.capBaseline} element={<CapBaseline />} /><Route path={ROUTES.contracts.rosterAudit} element={<Navigate to={ROUTES.roster.audit} replace />} /><Route path={ROUTES.roster.root} element={<Navigate to={ROUTES.roster.depthChart} replace />} />
        </Route>
        <Route path={ROUTES.fired} element={<FiredScreen />} />
        <Route path={ROUTES.pressFeedbackDemo} element={<PressFeedbackDemo />} />
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
