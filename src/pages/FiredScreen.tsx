import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeamById } from "@/data/leagueDb";

export default function FiredScreen() {
  const { state, dispatch } = useGame();

  const lastFiring = state.careerHistory?.firings?.at(-1);
  const firedAt = state.firing?.firedAt;
  const teamId = lastFiring?.teamId ?? state.acceptedOffer?.teamId ?? "";
  const team = teamId ? getTeamById(teamId) : null;
  const teamName = (team as any)?.teamName ?? teamId ?? "your team";
  const season = lastFiring?.season ?? firedAt?.season ?? state.season;
  const week = lastFiring?.week ?? firedAt?.week ?? 0;
  const record = lastFiring?.record ?? { wins: 0, losses: 0 };
  const topDrivers = lastFiring?.topDrivers ?? state.firing?.drivers?.slice(0, 3).map((d) => d.label) ?? [];
  const tenureWeeks = lastFiring?.tenureWeeks ?? week;

  const totalFirings = state.careerHistory?.firings?.length ?? 1;

  function handleLookForWork() {
    dispatch({ type: "SET_CAREER_STAGE", payload: "REHIRING" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl space-y-4">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">You've Been Fired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              After {tenureWeeks} weeks with the{" "}
              <span className="font-semibold text-foreground">{teamName}</span>, you were let go
              following a {record.wins}–{record.losses} record in Season {season}.
            </p>

            {topDrivers.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Primary factors in your dismissal:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {topDrivers.map((driver) => (
                    <li key={driver} className="text-sm text-muted-foreground">
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Career Firings: {totalFirings}</Badge>
              {lastFiring && (
                <Badge variant="secondary">
                  Autonomy at Firing: {lastFiring.autonomyAtFiring}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your reputation follows you. Teams across the league are evaluating whether to take
              a chance on your coaching philosophy. Previous firings reduce your starting autonomy
              and shorten your initial leash.
            </p>
            <Button className="w-full" onClick={handleLookForWork}>
              Look for a New Opportunity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
