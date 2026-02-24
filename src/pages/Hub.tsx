import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";
import { HubTile } from "@/components/franchise-hub/HubTile";
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
    injuryReport: { kind: "placeholders", filename: "depth_chart.png", fallbackSrc: "/placeholders/depth_chart.png" },
    development: { kind: "placeholders", filename: "strategy_meeting.png", fallbackSrc: "/placeholders/strategy_meeting.png" },
    frontOffice: { kind: "placeholders", filename: "accounting.png", fallbackSrc: "/placeholders/accounting.png" },
} as const;


function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Hub() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const badgeCounts = useMemo(() => {
    const hub = (state as any).hub;
    const b = hub?.badges;
    const unread = (hub?.news ?? []).filter((x: any) => !hub?.newsReadIds?.[String(x?.id)]).length;
    return {
      hireStaff: clampInt(b?.hireStaff ?? 1, 0, 99),
      franchiseStrategy: clampInt(b?.franchiseStrategy ?? 1, 0, 99),
      scouting: clampInt(b?.scouting ?? 2, 0, 99),
      roster: clampInt(b?.roster ?? 1, 0, 99),
      finances: clampInt(b?.finances ?? 1, 0, 99),
      leagueNews: clampInt(b?.leagueNews ?? 4, 0, 99),
      leagueNewsUnread: clampInt(unread, 0, 99),
    };
  }, [state]);

  const assistantOpen = Object.values(state.assistantStaff ?? {}).filter((value) => !value).length;
  // const hireStaffSubtitle = assistantOpen > 0 ? `${assistantOpen} Positions Open` : "Staff Filled";
  
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


  return (
    <section className={`relative min-h-full overflow-x-hidden p-2 md:p-4 ${HUB_BG}`}>
        <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_TEXTURE}`} aria-hidden="true" />
        <div className={`pointer-events-none absolute inset-0 z-0 ${HUB_VIGNETTE}`} aria-hidden="true" />

        <div className={`relative z-10 mx-auto max-w-7xl p-4 md:p-6 ${HUB_FRAME} space-y-6`}>
            
            <FranchiseHeader />

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <HubTile
                    title="Hire Staff"
                    to="/staff"
                    imageR2={TILE_IMAGES.staff}
                    badgeCount={assistantOpen > 0 ? Math.max(1, badgeCounts.hireStaff) : 0}
                    badgeHint="Open staff roles"
                    badgeKind="task"
                />
                <HubTile
                    title="Roster"
                    to="/roster"
                    imageR2={TILE_IMAGES.roster}
                    badgeCount={badgeCounts.roster}
                    badgeHint="Lineup tasks"
                    badgeKind="task"
                />
                <HubTile
                    title="Franchise Strategy"
                    to="/strategy"
                    imageR2={TILE_IMAGES.strategy}
                    badgeCount={badgeCounts.franchiseStrategy}
                    badgeHint="Strategy items"
                    badgeKind="info"
                />
                <HubTile
                    title="Contracts & Cap"
                    subtitle="Management"
                    to="/contracts"
                    imageR2={TILE_IMAGES.contracts}
                    badgeCount={badgeCounts.finances}
                    badgeHint="Cap items"
                    badgeKind="cap"
                />
                <HubTile
                    title="Front Office"
                    subtitle="Owner & GM"
                    to="/hub/front-office"
                    imageR2={TILE_IMAGES.frontOffice}
                    badgeCount={1}
                    badgeHint="Org insights"
                    badgeKind="info"
                />
                <HubTile
                    title="Scouting"
                    to="/scouting"
                    imageR2={TILE_IMAGES.scouting}
                    badgeCount={badgeCounts.scouting}
                    badgeHint="Scouting actions"
                    badgeKind="scouting"
                />
                <HubTile
                    title="News"
                    to="/news"
                    imageR2={TILE_IMAGES.news}
                    badgeCount={badgeCounts.leagueNewsUnread}
                    badgeHint="Unread news stories"
                    badgeKind="unread"
                    cornerBubbleCount={badgeCounts.leagueNewsUnread}
                />
                {state.careerStage === "FREE_AGENCY" ? (
                  <HubTile title="Free Agency" to="/free-agency" imageR2={TILE_IMAGES.freeAgency} badgeCount={1} badgeHint="Free agency actions" badgeKind="info" />
                ) : null}
                {showReSign ? (
                  <HubTile title="Re-Sign" to="/hub/re-sign" imageR2={TILE_IMAGES.resign} badgeCount={1} badgeHint="Re-sign actions" badgeKind="info" />
                ) : null}
                {showTrades ? (
                  <HubTile title="Trades" to="/hub/trades" imageR2={TILE_IMAGES.trades} badgeCount={1} badgeHint="Trade opportunities" badgeKind="info" />
                ) : null}
                <HubTile
                    title="Coach Development"
                    subtitle="Skill Tree"
                    to="/skill-tree"
                    imageR2={TILE_IMAGES.development}
                    badgeCount={Math.max(0, state.coach.perkPoints ?? 0)}
                    badgeHint="Perk points available"
                    badgeKind="info"
                />
                <HubTile
                    title="Injury Report"
                    subtitle="Health & Medical"
                    to="/hub/injury-report"
                    imageR2={TILE_IMAGES.injuryReport}
                    badgeCount={badgeCounts.leagueNews}
                    badgeHint="League updates"
                    badgeKind="info"
                />
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
