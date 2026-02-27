import { Navigate, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_WEEKLY_GAMEPLAN, deriveOpponentTendencies } from "@/engine/gameplan";

export default function GameplanPage() {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();
  if (state.league.phase !== "REGULAR_SEASON_GAMEPLAN" && state.league.phase !== "WILD_CARD" && state.league.phase !== "DIVISIONAL" && state.league.phase !== "CONFERENCE" && state.league.phase !== "CHAMPIONSHIP") {
    return <Navigate to="/hub" replace />;
  }
  const teamId = String(state.acceptedOffer?.teamId ?? "");
  if (!teamId) return <Navigate to="/hub" replace />;
  const current = getCurrentTeamMatchup("REGULAR_SEASON");
  const oppId = current?.matchup.homeTeamId === teamId ? current.matchup.awayTeamId : current?.matchup.homeTeamId;
  const tendencies = deriveOpponentTendencies(state.saveSeed, String(oppId ?? "OPP"), state.hub.regularSeasonWeek);
  const plan = state.teamGameplans?.[teamId] ?? DEFAULT_WEEKLY_GAMEPLAN;

  const lockPlan = () => {
    dispatch({ type: "LOCK_TEAM_GAMEPLAN", payload: { teamId } });
    dispatch({ type: "ADVANCE_LEAGUE_PHASE" });
    navigate("/hub/regular-season");
  };

  return <div className="space-y-4 p-4">
    <h2 className="text-2xl font-bold">Weekly Gameplan</h2>
    <Card><CardContent className="p-4 text-sm space-y-1">
      <div>Early Down Run Rate: {(tendencies.earlyDownRunRate * 100).toFixed(0)}%</div>
      <div>3rd Down Pass Rate: {(tendencies.thirdDownPassRate * 100).toFixed(0)}%</div>
      <div>Red Zone Pass Rate: {(tendencies.redZonePassRate * 100).toFixed(0)}%</div>
      <div>Blitz Rate: {(tendencies.blitzRate * 100).toFixed(0)}%</div>
    </CardContent></Card>
    <Card><CardContent className="p-4 text-sm">Offense: {plan.offensiveFocus} · Tempo: {plan.tempo} · Aggression: {plan.aggression}</CardContent></Card>
    <Card><CardContent className="p-4 text-sm">Defense: {plan.defensiveFocus} · Pressure: {plan.pressureRate}</CardContent></Card>
    <Card><CardContent className="p-4 text-sm">Scripted opening: {plan.scriptedOpening.join(", ")}</CardContent></Card>
    <Button onClick={lockPlan}>Lock Plan</Button>
  </div>;
}
