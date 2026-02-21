import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { buildCapTable } from "@/engine/contractMath";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PlayerStatusIcons, StatusLegend } from "@/components/franchise-hub/PlayerStatusUI";

function money(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0.00M";
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export default function RosterAudit() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [restructureOpen, setRestructureOpen] = useState(false);

  const players = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, String(teamId));
  }, [state, teamId]);

  const selected = useMemo(() => players.find((p) => String(p.playerId) === String(playerId)) ?? null, [players, playerId]);
  const capTable = useMemo(() => selected ? buildCapTable(state, String(selected.playerId)) : null, [state, selected]);

  return (
    <div className="space-y-4 overflow-x-hidden">
        <HubPageCard
          title="Roster Audit Dashboard"
          subtitle="Review contracts, cap impact, restructures, cut projections — with status icons."
          right={
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200/70">Players</span>
                <Badge variant="secondary">{players.length}</Badge>
              </div>
              <Button onClick={() => setRestructureOpen(true)} disabled={!selected}>
                Restructure
              </Button>
            </>
          }
        >
          <StatusLegend />
        </HubPageCard>

      <HubPageCard
          title="Players"
          subtitle={<span className="text-slate-200/70">Tap a player to view contract summary. Tap the Issue icon for details.</span>}
          right={<Badge variant="outline">{players.length} total</Badge>}
        >
          <Separator className="my-3 bg-slate-300/15" />

          <div className="grid gap-2 overflow-x-hidden">
            {players.map((p: any) => {
              const summary = getContractSummaryForPlayer(state, p.playerId);
              const apy = summary?.apy ?? summary?.salary ?? 0;

              return (
                <button
                  key={String(p.playerId)}
                  type="button"
                  className={`w-full min-w-0 rounded-lg border p-3 text-left transition ${
                    String(p.playerId) === String(playerId)
                      ? "border-emerald-400/50 bg-emerald-900/20"
                      : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"
                  }`}
                  onClick={() => setPlayerId(String(p.playerId))}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 min-w-[240px]">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <div className="truncate font-semibold text-slate-100">
                          {p.name ?? p.fullName ?? "Player"} <span className="text-slate-200/70">({normalizePos(String(p.pos ?? "UNK"))})</span>
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
        </HubPageCard>

        <HubPageCard title="Cap Table" subtitle="Debug view (temporary).">
          <Separator className="my-3 bg-slate-300/15" />
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-300/15 bg-slate-950/30 p-3 text-xs text-slate-100">
            {JSON.stringify(capTable, null, 2)}
          </pre>
        </HubPageCard>

        <Dialog open={restructureOpen} onOpenChange={setRestructureOpen}>
          <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
            <DialogHeader>
              <DialogTitle>Restructure</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-slate-200/70">Hook your restructure UI here.</div>
            <Button onClick={() => setRestructureOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>
  );
}
