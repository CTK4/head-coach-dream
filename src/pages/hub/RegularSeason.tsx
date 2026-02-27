import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGame, REGULAR_SEASON_WEEKS } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import {
  DEFAULT_PRACTICE_PLAN,
  PRACTICE_POINTS_BUDGET,
  getEffectPreview,
  normalizePracticeAllocation,
  type PracticeAllocation,
  type PracticeCategory,
} from "@/engine/practiceFocus";

type StandingRow = { teamId: string; w: number; l: number; pf: number; pa: number; diff: number };

function buildStandings(standings: Record<string, { w: number; l: number; pf: number; pa: number }>): StandingRow[] {
  return Object.entries(standings)
    .map(([teamId, s]) => ({ teamId, ...s, diff: (s.pf ?? 0) - (s.pa ?? 0) }))
    .sort((a, b) => b.w - a.w || a.l - b.l || b.diff - a.diff || b.pf - a.pf || a.teamId.localeCompare(b.teamId));
}

function StandingsPanel({ myTeamId }: { myTeamId: string }) {
  const { state } = useGame();
  const rows = useMemo(() => buildStandings(state.league.standings), [state.league.standings]);
  const top = rows.slice(0, 10);
  const myRow = rows.find((r) => r.teamId === myTeamId);
  const myRank = myRow ? rows.findIndex((r) => r.teamId === myTeamId) + 1 : null;
  const showMy = myRow && !top.some((r) => r.teamId === myTeamId);

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">League Standings</div>
          <Badge variant="outline">{rows.length} teams</Badge>
        </div>
        <div className="text-xs text-muted-foreground grid grid-cols-[1fr_auto_auto_auto] gap-2 px-1">
          <div>Team</div><div className="text-right">W-L</div><div className="text-right">PF</div><div className="text-right">PA</div>
        </div>
        <div className="space-y-1">
          {top.map((r, idx) => (
            <div key={r.teamId} className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-md px-2 py-1 ${r.teamId === myTeamId ? "bg-secondary/70" : ""}`}>
              <div className="flex items-center gap-2 min-w-0"><Badge variant="outline" className="w-8 justify-center shrink-0">{idx + 1}</Badge><div className="truncate">{getTeamById(r.teamId)?.name ?? r.teamId}</div></div>
              <div className="text-right tabular-nums">{r.w}-{r.l}</div><div className="text-right tabular-nums">{r.pf}</div><div className="text-right tabular-nums">{r.pa}</div>
            </div>
          ))}
          {showMy && myRow && myRank && (
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-md px-2 py-1 bg-secondary/70">
              <div className="flex items-center gap-2 min-w-0"><Badge variant="outline" className="w-8 justify-center shrink-0">{myRank}</Badge><div className="truncate">{getTeamById(myTeamId)?.name ?? myTeamId}</div></div>
              <div className="text-right tabular-nums">{myRow.w}-{myRow.l}</div><div className="text-right tabular-nums">{myRow.pf}</div><div className="text-right tabular-nums">{myRow.pa}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const CATEGORY_COPY: Record<PracticeCategory, { title: string; tradeoff: string }> = {
  fundamentals: { title: "Fundamentals", tradeoff: "Lower mental mistakes and cleaner reps, but less install time." },
  schemeInstall: { title: "Scheme Install", tradeoff: "Improves recognition and concept timing, but can leave conditioning lighter." },
  conditioning: { title: "Conditioning", tradeoff: "Reduces injury pressure and improves late-game legs, but fewer teaching reps." },
};

const RegularSeason = () => {
  const { state, dispatch, getCurrentTeamMatchup } = useGame();
  const navigate = useNavigate();

  if (state.careerStage === "PLAYOFFS") return <Navigate to="/hub/playoffs" replace />;
  if (state.careerStage !== "REGULAR_SEASON") return <Navigate to="/hub/offseason" replace />;
  if (state.league.phase === "REGULAR_SEASON_GAMEPLAN") return <Navigate to="/hub/gameplan" replace />;

  const initialAlloc = useMemo(
    () => normalizePracticeAllocation(state.practicePlan?.allocation ?? DEFAULT_PRACTICE_PLAN.allocation, PRACTICE_POINTS_BUDGET),
    [state.practicePlan?.allocation],
  );
  const [allocation, setAllocation] = useState<PracticeAllocation>(initialAlloc);
  const [step, setStep] = useState<"ALLOCATE" | "CONFIRM">("ALLOCATE");

  useEffect(() => setAllocation(initialAlloc), [initialAlloc]);

  const current = getCurrentTeamMatchup("REGULAR_SEASON");
  const matchup = current?.matchup;
  const teamId = state.acceptedOffer?.teamId;
  const opponentId = matchup ? (matchup.homeTeamId === teamId ? matchup.awayTeamId : matchup.homeTeamId) : undefined;
  const opponent = opponentId ? getTeamById(opponentId) : null;

  const used = allocation.fundamentals + allocation.schemeInstall + allocation.conditioning;
  const remaining = PRACTICE_POINTS_BUDGET - used;
  const preview = getEffectPreview({ weeklyBudget: PRACTICE_POINTS_BUDGET, allocation, neglectWeeks: state.practiceNeglectCounters ?? DEFAULT_PRACTICE_PLAN.neglectWeeks });

  const injurySignal = useMemo(() => {
    if (!teamId) return "Moderate";
    const roster = getEffectivePlayersByTeam(state, teamId);
    const avgFatigue = roster.length
      ? roster.reduce((acc, p) => acc + (state.playerFatigueById[String((p as any).playerId)]?.fatigue ?? 50), 0) / roster.length
      : 50;
    const activeInjuries = (state.injuries ?? []).filter((inj) => inj.teamId === teamId && inj.status !== "QUESTIONABLE").length;
    const loadScore = avgFatigue * 0.015 + activeInjuries * 0.2 - allocation.conditioning * 0.18;
    if (loadScore < 0.9) return "Low";
    if (loadScore < 1.6) return "Moderate";
    return "Elevated";
  }, [allocation.conditioning, state, teamId]);

  const adjust = (cat: PracticeCategory, delta: number) => {
    setAllocation((prev) => {
      const next = { ...prev, [cat]: Math.max(0, prev[cat] + delta) };
      if (delta > 0 && prev.fundamentals + prev.schemeInstall + prev.conditioning >= PRACTICE_POINTS_BUDGET) return prev;
      return next;
    });
  };

  const confirmPractice = () => {
    dispatch({ type: "SET_PRACTICE_PLAN", payload: { weeklyBudget: PRACTICE_POINTS_BUDGET, allocation, neglectWeeks: state.practiceNeglectCounters ?? DEFAULT_PRACTICE_PLAN.neglectWeeks } });
    setStep("ALLOCATE");
  };

  const kickoff = () => {
    if (!opponentId || !current) return;
    if (state.league.phase === "REGULAR_SEASON") {
      dispatch({ type: "ADVANCE_WEEK" });
      navigate("/hub/gameplan");
      return;
    }
    dispatch({ type: "START_GAME", payload: { opponentTeamId: opponentId, weekType: "REGULAR_SEASON", weekNumber: current.week } });
    navigate("/hub/playcall");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-2xl font-bold">Regular Season <span data-test="week-label">Week {state.hub.regularSeasonWeek}</span></h2>
          <p className="text-sm text-muted-foreground">Regular season currently runs {REGULAR_SEASON_WEEKS} weeks.</p>
          <p>
            Matchup: <strong>{opponent?.name ?? "No matchup available"}</strong>
          </p>
          <Button onClick={kickoff} disabled={!opponentId}>
            Kickoff
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Weekly Practice Allocation</h3>
            <Badge variant={remaining === 0 ? "default" : "outline"}>Remaining: {remaining}</Badge>
          </div>

          {(["fundamentals", "schemeInstall", "conditioning"] as PracticeCategory[]).map((cat) => (
            <div key={cat} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{CATEGORY_COPY[cat].title} <span className="text-xs text-muted-foreground">({allocation[cat]} pts)</span></div>
                  <div className="text-xs text-muted-foreground">{CATEGORY_COPY[cat].tradeoff}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => adjust(cat, -1)} disabled={allocation[cat] <= 0}>-</Button>
                  <Button size="sm" onClick={() => adjust(cat, 1)} disabled={remaining <= 0}>+</Button>
                </div>
              </div>
            </div>
          ))}

          <div className="text-sm text-muted-foreground">
            Tradeoffs: Discipline {Math.round(Math.abs(preview.mentalErrorMod) * 100)}% | Scheme concept +{preview.schemeConceptBonus.toFixed(1)} | Injury risk {preview.injuryRiskMod >= 0 ? "+" : ""}{Math.round(preview.injuryRiskMod * 100)}% | Late-game retention +{preview.lateGameRetentionBonus.toFixed(1)}
          </div>
          <div className="text-sm">Injury Risk Signal: <strong>{injurySignal}</strong></div>

          {step === "CONFIRM" ? (
            <div className="rounded-md border p-3 text-sm space-y-2">
              <div className="font-medium">Confirm this practice script?</div>
              <div>Fundamentals {allocation.fundamentals} • Scheme Install {allocation.schemeInstall} • Conditioning {allocation.conditioning}</div>
              <div className="flex gap-2">
                <Button onClick={confirmPractice}>Confirm Practice Plan</Button>
                <Button variant="outline" onClick={() => setStep("ALLOCATE")}>Back</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setStep("CONFIRM")} disabled={remaining !== 0}>Review Confirmation</Button>
          )}

          {/* STUB — Phase N: deferred targeted-development UI */}
          <div className="rounded-md border border-dashed p-3 opacity-70">
            <div className="font-medium">Target Player (Coming Soon)</div>
            <div className="text-xs text-muted-foreground">Individual player targeting will be enabled in a future phase.</div>
            <Button size="sm" variant="outline" disabled className="mt-2">Select Target</Button>
          </div>

          <div className="flex gap-2">
            <Button data-test="advance-week" variant="secondary" onClick={() => dispatch({ type: "ADVANCE_WEEK" })}>Advance Week</Button>
          </div>
          {state.lastPracticeOutcomeSummary ? <p className="text-sm text-muted-foreground">{state.lastPracticeOutcomeSummary}</p> : null}
          {state.uiToast ? <p className="text-xs text-muted-foreground">{state.uiToast}</p> : null}
        </CardContent>
      </Card>

      {teamId ? <StandingsPanel myTeamId={teamId} /> : null}
    </div>
  );
};

export default RegularSeason;
