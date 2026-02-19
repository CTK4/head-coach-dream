import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { HubTile } from "@/components/franchise-hub/HubTile";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";

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

  const nextStage = nextStageForNavigate(state.careerStage);
  const nextLabel = stageLabel(nextStage);
  const nextRoute = stageToRoute(nextStage);

  function onAdvance() {
    dispatch({ type: "ADVANCE_CAREER_STAGE" });
    navigate(nextRoute);
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
          subtitle="3 Positions Open"
          cta="DECISION NEEDED"
          to="/hub/assistant-hiring"
          badgeCount={badgeCounts.hireStaff}
        />

        <HubTile title="ROSTER" subtitle="MANAGE TEAM" cta="MANAGE TEAM" to="/hub/roster" badgeCount={badgeCounts.roster} />

        <HubTile
          title="FRANCHISE STRATEGY"
          cta="PLAN FUTURE"
          to="/hub/staff-management"
          badgeCount={badgeCounts.franchiseStrategy}
        />

        <HubTile
          title="CONTRACTS & CAP MANAGEMENT"
          cta="VIEW FINANCES"
          to="/hub/finances"
          badgeCount={badgeCounts.finances}
        />

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
          <Button onClick={onAdvance} aria-label="Advance to next phase">
            ADVANCE TO NEXT PHASE →
          </Button>
        </CardContent>
      </Card>
    </HubShell>
  );
}
