import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPositionLabel } from "@/lib/displayLabels";

const EXPIRING = [
  { id: "PLY_1001", name: "D. Reed", pos: "WR", ovr: 84, askApy: 8_500_000 },
  { id: "PLY_1002", name: "M. Carter", pos: "CB", ovr: 81, askApy: 7_000_000 },
  { id: "PLY_1003", name: "N. Hayes", pos: "OL", ovr: 78, askApy: 5_250_000 },
  { id: "PLY_1004", name: "T. Brooks", pos: "DL", ovr: 76, askApy: 4_500_000 },
];

export default function Resigning() {
  const { state, dispatch } = useGame();
  const decisions = state.offseasonData.resigning.decisions;

  const completed = useMemo(() => Object.keys(decisions).length >= EXPIRING.length, [decisions]);

  const set = (playerId: string, action: "RESIGN" | "TAG_FRANCHISE" | "TAG_TRANSITION" | "LET_WALK") => {
    const years = action === "RESIGN" ? 3 : undefined;
    const apy = action === "RESIGN" ? EXPIRING.find((x) => x.id === playerId)?.askApy : undefined;
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

      <div className="grid gap-3">
        {EXPIRING.map((p) => {
          const d = decisions[p.id];
          return (
            <Card key={p.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.name} <span className="text-muted-foreground font-normal">({getPositionLabel(p.pos)})</span></div>
                  <Badge variant="outline">OVR {p.ovr}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Ask: ${Math.round(p.askApy / 1_000_000)}M/yr</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={d?.action === "RESIGN" ? "default" : "outline"} onClick={() => set(p.id, "RESIGN")}>Re-sign</Button>
                  <Button size="sm" variant={d?.action === "TAG_FRANCHISE" ? "default" : "outline"} onClick={() => set(p.id, "TAG_FRANCHISE")}>Franchise</Button>
                  <Button size="sm" variant={d?.action === "TAG_TRANSITION" ? "default" : "outline"} onClick={() => set(p.id, "TAG_TRANSITION")}>Transition</Button>
                  <Button size="sm" variant={d?.action === "LET_WALK" ? "default" : "outline"} onClick={() => set(p.id, "LET_WALK")}>Let Walk</Button>
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