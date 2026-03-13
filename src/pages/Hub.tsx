import { useMemo, useState } from "react";
import { HubMissionControl } from "@/components/hub/HubMissionControl";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HubTile, type HubBadgeKind } from "@/components/franchise-hub/HubTile";
import { readSettings } from "@/lib/settings";
import { FranchiseHeader } from "@/components/franchise-hub/FranchiseHeader";
import { HUB_BG, HUB_TEXTURE, HUB_VIGNETTE, HUB_FRAME } from "@/components/franchise-hub/theme";
import { HUB_TILE_IMAGES, type HubTileId } from "@/components/franchise-hub/tileImages";
import { HubPhaseQuickLinks } from "@/pages/hub/PhaseSubsystemRoutes";
import SeasonAwards from "@/pages/SeasonAwards";
import { getHubActionAvailability, resolveHubProgression } from "@/services/gameProgressionService";

type HubTileConfig = {
  id: HubTileId;
  title: string;
  subtitle?: string;
  to: string;
  imageUrl: string;
  badgeCount?: number;
  badgeHint?: string;
  badgeKind?: HubBadgeKind;
  cornerBubbleCount?: number;
  imageObjectPosition?: string;
  dataTest?: string;
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Hub() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const badgeCounts = useMemo(() => {
    return {
      newsUnread: clampInt(state.unreadNewsCount ?? 0, 0, 99),
    };
  }, [state.unreadNewsCount]);

  const { showCoordinatorHiring, showReSign, showTrades } = getHubActionAvailability(state);
  const { nextLabel, nextRoute, advanceText } = resolveHubProgression(state.careerStage);

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

  const optionalTiles: HubTileConfig[] = [
    ...(state.careerStage === "FREE_AGENCY" ? [{ id: "contracts" as HubTileId, title: "Free Agency", to: "/free-agency", imageUrl: HUB_TILE_IMAGES.contracts }] : []),
    ...(showCoordinatorHiring
      ? [{ id: "staff" as HubTileId, title: "Hire Coordinators", subtitle: "OC · DC · STC", to: "/hub/coordinator-hiring", imageUrl: HUB_TILE_IMAGES.staff, dataTest: "hub-hire-coordinators" }]
      : []),
    ...(showReSign ? [{ id: "roster" as HubTileId, title: "Re-Sign", to: "/hub/re-sign", imageUrl: HUB_TILE_IMAGES.roster }] : []),
    ...(showTrades ? [{ id: "strategy" as HubTileId, title: "Trades", to: "/hub/trades", imageUrl: HUB_TILE_IMAGES.strategy }] : []),
    ...(state.careerStage === "PLAYOFFS" ? [{ id: "hall_of_fame" as HubTileId, title: "Playoffs", to: "/hub/playoffs", imageUrl: HUB_TILE_IMAGES.hall_of_fame }] : []),
   ] satisfies HubTileConfig[];

  const mainTiles: HubTileConfig[] = [
    {
      title: "Staff",
      to: "/staff",
      id: "staff",
      imageUrl: HUB_TILE_IMAGES.staff,
      imageObjectPosition: "50% 65%",
    },
    { id: "roster" as HubTileId, title: "Roster", to: "/roster", imageUrl: HUB_TILE_IMAGES.roster },
    { id: "strategy" as HubTileId, title: "Franchise Strategy", to: "/strategy", imageUrl: HUB_TILE_IMAGES.strategy },
    { id: "strategy" as HubTileId, title: "Front Office", subtitle: "Owner + GM", to: "/hub/front-office", imageUrl: "/placeholders/Trophy_Room.PNG" },
    { id: "contracts" as HubTileId, title: "Contracts & Cap", subtitle: "Management", to: "/contracts", imageUrl: HUB_TILE_IMAGES.contracts },
    { id: "scouting", title: "Scouting", to: "/scouting", imageUrl: HUB_TILE_IMAGES.scouting },
    {
      id: "news",
      title: "News",
      to: "/news",
      imageUrl: HUB_TILE_IMAGES.news,
      badgeCount: badgeCounts.newsUnread,
      badgeHint: "Unread news stories",
      badgeKind: "unread",
      cornerBubbleCount: Math.min(badgeCounts.newsUnread, 9),
    },
    { id: "strategy" as HubTileId, title: "Schedule", subtitle: "Slate + Results", to: "/hub/schedule", imageUrl: HUB_TILE_IMAGES.strategy },
    { id: "coachs_office", title: "Coach's Office", subtitle: "Profiles + Skill Tree", to: "/coachs-office", imageUrl: HUB_TILE_IMAGES.coachs_office },
    { id: "injury_report", title: "Injury Report", subtitle: "Health & Medical", to: "/hub/injury-report", imageUrl: HUB_TILE_IMAGES.injury_report },
    { id: "hall_of_fame" as HubTileId, title: "League History", subtitle: "Champions + MVPs + Legends", to: "/hub/league-history", imageUrl: HUB_TILE_IMAGES.hall_of_fame },
    { id: "strategy" as HubTileId, title: "Analytics", subtitle: "Career telemetry", to: "/hub/analytics", imageUrl: HUB_TILE_IMAGES.strategy },
  ];

  return (
    <div data-test="hub-root" className={`relative min-h-full overflow-x-hidden p-2 md:p-4 ${HUB_BG}`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
      <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

      <div className={`relative z-10 mx-auto max-w-7xl space-y-6 p-4 md:p-6 ${HUB_FRAME}`}>
        <FranchiseHeader />

        <HubMissionControl />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-slate-300/15 bg-background text-slate-100">
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
    </div>
  );
}
