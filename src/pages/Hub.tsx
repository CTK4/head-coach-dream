import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";
import { HubTile } from "@/components/franchise-hub/HubTile";
import { FranchiseHeader } from "@/components/franchise-hub/FranchiseHeader";
import { HUB_BG, HUB_TEXTURE, HUB_VIGNETTE, HUB_FRAME } from "@/components/franchise-hub/theme";
import { HubPhaseQuickLinks } from "@/pages/hub/PhaseSubsystemRoutes";
import { isReSignAllowed, isTradesAllowed } from "@/engine/phase";

// Placeholder images - using simple colored gradients or specific placeholders from the list if available
const IMAGES = {
    staff: "/placeholders/coach.png",
    roster: "/placeholders/depth_chart.png",
    strategy: "/placeholders/strategy_meeting.png",
    contracts: "/placeholders/accounting.png",
    scouting: "/placeholders/scout.png",
    news: "/placeholders/news.png",
    freeAgency: "/placeholders/accounting.png",
    resign: "/placeholders/depth_chart.png",
    trades: "/placeholders/strategy_meeting.png",
    injuryReport: "/placeholders/depth_chart.png",
}

type UserSettings = {
  confirmAutoAdvance?: boolean;
};

const SETTINGS_KEY = "hcd:settings";

function readSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { confirmAutoAdvance: true };
    const parsed = JSON.parse(raw) as UserSettings;
    return { confirmAutoAdvance: parsed.confirmAutoAdvance ?? true };
  } catch {
    return { confirmAutoAdvance: true };
  }
}

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
    return {
      hireStaff: clampInt(b?.hireStaff ?? 1, 0, 99),
      franchiseStrategy: clampInt(b?.franchiseStrategy ?? 1, 0, 99),
      scouting: clampInt(b?.scouting ?? 2, 0, 99),
      roster: clampInt(b?.roster ?? 1, 0, 99),
      finances: clampInt(b?.finances ?? 1, 0, 99),
      leagueNews: clampInt(b?.leagueNews ?? 4, 0, 99),
      leagueNewsUnread: clampInt(b?.leagueNewsUnread ?? 3, 0, 99),
    };
  }, [state]);

  const assistantOpen = Object.values(state.assistantStaff ?? {}).filter((value) => !value).length;
  // const hireStaffSubtitle = assistantOpen > 0 ? `${assistantOpen} Positions Open` : "Staff Filled";
  
  const nextStage = nextStageForNavigate(state.careerStage);
  const showTrades = isTradesAllowed(state);
  const showReSign = isReSignAllowed(state);
  const nextLabel = stageLabel(nextStage);
  const nextRoute = stageToRoute(nextStage);

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
                    imageUrl={IMAGES.staff}
                    badgeCount={assistantOpen > 0 ? Math.max(1, badgeCounts.hireStaff) : 0}
                />
                <HubTile
                    title="Roster"
                    to="/roster"
                    imageUrl={IMAGES.roster}
                    badgeCount={badgeCounts.roster}
                />
                <HubTile
                    title="Franchise Strategy"
                    to="/strategy"
                    imageUrl={IMAGES.strategy}
                    badgeCount={badgeCounts.franchiseStrategy}
                />
                <HubTile
                    title="Contracts & Cap"
                    subtitle="Management"
                    to="/contracts"
                    imageUrl={IMAGES.contracts}
                    badgeCount={badgeCounts.finances}
                />
                <HubTile
                    title="Scouting"
                    to="/scouting"
                    imageUrl={IMAGES.scouting}
                    badgeCount={badgeCounts.scouting}
                />
                <HubTile
                    title="News"
                    to="/news"
                    imageUrl={IMAGES.news}
                    badgeCount={badgeCounts.leagueNews}
                    cornerBubbleCount={badgeCounts.leagueNewsUnread}
                />
                {state.careerStage === "FREE_AGENCY" ? (
                  <HubTile title="Free Agency" to="/free-agency" imageUrl={IMAGES.freeAgency} badgeCount={1} />
                ) : null}
                {showReSign ? (
                  <HubTile title="Re-Sign" to="/hub/re-sign" imageUrl={IMAGES.resign} badgeCount={1} />
                ) : null}
                {showTrades ? (
                  <HubTile title="Trades" to="/hub/trades" imageUrl={IMAGES.trades} badgeCount={1} />
                ) : null}
                <HubTile
                    title="Injury Report"
                    subtitle="Health & Medical"
                    to="/hub/injury-report"
                    imageUrl={IMAGES.injuryReport}
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
