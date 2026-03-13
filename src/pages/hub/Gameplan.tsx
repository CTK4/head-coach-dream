import { Navigate, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_WEEKLY_GAMEPLAN, deriveOpponentTendencies } from "@/engine/gameplan";
import { buildWeatherGameKey, formatWeatherSummary } from "@/engine/weather/generateGameWeather";
import type { LeaguePhase } from "@/engine/leaguePhase";
import { readSettingsSync, writeSettings, type OffensePlaycallingMode } from "@/lib/settings";

// Phases that represent playoff rounds - used to branch opponent/lock logic
const PLAYOFF_PHASES: LeaguePhase[] = ["WILD_CARD", "DIVISIONAL", "CONFERENCE", "CHAMPIONSHIP"];

export default function GameplanPage() {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();

  // Guard: only show this page during valid gameplan phases
  const isRegularSeasonGameplan = state.league.phase === "REGULAR_SEASON_GAMEPLAN";
  const isPlayoffGameplan = PLAYOFF_PHASES.includes(state.league.phase as LeaguePhase);

  if (!isRegularSeasonGameplan && !isPlayoffGameplan) {
    return <Navigate to="/hub" replace />;
  }

  const teamId = String(state.acceptedOffer?.teamId ?? "");
  if (!teamId) return <Navigate to="/hub" replace />;

  // —————————————————————–
  // Derive the opponent ID depending on context.
  //
  // REGULAR SEASON: use getCurrentTeamMatchup (existing behaviour).
  // PLAYOFFS: read from state.playoffs.pendingUserGame — this is the
  //   canonical source of truth for which game the user needs to play
  //   next, and it’s already set by PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND
  //   before the user reaches this page.
  // —————————————————————–
  let oppId: string | undefined;

  if (isPlayoffGameplan) {
    const pending = state.playoffs?.pendingUserGame;
    if (!pending) {
      // No pending playoff game — user shouldn’t be here; send them back.
      return <Navigate to="/hub/playoffs" replace />;
    }
    oppId = pending.homeTeamId === teamId ? pending.awayTeamId : pending.homeTeamId;
  } else {
    // Regular season path (unchanged)
    const current = getCurrentTeamMatchup("REGULAR_SEASON");
    oppId =
      current?.matchup.homeTeamId === teamId
        ? current.matchup.awayTeamId
        : current?.matchup.homeTeamId;
  }


  const weekNumber = isPlayoffGameplan ? Number(state.playoffs?.round ?? 1) : state.hub.regularSeasonWeek;
  const weekType = isPlayoffGameplan ? "PLAYOFFS" as const : "REGULAR_SEASON" as const;

  const weatherKey = oppId ? buildWeatherGameKey({ season: state.season, weekType, weekNumber, homeTeamId: teamId, awayTeamId: String(oppId) }) : "";
  const persistedWeather = weatherKey ? state.weatherByGameKey?.[weatherKey] : undefined;

  const tendencies = deriveOpponentTendencies(
    state.saveSeed,
    String(oppId ?? "OPP"),
    state.hub.regularSeasonWeek,
  );

  const plan = state.teamGameplans?.[teamId] ?? DEFAULT_WEEKLY_GAMEPLAN;

  // —————————————————————–
  // Lock the gameplan.
  //
  // REGULAR SEASON: advance the league phase (REGULAR_SEASON_GAMEPLAN
  //   → REGULAR_SEASON_GAME) and return to the regular-season hub.
  //
  // PLAYOFFS: only lock the plan — do NOT advance the league phase.
  //   Phase advancement in playoffs is handled by the game-result
  //   reducer (after the game is actually played and the round is
  //   fully resolved). Advancing here would skip an entire round.
  //   Navigate back to /hub/playoffs so the user can press “Play”.
  // —————————————————————–
  const lockPlan = () => {
    dispatch({ type: "LOCK_TEAM_GAMEPLAN", payload: { teamId } });

    if (isPlayoffGameplan) {
      // Playoffs: just lock — do NOT call ADVANCE_LEAGUE_PHASE.
      navigate("/hub/playoffs");
    } else {
      // Regular season: advance phase then return to weekly hub.
      dispatch({ type: "ADVANCE_LEAGUE_PHASE" });
      navigate("/hub/regular-season");
    }
  };

  const pageTitle = isPlayoffGameplan
    ? `Playoff Gameplan · ${String(state.league.phase).replace("_", " ")}`
    : "Weekly Gameplan";

  const offensePlaycallingMode = state.game.offenseUserMode ?? readSettingsSync().offensePlaycallingMode ?? "FULL_AUTO";

  const onOffensePlaycallingModeChange = (mode: OffensePlaycallingMode) => {
    dispatch({ type: "SET_OFFENSE_USER_MODE", payload: { mode } });
    writeSettings({ ...readSettingsSync(), offensePlaycallingMode: mode });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">{pageTitle}</h2>

      {/* Opponent scouting tendencies */}
      <Card>
        <CardContent className="p-4 text-sm space-y-1">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Opponent Tendencies
          </div>
          <div>Early Down Run Rate: {(tendencies.earlyDownRunRate * 100).toFixed(0)}%</div>
          <div>3rd Down Pass Rate: {(tendencies.thirdDownPassRate * 100).toFixed(0)}%</div>
          <div>Red Zone Pass Rate: {(tendencies.redZonePassRate * 100).toFixed(0)}%</div>
          <div>Blitz Rate: {(tendencies.blitzRate * 100).toFixed(0)}%</div>
          <div>{formatWeatherSummary(persistedWeather)}</div>
        </CardContent>
      </Card>

      {/* Your offensive plan */}
      <Card>
        <CardContent className="p-4 text-sm">
          Offense: {plan.offensiveFocus} · Tempo: {plan.tempo} · Aggression: {plan.aggression}
        </CardContent>
      </Card>

      {/* Your defensive plan */}
      <Card>
        <CardContent className="p-4 text-sm">
          Defense: {plan.defensiveFocus} · Pressure: {plan.pressureRate}
        </CardContent>
      </Card>


      <Card>
        <CardContent className="p-4 text-sm space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Offense Playcalling Mode</div>
          <Select value={offensePlaycallingMode} onValueChange={(v) => onOffensePlaycallingModeChange(v as OffensePlaycallingMode)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_AUTO">Full Auto</SelectItem>
              <SelectItem value="KEY_SITUATIONS">Key Situations</SelectItem>
              <SelectItem value="FULL_PLAYCALLING">Full Playcalling</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Scripted opening plays */}
      <Card>
        <CardContent className="p-4 text-sm">
          Scripted opening: {plan.scriptedOpening.join(", ")}
        </CardContent>
      </Card>

      <Button onClick={lockPlan}>Lock Plan</Button>
    </div>
  );
}
