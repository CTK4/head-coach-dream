import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { HubTile } from "@/components/franchise-hub/HubTile";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";

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

function formatMoneyM(n: number): string {
  const m = Math.max(0, n) / 1_000_000;
  return `$${m.toFixed(1)}M`;
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

  const capRoom = formatMoneyM(state.finances.capSpace);
  const assistantOpen = Object.values(state.assistantStaff ?? {}).filter((value) => !value).length;
  const hireStaffSubtitle = assistantOpen > 0 ? `${assistantOpen} Positions Open` : "Staff Filled";
  const hireStaffCta = assistantOpen > 0 ? "DECISION NEEDED" : "VIEW STAFF";

  const nextStage = nextStageForNavigate(state.careerStage);
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

  return (
    <HubShell title="FRANCHISE HUB">
      <Card className="border-slate-300/15 bg-slate-950/35">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-100">Head Coach Hub</div>
            <div className="text-xs text-slate-200/70">Manage staff, roster, scouting, and finances.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">Cap Room {capRoom}</Badge>
            <Badge variant="outline">Stage {stageLabel(state.careerStage)}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HubTile
          title="HIRE STAFF"
          subtitle={hireStaffSubtitle}
          cta={hireStaffCta}
          to="/hub/assistant-hiring"
          badgeCount={assistantOpen > 0 ? Math.max(1, badgeCounts.hireStaff) : 0}
        />
        <HubTile title="ROSTER" subtitle="MANAGE TEAM" cta="MANAGE TEAM" to="/hub/roster" badgeCount={badgeCounts.roster} />
        <HubTile title="FRANCHISE STRATEGY" cta="PLAN FUTURE" to="/hub/staff-management" badgeCount={badgeCounts.franchiseStrategy} />
        <HubTile title="CONTRACTS & CAP MANAGEMENT" cta="VIEW FINANCES" to="/hub/finances" badgeCount={badgeCounts.finances} />
        <HubTile title="SCOUTING" cta="BEGIN SCOUTING" to="/hub/pre-draft" badgeCount={badgeCounts.scouting} />
        <HubTile
          title="LEAGUE NEWS"
          cta="VIEW HEADLINES"
          to="/hub/league-news"
          badgeCount={badgeCounts.leagueNews}
          cornerBubbleCount={badgeCounts.leagueNewsUnread}
        />
      </div>

      <Card className="border-slate-300/15 bg-slate-950/35">
        <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-100">Advance to next phase</div>
            <div className="text-xs text-slate-200/70">Next: {nextLabel}</div>
          </div>
          <Button onClick={onAdvanceClick} aria-label="Advance to next phase">
            ADVANCE TO NEXT PHASE →
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Advance to next phase?</DialogTitle>
            <DialogDescription className="text-slate-200/70">
              Next: {nextLabel}. You can disable this confirmation in Settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doAdvance}>Advance</Button>
          </div>
        </DialogContent>
      </Dialog>
    </HubShell>
  );
}
