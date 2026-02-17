import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/context/GameContext";
import { getPlayersByTeam, getContractById } from "@/data/leagueDb";

function moneyM(n: number) {
  return `$${Math.round((n / 1_000_000) * 10) / 10}M/yr`;
}

function depthLabels(players: Array<{ playerId: string; pos: string; overall: number }>) {
  const byPos: Record<string, Array<{ id: string; ovr: number }>> = {};
  for (const p of players) (byPos[p.pos] ??= []).push({ id: p.playerId, ovr: p.overall });
  for (const pos of Object.keys(byPos)) byPos[pos].sort((a, b) => b.ovr - a.ovr);

  const out: Record<string, string> = {};
  for (const [pos, list] of Object.entries(byPos)) {
    list.forEach((p, idx) => {
      out[p.id] = `${pos}${idx + 1}`;
    });
  }
  return out;
}

export default function ResignPlayers() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;

  const rows = useMemo(() => {
    if (!teamId) return [];
    const roster = getPlayersByTeam(teamId).map((p) => ({
      playerId: String(p.playerId),
      fullName: String(p.fullName),
      pos: String(p.pos ?? "UNK").toUpperCase(),
      age: Number(p.age ?? 0),
      overall: Number(p.overall ?? 0),
      contractId: String(p.contractId ?? ""),
    }));

    const depth = depthLabels(roster);

    return roster
      .map((p) => {
        const c = p.contractId ? getContractById(p.contractId) : undefined;
        const endSeason = c?.endSeason != null ? Number(c.endSeason) : undefined;
        const ask =
          c?.salaryY1 != null
            ? Number(c.salaryY1)
            : Math.max(750_000, Math.round((p.overall * 120_000) / 50) * 50);
        return { ...p, depth: depth[p.playerId] ?? "", endSeason, ask };
      })
      .filter((p) => p.endSeason === state.season)
      .sort((a, b) => b.overall - a.overall);
  }, [teamId, state.season]);

  if (!teamId) {
    return (
      <Card>
        <CardContent className="p-6">No team selected.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">Re-signing / Tags</div>
            <div className="text-sm text-muted-foreground">Make decisions on expiring contracts.</div>
          </div>
          <Badge variant="outline">Step 1</Badge>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rows.map((p) => (
          <Card key={p.playerId}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {p.fullName} <span className="text-muted-foreground">({p.pos})</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Age {p.age} · {p.depth || "—"} · Ask: {moneyM(p.ask)}
                  </div>
                </div>
                <Badge variant="outline">OVR {p.overall}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">Re-sign</Button>
                <Button size="sm" variant="secondary">Franchise</Button>
                <Button size="sm" variant="secondary">Transition</Button>
                <Button size="sm" variant="outline">Let Walk</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
