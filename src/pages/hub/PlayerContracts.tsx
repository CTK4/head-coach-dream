import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamRosterPlayers, getContractById } from "@/data/leagueDb";
import { getContractSummaryForPlayer } from "@/engine/rosterOverlay";

function money(n: number): string {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `$${Math.round(v / 100_000) / 10}M`;
  if (v >= 1_000) return `$${Math.round(v / 100) / 10}K`;
  return `$${v}`;
}

export default function PlayerContracts() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;

  const rows = useMemo(() => {
    if (!teamId) return [];
    return getTeamRosterPlayers(String(teamId))
      .map((p: any) => {
        const contractId = String(p.contractId ?? "");
        const c = contractId ? getContractById(contractId) : null;
        const summary = getContractSummaryForPlayer(p.playerId, state);
        const capHit = Number(summary?.capHit ?? c?.capHit ?? c?.aav ?? 0);
        const yearsLeft = Number(summary?.yearsLeft ?? c?.yearsLeft ?? 0);
        return {
          playerId: String(p.playerId),
          name: String(p.fullName),
          pos: String(p.pos ?? "UNK").toUpperCase(),
          ovr: Number(p.overall ?? 0),
          capHit,
          yearsLeft,
        };
      })
      .sort((a, b) => b.capHit - a.capHit);
  }, [teamId, state]);

  return (
    <div className="min-w-0">
      <ScreenHeader title="PLAYER CONTRACTS" subtitle="Roster cap hits" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">Tap a player for details and actions.</div>
          <Badge variant="outline">{rows.length}</Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {rows.map((r) => (
                <Link
                  key={r.playerId}
                  to={`/contracts/player/${r.playerId}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {r.name} <span className="font-normal text-slate-400">({r.pos} {r.ovr})</span>
                    </div>
                    <div className="text-xs text-slate-400">Years left: {r.yearsLeft}</div>
                  </div>
                  <div className="tabular-nums text-sm font-semibold">{money(r.capHit)}</div>
                </Link>
              ))}
              {rows.length === 0 ? <div className="p-4 text-sm text-slate-400">No roster found for this team.</div> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
