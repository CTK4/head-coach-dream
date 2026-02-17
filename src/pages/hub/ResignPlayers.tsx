import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPlayers, getContracts } from "@/data/leagueDb";
import { getDepthSlotLabel } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ResignPlayers() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const teamId = state.acceptedOffer?.teamId;
  if (!teamId) return null;

  const expiring = useMemo(() => {
    const players = getPlayers().filter((p: any) => String(state.playerTeamOverrides[String(p.playerId)] ?? p.teamId) === String(teamId));
    const contracts = getContracts();
    const rows = players
      .map((p: any) => {
        const c = contracts.find((x: any) => x.contractId === p.contractId);
        const end = Number(c?.endSeason ?? state.season);
        return { p, c, end };
      })
      .filter((r) => r.end <= state.season)
      .sort((a, b) => Number(b.p.overall ?? 0) - Number(a.p.overall ?? 0));
    return rows;
  }, [state, teamId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Re-sign Window</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
            Continue
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">
          Expiring contracts (visibility: age + depth slot). Actions will be wired next.
        </div>

        <ScrollArea className="h-[60vh] pr-3">
          <div className="space-y-2">
            {expiring.length === 0 ? <div className="text-sm text-muted-foreground">No expiring contracts.</div> : null}
            {expiring.map(({ p }) => {
              const depth = getDepthSlotLabel(state, String(p.playerId));
              return (
                <div key={p.playerId} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      <button className="hover:underline" onClick={() => navigate(`/hub/player/${p.playerId}`)}>
                        {p.fullName}
                      </button>{" "}
                      <span className="text-muted-foreground">({p.pos})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Age {p.age ?? "—"} · {depth ? `Depth ${depth}` : "Depth —"} · OVR {p.overall ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Projected: —</Badge>
                    <Button size="sm" variant="secondary">
                      Re-sign
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
