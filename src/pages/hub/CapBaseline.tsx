import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { computeCapLedger } from "@/engine/capLedger";
import { computeCutProjection } from "@/engine/contractMath";
import { getPlayers } from "@/data/leagueDb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function money(v: number): string {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
}

export default function CapBaseline() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const snap = useMemo(() => computeCapLedger(state, teamId), [state, teamId]);

  const designationRows = useMemo(() => {
    const des = state.offseasonData.rosterAudit.cutDesignations;
    const players = getPlayers();
    return Object.entries(des)
      .filter(([, v]) => v === "POST_JUNE_1")
      .map(([playerId]) => {
        const p: any = players.find((x: any) => String(x.playerId) === String(playerId));
        const proj = computeCutProjection(state, String(playerId), true);
        return {
          playerId: String(playerId),
          name: String(p?.fullName ?? "Unknown"),
          pos: String(p?.pos ?? "UNK"),
          deadThisYear: proj.deadThisYear,
          deadNextYear: proj.deadNextYear,
          savingsThisYear: proj.savingsThisYear,
        };
      })
      .sort((a, b) => b.savingsThisYear - a.savingsThisYear);
  }, [state]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cap Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cap {money(snap.cap)} · Committed {money(snap.committed)} · Space {money(snap.capSpace)} · Dead Now {money(snap.deadThisYear)} · Dead Next {money(snap.deadNextYear)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Designations Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {designationRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No Post–June 1 cut designations.</div>
          ) : (
            <div className="rounded-lg border">
              <div className="p-3 text-sm font-semibold">Post–June 1 Cuts</div>
              <Separator />
              <div className="divide-y">
                {designationRows.map((r) => (
                  <div key={r.playerId} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.name} <span className="text-muted-foreground">({r.pos})</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Save now {money(r.savingsThisYear)} · Dead now {money(r.deadThisYear)} · Dead next {money(r.deadNextYear)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{money(r.savingsThisYear)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
