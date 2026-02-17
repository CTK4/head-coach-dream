import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer, normalizePos } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function moneyShort(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `$${s}`;
}

export default function Finances() {
  const { state, dispatch } = useGame();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const rows = useMemo(() => {
    const ps = getEffectivePlayersByTeam(state, teamId);
    return ps
      .map((p) => {
        const c = getContractSummaryForPlayer(state, String(p.playerId));
        return {
          id: String(p.playerId),
          name: String(p.fullName),
          pos: normalizePos(String(p.pos ?? "UNK")),
          ovr: Number(p.overall ?? 0),
          capHit: Number(c?.capHit ?? 0),
          yearsLeft: Number(c?.yearsRemaining ?? 0),
          isOverride: Boolean(c?.isOverride),
        };
      })
      .sort((a, b) => b.capHit - a.capHit);
  }, [state, teamId]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Finances</span>
          <div className="flex items-center gap-2">
            <Badge variant={state.finances.capSpace < 0 ? "destructive" : "secondary"}>
              Cap Space: {moneyShort(state.finances.capSpace)}
            </Badge>
            <Badge variant="outline">Cash: {moneyShort(state.finances.cash)}</Badge>
          </div>
        </CardTitle>
        {state.finances.capSpace < 0 ? (
          <div className="text-sm text-destructive">Cap Illegal. Cut/Trade players to get under the cap.</div>
        ) : null}
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-6 pb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {rows.length} players · Season {state.season}
          </div>
          <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_SEASON" })}>
            Advance Season
          </Button>
        </div>

        <ScrollArea className="h-[65vh]">
          <div className="px-6 pb-6 space-y-3">
            {rows.slice(0, 60).map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card/50 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {r.name} <span className="text-muted-foreground">({r.pos})</span>{" "}
                    <span className="text-muted-foreground">· OVR {r.ovr}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cap Hit {moneyShort(r.capHit)} · Years Left {r.yearsLeft} {r.isOverride ? "· (Override)" : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "TRADE_PLAYER", payload: { playerId: r.id } })}>
                    Trade
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => dispatch({ type: "CUT_PLAYER", payload: { playerId: r.id } })}>
                    Cut
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
