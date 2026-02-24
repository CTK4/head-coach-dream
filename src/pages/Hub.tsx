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
  staff: "/placeholders/coach.png",
  roster: "/placeholders/depth_chart.png",
  strategy: "/placeholders/strategy_meeting.png",
  contracts: "/placeholders/accounting.png",
  scouting: "/placeholders/scout.png",
  news: "/placeholders/news.png",
  freeAgency: "/placeholders/accounting.png",
  resign: "/placeholders/depth_chart.png",
  trades: "/placeholders/strategy_meeting.png",
  injuryReport: "/placeholders/Injury_Report.png",
  coachOffice: "/placeholders/Coach_Office.jpeg",
  hallOfFame: "/placeholders/Hall_of_Fame.jpeg",
} as const;

type HubTileConfig = {
  title: string;
  subtitle?: string;
  to: string;
  imageUrl: string;
  badgeCount?: number;
  badgeHint?: string;
  badgeKind?: HubBadgeKind;
  cornerBubbleCount?: number;
  imageObjectPosition?: string;
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Hub() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const badgeCounts = useMemo(() => {
    const hub = state.hub;
    const unread = (hub.news ?? []).filter((x: any) => !hub.newsReadIds?.[String(x?.id)]).length;

    return {
      newsUnread: clampInt(unread, 0, 99),
    };
  }, [state.hub]);

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

  let advanceText = "ADVANCE PHASE";
  if (state.careerStage === "FREE_AGENCY") advanceText = "ADVANCE FA DAY";
  else if (state.careerStage === "COMBINE") advanceText = "ADVANCE COMBINE DAY";
  else if (state.careerStage === "DRAFT") advanceText = "ADVANCE PICK";
  else if (state.careerStage === "REGULAR_SEASON") advanceText = "ADVANCE WEEK";
  else if (state.careerStage === "RESIGN") advanceText = "ADVANCE RE-SIGN DAY";
  else advanceText = `ADVANCE TO ${nextLabel.toUpperCase()}`;

  const optionalTiles: HubTileConfig[] = [
    ...(state.careerStage === "FREE_AGENCY" ? [{ title: "Free Agency", to: "/free-agency", imageUrl: TILE_IMAGES.freeAgency }] : []),
    ...(showReSign ? [{ title: "Re-Sign", to: "/hub/re-sign", imageUrl: TILE_IMAGES.resign }] : []),
    ...(showTrades ? [{ title: "Trades", to: "/hub/trades", imageUrl: TILE_IMAGES.trades }] : []),
  ];

  const mainTiles: HubTileConfig[] = [
    {
      title: "Staff",
      to: "/staff",
      imageUrl: TILE_IMAGES.staff,
      imageObjectPosition: "50% 65%",
    },
    { title: "Roster", to: "/roster", imageUrl: TILE_IMAGES.roster },
    { title: "Franchise Strategy", to: "/strategy", imageUrl: TILE_IMAGES.strategy },
    { title: "Contracts & Cap", subtitle: "Management", to: "/contracts", imageUrl: TILE_IMAGES.contracts },
    { title: "Scouting", to: "/scouting", imageUrl: TILE_IMAGES.scouting },
    {
      title: "News",
      to: "/news",
      imageUrl: TILE_IMAGES.news,
      badgeCount: badgeCounts.newsUnread,
      badgeHint: "Unread news stories",
      badgeKind: "unread",
      cornerBubbleCount: badgeCounts.newsUnread,
    },
    { title: "Coach's Office", subtitle: "Skill Tree", to: "/skill-tree", imageUrl: TILE_IMAGES.coachOffice },
    { title: "Injury Report", subtitle: "Health & Medical", to: "/hub/injury-report", imageUrl: TILE_IMAGES.injuryReport },
    { title: "Hall of Fame", to: "/hub/hall-of-fame", imageUrl: TILE_IMAGES.hallOfFame },
  ];

  return (
    <section className={`relative min-h-full overflow-x-hidden p-2 md:p-4 ${HUB_BG}`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

      <div className={`relative z-10 mx-auto max-w-7xl space-y-6 p-4 md:p-6 ${HUB_FRAME}`}>
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
          className="w-full border border-blue-500/30 bg-gradient-to-r from-blue-900 to-slate-900 py-6 text-lg font-bold tracking-widest shadow-lg transition-all hover:from-blue-800 hover:to-slate-800"
        >
          {advanceText}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Advance?</DialogTitle>
            <DialogDescription className="text-slate-200/70">Next: {nextLabel}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doAdvance}>Advance</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
