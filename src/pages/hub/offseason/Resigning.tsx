import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPositionLabel } from "@/lib/displayLabels";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { getUserTeamId } from "@/lib/userTeam";

export default function Resigning() {
  const { state, dispatch } = useGame();
  const decisions = state.offseasonData.resigning.decisions;

  const teamId = getUserTeamId(state) ?? state.acceptedOffer?.teamId ?? "";

  const expiringPlayers = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, String(teamId))
      .filter((p: any) => {
        const summary = getContractSummaryForPlayer(state, String(p.playerId));
        if (!summary) return false;
        if (typeof summary.yearsRemaining === "number") return Number(summary.yearsRemaining) === 1;
        return Number(summary.endSeason) === state.season;
      })
      .sort((a: any, b: any) => Number(b.overall ?? b.ovr ?? 0) - Number(a.overall ?? a.ovr ?? 0));
  }, [state, teamId]);

  const completed = useMemo(
    () => expiringPlayers.length === 0 || expiringPlayers.every((p: any) => !!decisions[String(p.playerId)]),
    [expiringPlayers, decisions],
  );

  const set = (playerId: string, action: "RESIGN" | "TAG_FRANCHISE" | "TAG_TRANSITION" | "LET_WALK") => {
    const summary = getContractSummaryForPlayer(state, playerId);
    const marketApy = summary?.apy ?? summary?.salary ?? 0;
    const years = action === "RESIGN" ? 3 : undefined;
    const apy = action === "RESIGN" ? marketApy : undefined;
    dispatch({ type: "RESIGN_SET_DECISION", payload: { playerId, decision: { action, years, apy } } });
  };

  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "RESIGNING" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card><CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xl font-bold">Re-signing / Tags</div>
          <div className="text-sm text-muted-foreground">Make decisions on expiring contracts.</div>
        </div>
        <Badge variant="outline">Step 1</Badge>
      </CardContent></Card>

      {expiringPlayers.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No expiring contracts this season.</CardContent></Card>
      )}

      <div className="grid gap-3">
        {expiringPlayers.map((p: any) => {
          const playerId = String(p.playerId);
          const d = decisions[playerId];
          const summary = getContractSummaryForPlayer(state, playerId);
          const apy = summary?.apy ?? summary?.salary ?? 0;
          const ovr = Number(p.overall ?? p.ovr ?? 0);
          return (
            <Card key={playerId}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.name ?? p.fullName ?? "Player"} <span className="text-muted-foreground font-normal">({getPositionLabel(String(p.pos ?? ""))})</span></div>
                  <Badge variant="outline">OVR {ovr}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Current APY: ${Math.round(apy / 1_000_000)}M/yr</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={d?.action === "RESIGN" ? "default" : "outline"} onClick={() => set(playerId, "RESIGN")}>Re-sign</Button>
                  <Button size="sm" variant={d?.action === "TAG_FRANCHISE" ? "default" : "outline"} onClick={() => set(playerId, "TAG_FRANCHISE")}>Franchise</Button>
                  <Button size="sm" variant={d?.action === "TAG_TRANSITION" ? "default" : "outline"} onClick={() => set(playerId, "TAG_TRANSITION")}>Transition</Button>
                  <Button size="sm" variant={d?.action === "LET_WALK" ? "default" : "outline"} onClick={() => set(playerId, "LET_WALK")}>Let Walk</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card><CardContent className="p-6 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{completed ? "Ready to complete." : "Decide for all expiring players."}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={completeStep} disabled={!completed}>Complete Step</Button>
          <Button onClick={next} disabled={!state.offseason.stepsComplete.RESIGNING}>Next →</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
