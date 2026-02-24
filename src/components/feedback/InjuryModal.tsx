import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Injury } from "@/engine/injuryTypes";

type PlayerLike = { fullName?: string; pos?: string; overall?: number };
type DepthChartImpact = { nextPlayerName: string; nextOverall: number; injuredOverall: number; impactLabel: string };

interface InjuryModalProps {
  injury: Injury;
  player: PlayerLike;
  depthChartImpact: DepthChartImpact;
  onDismiss: () => void;
}

export default function InjuryModal({ injury, player, depthChartImpact, onDismiss }: InjuryModalProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-red-500/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-red-300">Critical Injury Alert</h3>
          <p className="text-sm">{player.fullName} ({player.pos}) — {(injury as any).type ?? "Injury"} · {(injury as any).estWeeks ?? (injury as any).weeksOut ?? "Multiple"} week(s)</p>
          <div className="rounded border border-border/60 p-3 text-sm">
            <p className="font-medium">Depth chart impact</p>
            <p>{depthChartImpact.nextPlayerName} moves to starter. {depthChartImpact.nextOverall} vs {depthChartImpact.injuredOverall} — {depthChartImpact.impactLabel}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" onClick={onDismiss}>View Depth Chart</Button>
            <Button variant="outline" onClick={onDismiss}>Open Free Agency</Button>
            <Button onClick={onDismiss}>Dismiss</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
