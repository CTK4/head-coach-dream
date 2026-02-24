import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";
import { HubTile, type HubBadgeKind } from "@/components/franchise-hub/HubTile";
import { readSettings } from "@/lib/settings";
import { FranchiseHeader } from "@/components/franchise-hub/FranchiseHeader";
import { HUB_BG, HUB_TEXTURE, HUB_VIGNETTE, HUB_FRAME } from "@/components/franchise-hub/theme";
import { HubPhaseQuickLinks } from "@/pages/hub/PhaseSubsystemRoutes";
import { isReSignAllowed, isTradesAllowed } from "@/engine/phase";
import SeasonAwards from "@/pages/SeasonAwards";

const TILE_IMAGES = {
    staff: { kind: "placeholders", filename: "coach.png", fallbackSrc: "/placeholders/coach.png" },
    roster: { kind: "placeholders", filename: "depth_chart.png", fallbackSrc: "/placeholders/depth_chart.png" },
    strategy: { kind: "placeholders", filename: "strategy_meeting.png", fallbackSrc: "/placeholders/strategy_meeting.png" },
    contracts: { kind: "placeholders", filename: "accounting.png", fallbackSrc: "/placeholders/accounting.png" },
    scouting: { kind: "placeholders", filename: "scout.png", fallbackSrc: "/placeholders/scout.png" },
    news: { kind: "placeholders", filename: "news.png", fallbackSrc: "/placeholders/news.png" },
    freeAgency: { kind: "placeholders", filename: "accounting.png", fallbackSrc: "/placeholders/accounting.png" },
    resign: { kind: "placeholders", filename: "depth_chart.png", fallbackSrc: "/placeholders/depth_chart.png" },
    trades: { kind: "placeholders", filename: "strategy_meeting.png", fallbackSrc: "/placeholders/strategy_meeting.png" },
    injuryReport: "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/placeholders/Injury_Report.jpeg",
    coachOffice: "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/placeholders/Coach_Office.jpeg",
    hallOfFame: "https://8532ca36b3a7421a198490db596a2600.r2.cloudflarestorage.com/placeholders/Hall_of_Fame.jpeg",
} as const;


function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type HubTileConfig = {
  title: string;
  subtitle?: string;
  to: string;
  imageUrl?: string;
  imageR2?: { kind: "placeholders"; filename: string; fallbackSrc: string };
  badgeCount?: number;
  badgeHint?: string;
  badgeKind?: HubBadgeKind;
  cornerBubbleCount?: number;
  imagePosition?: string;
};

