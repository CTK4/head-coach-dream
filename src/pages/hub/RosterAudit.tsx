import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { buildCapTable } from "@/engine/contractMath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { PlayerStatusIcons, StatusLegend } from "@/components/franchise-hub/PlayerStatusUI";

function money(n: number) {
  const m = n / 1_000_000;
  const abs = Math.abs(m);
  const s = abs >= 10 ? `${Math.round(m)}M` : `${Math.round(m * 10) / 10}M`;
  return `${m < 0 ? "-" : ""}$${s}`;
}

export default function RosterAudit() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [restructureOpen, setRestructureOpen] = useState(false);

  const players = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, teamId);
  }, [state, teamId]);

  const selected = useMemo(() => players.find((p) => p.playerId === playerId) ?? null, [players, playerId]);
  const capTable = useMemo(() => buildCapTable(state), [state]);

  return (
    <HubShell title="ROSTER REVIEW">
      <div className="space-y-4">
        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardHeader className="space-y-3">
            <CardTitle className="flex flex-col gap-2 text-slate-100 md:flex-row md:items-center md:justify-between">
              <span>Roster Audit Dashboard</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-200/70">Players</span>
                  <Badge variant="secondary">{players.length}</Badge>
                </div>
                <Button onClick={() => setRestructureOpen(true)} disabled={!selected}>
                  Restructure
                </Button>
              </div>
            </CardTitle>

            <div className="text-sm text-slate-200/70">Review contracts, cap impact, restructures, cut projections — with status icons.</div>

            <StatusLegend />
          </CardHeader>
        </Card>

        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-100">Players</div>
              <Badge variant="outline">{players.length} total</Badge>
            </div>

            <div className="grid gap-2">
              {players.map((p: any) => {
                const apy = getContractSummaryForPlayer(state, p.playerId).apy;

                return (
                  <button
                    key={p.playerId}
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      p.playerId === playerId
                        ? "border-emerald-400/50 bg-emerald-900/20"
                        : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"
                    }`}
                    onClick={() => setPlayerId(p.playerId)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-slate-100">
                            {p.name} <span className="text-slate-200/70">({normalizePos(p.pos)})</span>
                          </div>

                          <PlayerStatusIcons player={p} />
                        </div>

                        <div className="text-xs text-slate-200/70">{money(apy)} APY</div>
                      </div>

                      <div className="text-xs text-slate-200/70">{p.devTrait ?? ""}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-100">Cap Table</div>
              <Badge variant="secondary">Current</Badge>
            </div>
            <Separator className="bg-slate-300/15" />
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-300/15 bg-slate-950/30 p-3 text-xs text-slate-100">
              {JSON.stringify(capTable, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Dialog open={restructureOpen} onOpenChange={setRestructureOpen}>
          <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
            <DialogHeader>
              <DialogTitle>Restructure</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-slate-200/70">Keep existing restructure logic/UI here.</div>
            <Button onClick={() => setRestructureOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>
    </HubShell>
  );
}
