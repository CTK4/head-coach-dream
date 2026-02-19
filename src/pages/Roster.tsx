import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { PlayerStatusIcons, StatusLegend } from "@/components/franchise-hub/PlayerStatusUI";

export default function RosterPage() {
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId;

  const [playerId, setPlayerId] = useState<string | null>(null);

  const players = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, teamId);
  }, [state, teamId]);

  const selected = useMemo(() => players.find((p) => p.playerId === playerId) ?? null, [players, playerId]);

  return (
    <HubShell title="ROSTER">
      <div className="space-y-4">
        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardHeader className="space-y-2">
            <CardTitle className="flex flex-col gap-2 text-slate-100 md:flex-row md:items-center md:justify-between">
              <span>Manage Team</span>
              <Badge variant="secondary">{players.length} players</Badge>
            </CardTitle>
            <div className="text-sm text-slate-200/70">Tap the Issue icon to see why a player is flagged.</div>
            <StatusLegend />
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="border-slate-300/15 bg-slate-950/35">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-100">Players</div>
                <Badge variant="outline">{players.length}</Badge>
              </div>
              <Separator className="bg-slate-300/15" />

              <div className="grid gap-2">
                {players.map((p: any) => (
                  <button
                    key={p.playerId}
                    type="button"
                    onClick={() => setPlayerId(p.playerId)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      p.playerId === playerId
                        ? "border-emerald-400/50 bg-emerald-900/20"
                        : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-[220px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-slate-100">
                            {p.name} <span className="text-slate-200/70">({normalizePos(p.pos)})</span>
                          </div>
                          <PlayerStatusIcons player={p} />
                        </div>
                        <div className="text-xs text-slate-200/70">OVR {p.ovr ?? "—"} · Age {p.age ?? "—"}</div>
                      </div>
                      <div className="text-xs text-slate-200/70">{p.devTrait ?? ""}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-300/15 bg-slate-950/35">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-100">Player</div>
                {selected?.pos ? <Badge variant="outline">{normalizePos(selected.pos)}</Badge> : <Badge variant="outline">—</Badge>}
              </div>
              <Separator className="bg-slate-300/15" />

              {selected ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-bold text-slate-100">{selected.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">OVR {selected.ovr ?? "—"}</Badge>
                      <Badge variant="outline">Age {selected.age ?? "—"}</Badge>
                      {selected.devTrait ? <Badge variant="outline">{String(selected.devTrait)}</Badge> : null}
                    </div>
                    <div className="mt-2">
                      <PlayerStatusIcons player={selected} className="gap-2" />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3 text-sm text-slate-200/80">
                    <div className="font-semibold text-slate-100">Notes</div>
                    <div className="mt-1 text-xs text-slate-200/70">
                      This is a lightweight roster detail panel. You can extend it with depth chart, contracts, training, and more.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" disabled>
                      Depth Chart (soon)
                    </Button>
                    <Button variant="secondary" disabled>
                      Contracts (soon)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-200/70">Select a player to view details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </HubShell>
  );
}
