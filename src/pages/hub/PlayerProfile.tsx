import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getPlayerAwards, getPlayerSeasonStats } from "@/data/leagueDb";
import { getEffectivePlayer, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function money(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function PlayerProfile() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { playerId = "" } = useParams();

  const base = useMemo(() => getEffectivePlayer(state, playerId), [state, playerId]);
  if (!base) return <div className="p-6">Player not found.</div>;

  const overrideTeam = state.playerTeamOverrides[playerId];
  const contract = getContractSummaryForPlayer(state, playerId);
  const stats = useMemo(() => getPlayerSeasonStats(playerId, state.season), [playerId, state.season]);
  const awards = useMemo(() => getPlayerAwards(playerId).slice(0, 3), [playerId]);

  const name = String(base.fullName);
  const pos = normalizePos(String(base.pos ?? "UNK"));
  const teamId = String(overrideTeam ?? base.teamId ?? "");
  const isFA = !teamId || teamId.toUpperCase() === "FREE_AGENT";
  const ovr = clamp100(Number(base.overall ?? 0));
  const yearsRemaining = contract?.yearsRemaining ?? 0;
  const capHit = contract?.capHit ?? 0;
  const totalValue = contract?.total ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{name}</div>
            <div className="text-sm text-muted-foreground">{pos} · Age {Number(base.age ?? 0)}</div>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{isFA ? "Free Agent" : `Team: ${teamId}`}</Badge>
              <Badge variant="outline">OVR {ovr}</Badge>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
        <CardHeader><CardTitle className="text-base">Season Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>Pass Yards: {Number(stats?.passYds ?? stats?.passingYards ?? 0).toLocaleString()}</div>
          <div>TD: {Number(stats?.passTD ?? stats?.tdPass ?? 0)}</div>
          <div>INT: {Number(stats?.passINT ?? stats?.interceptions ?? 0)}</div>
          <div>QBR: {Number(stats?.qbr ?? stats?.qbRating ?? 0) || "—"}</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
        <CardHeader><CardTitle className="text-base">Contract</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Years Remaining</span><span>{yearsRemaining || "—"}</span></div>
          <div className="flex justify-between"><span>Cap Hit</span><span className="font-semibold">{contract ? money(capHit) : "—"}</span></div>
          <div className="flex justify-between"><span>Total Value</span><span className="font-semibold">{contract ? money(totalValue) : "—"}</span></div>
          <div className="flex justify-between"><span>Signing Bonus</span><span className="font-semibold">{contract ? money(contract.signingBonus) : "—"}</span></div>
        </CardContent>
      </Card>

      {awards.length ? (
        <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03]">
          <CardHeader><CardTitle className="text-base">Awards</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {awards.map((a, idx) => <div key={idx}>{String(a.title ?? a.award ?? "Award")} ({String(a.season ?? "")})</div>)}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