export default function Hub() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const badgeCounts = useMemo(() => {
    const hub = (state as any).hub;
    const unread = (hub?.news ?? []).filter((x: any) => !hub?.newsReadIds?.[String(x?.id)]).length;
    const openStaffRoles = Object.values(state.assistantStaff ?? {}).filter((value) => !value).length;
    const activeInjuries = (state.injuries ?? []).filter((injury) => injury.status !== "RECOVERED").length;
    const scoutingState = state.scoutingState;
    const scoutingActions = scoutingState
      ? clampInt(
        Number(scoutingState.interviews?.interviewsRemaining ?? 0)
          + Number(scoutingState.visits?.privateWorkoutsRemaining ?? 0)
          + Number(scoutingState.visits?.top30Remaining ?? 0),
        0,
        99,
      )
      : 0;

    return {
      leagueNewsUnread: clampInt(unread, 0, 99),
      staff: clampInt(openStaffRoles, 0, 99),
      scouting: scoutingActions,
      injuryReport: clampInt(activeInjuries, 0, 99),
    };
  }, [state]);
  
  const nextStage = nextStageForNavigate(state.careerStage);
  const showTrades = isTradesAllowed(state);
  const showReSign = isReSignAllowed(state);
  const nextLabel = stageLabel(nextStage);
  const nextRoute = stageToRoute(nextStage);

  if (state.careerStage === "SEASON_AWARDS") {
    return <SeasonAwards />;
  }

  function doAdvance() {
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
    navigate(nextRoute);
  }

  function onAdvanceClick() {
    const settings = readSettings();
    if (settings.confirmAutoAdvance) setConfirmOpen(true);
    else doAdvance();
  }

  // Determine Advance Label based on careerStage (Mock requirement)
  let advanceText = "ADVANCE PHASE";
  if (state.careerStage === "FREE_AGENCY") advanceText = "ADVANCE FA DAY";
  else if (state.careerStage === "COMBINE") advanceText = "ADVANCE COMBINE DAY";
  else if (state.careerStage === "DRAFT") advanceText = "ADVANCE PICK";
  else if (state.careerStage === "REGULAR_SEASON") advanceText = "ADVANCE WEEK";
  else if (state.careerStage === "RESIGN") advanceText = "ADVANCE RE-SIGN DAY";
  else advanceText = `ADVANCE TO ${nextLabel.toUpperCase()}`;

  const optionalTiles: HubTileConfig[] = [
    ...(state.careerStage === "FREE_AGENCY" ? [{ title: "Free Agency", to: "/free-agency", imageR2: TILE_IMAGES.freeAgency }] : []),
    ...(showReSign ? [{ title: "Re-Sign", to: "/hub/re-sign", imageR2: TILE_IMAGES.resign }] : []),
    ...(showTrades ? [{ title: "Trades", to: "/hub/trades", imageR2: TILE_IMAGES.trades }] : []),
  ];

  const mainTiles: HubTileConfig[] = [
    {
      title: "Staff",
      to: "/staff",
      imageR2: TILE_IMAGES.staff,
      badgeCount: badgeCounts.staff,
      badgeHint: "Open staff roles",
      badgeKind: "task",
      imagePosition: "center 65%",
    },
    { title: "Roster", to: "/roster", imageR2: TILE_IMAGES.roster },
    { title: "Franchise Strategy", to: "/strategy", imageR2: TILE_IMAGES.strategy },
    { title: "Contracts & Cap", subtitle: "Management", to: "/contracts", imageR2: TILE_IMAGES.contracts },
    {
      title: "Scouting",
      to: "/scouting",
      imageR2: TILE_IMAGES.scouting,
      badgeCount: badgeCounts.scouting,
      badgeHint: "Scouting actions",
      badgeKind: "scouting",
    },
    {
      title: "News",
      to: "/news",
      imageR2: TILE_IMAGES.news,
      badgeCount: badgeCounts.leagueNewsUnread,
      badgeHint: "Unread news stories",
      badgeKind: "unread",
      cornerBubbleCount: badgeCounts.leagueNewsUnread,
    },
    { title: "Coach's Office", subtitle: "Skill Tree", to: "/skill-tree", imageUrl: TILE_IMAGES.coachOffice },
    {
      title: "Injury Report",
      subtitle: "Health & Medical",
      to: "/hub/injury-report",
      imageUrl: TILE_IMAGES.injuryReport,
      badgeCount: badgeCounts.injuryReport,
      badgeHint: "Active injuries",
      badgeKind: "info",
    },
    { title: "Hall of Fame", to: "/hub/hall-of-fame", imageUrl: TILE_IMAGES.hallOfFame },
  ];


  return (
    <section className={`relative min-h-full overflow-x-hidden p-2 md:p-4 ${HUB_BG}`}>
        <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
        <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

        <div className={`relative z-10 mx-auto max-w-7xl p-4 md:p-6 ${HUB_FRAME} space-y-6`}>
            
            <FranchiseHeader />

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {optionalTiles.map((tile) => (
                  <HubTile key={tile.title} {...tile} />
                ))}
                {optionalTiles.length % 2 !== 0 ? <div aria-hidden="true" /> : null}
                {mainTiles.map((tile) => (
                  <HubTile key={tile.title} {...tile} />
                ))}
            </div>

            <HubPhaseQuickLinks />

            <Button 
                onClick={onAdvanceClick} 
                className="w-full py-6 text-lg font-bold tracking-widest bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-500/30 hover:from-blue-800 hover:to-slate-800 transition-all shadow-lg"
            >
                {advanceText}
            </Button>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Advance?</DialogTitle>
                    <DialogDescription className="text-slate-200/70">
                    Next: {nextLabel}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={doAdvance}>Advance</Button>
                </div>
            </DialogContent>
        </Dialog>
    </section>
  );
}
