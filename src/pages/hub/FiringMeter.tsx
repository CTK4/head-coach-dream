import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function pct(p: number) {
  return `${Math.round(Math.max(0, Math.min(1, p)) * 1000) / 10}%`;
}

export default function FiringMeter() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const week = Number(state.hub?.regularSeasonWeek ?? 1);
  const seasonYear = state.coach.tenureYear;

  useEffect(() => {
    dispatch({ type: "RECALC_FIRING_METER", payload: { week } });
  }, [dispatch, week]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Job Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Tenure Year {seasonYear}</Badge>
            <Badge variant="outline">Owner Approval {state.owner.approval}</Badge>
            <Badge variant="outline">Financial {state.owner.financialRating}</Badge>
            <Badge variant="secondary">Job Security {state.owner.jobSecurity}</Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Weekly Risk {seasonYear === 1 ? "Locked (Year 1)" : pct(state.firing.pWeekly)}</Badge>
            <Badge variant="outline">Season-End Risk {pct(state.firing.pSeasonEnd)}</Badge>
            <Badge variant="secondary">Owner personality included</Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Top Drivers</div>
            <div className="flex flex-wrap gap-2">
              {state.firing.drivers.map((d) => (
                <Badge key={d.label} variant="outline">
                  {d.label}: {d.value}
                </Badge>
              ))}
              {!state.firing.drivers.length ? <Badge variant="outline">—</Badge> : null}
            </div>
          </div>

          {state.firing.fired ? (
            <div className="space-y-2">
              <Badge variant="destructive">Fired</Badge>
              <Button onClick={() => navigate("/hub")}>Back</Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => dispatch({ type: "RECALC_FIRING_METER", payload: { week } })}>
              Refresh
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
