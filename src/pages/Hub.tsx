import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGame, type CareerStage } from "@/context/GameContext";
import { getTeamById, getTeamSummary } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function stageToRoute(stage: CareerStage): string {
  switch (stage) {
    case "STAFF_CONSTRUCTION":
      return "/hub/assistant-hiring";
    case "ROSTER_REVIEW":
      return "/hub/roster-audit";
    case "RESIGN":
      return "/hub/resign";
    case "COMBINE":
      return "/hub/combine";
    case "TAMPERING":
      return "/hub/tampering";
    case "FREE_AGENCY":
      return "/hub/free-agency";
    case "PRE_DRAFT":
      return "/hub/pre-draft";
    case "DRAFT":
      return "/hub/draft";
    case "TRAINING_CAMP":
      return "/hub/training-camp";
    case "PRESEASON":
      return "/hub/preseason";
    case "CUTDOWNS":
      return "/hub/cutdowns";
    case "REGULAR_SEASON":
      return "/hub/regular-season";
    default:
      return "/hub";
  }
}

function nextStageForNavigate(stage: CareerStage): CareerStage {
  if (stage === "OFFSEASON_HUB") return "STAFF_CONSTRUCTION";
  return stage;
}

function showPhase2CTA(stage: CareerStage) {
  return ["ROSTER_REVIEW", "RESIGN", "TAMPERING", "FREE_AGENCY"].includes(stage);
}

const Hub = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const teamId = state.acceptedOffer?.teamId;
  const team = teamId ? getTeamById(teamId) : null;
  const summary = teamId ? getTeamSummary(teamId) : null;

  const stageLabel = state.careerStage.replaceAll("_", " ");

  const drivers = useMemo(() => {
    const last = state.memoryLog.slice(-8).reverse();
    return last.map((e) => {
      if (e.type === "FA_SIGNED") return "Signed free agent";
      if (e.type === "PLAYER_CUT") return "Roster cut";
      if (e.type === "STAGE_ADVANCED") return "Advanced offseason stage";
      if (e.type === "SEASON_ADVANCED") return "New season";
      return e.type;
    });
  }, [state.memoryLog]);

  if (!teamId || !team) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No team assigned. Please complete the hiring process.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{team.name}</div>
              <Badge variant="secondary">Season {state.season}</Badge>
            </div>
            <Badge variant="outline">Stage: {stageLabel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {summary ? `OVR ${summary.overall} · Off ${summary.offense} · Def ${summary.defense}` : "—"}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(stageToRoute(state.careerStage))}>
              Go to Stage
            </Button>
            <Button
              className="bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
              onClick={() => {
                const targetStage = nextStageForNavigate(state.careerStage);
                dispatch({ type: "ADVANCE_CAREER_STAGE" });
                navigate(stageToRoute(targetStage));
              }}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPhase2CTA(state.careerStage) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Decision Needed</span>
              <Badge variant={state.finances.capSpace < 0 ? "destructive" : "outline"}>
                Cap Space {state.finances.capSpace < 0 ? "Negative" : "OK"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Phase 2 tools: finalize cap baseline, audit contracts, and decide tags before the market opens.
            </div>
            {state.careerStage === "FREE_AGENCY" ? (
              <div className="flex flex-wrap gap-2 mt-2">
                <Link to="/hub/free-agency">
                  <Button size="sm" variant="secondary">Free Agency</Button>
                </Link>
                <Link to="/hub/trades">
                  <Button size="sm" variant="secondary">Trades</Button>
                </Link>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link to="/hub/cap-baseline">
                <Button variant="secondary">Cap Baseline</Button>
              </Link>
              <Link to="/hub/roster-audit">
                <Button variant="secondary">Roster Audit</Button>
              </Link>
              <Link to="/hub/tag-center">
                <Button variant="secondary">Tag Center</Button>
              </Link>
            </div>
            {state.finances.capSpace < 0 ? <div className="text-sm text-destructive">You are cap-illegal. Open Audit to fix.</div> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>News</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-2">
                {state.hub.news.map((n, i) => (
                  <div key={i} className="text-sm border-b border-border/50 pb-2 last:border-0">
                    {n}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {drivers.length === 0 ? <div className="text-sm text-muted-foreground">No events yet.</div> : null}
            {drivers.slice(0, 6).map((d, i) => (
              <div key={i} className="text-sm text-muted-foreground">
                • {d}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Hub;
