import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPositionLabel } from "@/lib/displayLabels";

export default function Cutdowns() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const roster = useMemo(() => getEffectivePlayersByTeam(state, teamId).sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0)), [state, teamId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Final Cutdowns</CardTitle>
        <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
          Continue
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">
          Placeholder cutdown management. Current roster count: {roster.length}. Cut button is on Finances page for now.
        </div>
        <ScrollArea className="h-[60vh] pr-3">
          <div className="space-y-2">
            {roster.slice(0, 80).map((p: any) => (
              <div key={p.playerId} className="rounded-xl border border-border p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.fullName}</div>
                  <div className="text-xs text-muted-foreground">{getPositionLabel(p.pos)} · OVR {p.overall}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}