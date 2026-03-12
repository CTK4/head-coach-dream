import { getPositionLabel } from "@/lib/displayLabels";
import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectivePlayersByTeam, normalizePos, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import { getLeague } from "@/data/leagueDb";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PlayerStatusIcons, StatusLegend } from "@/components/franchise-hub/PlayerStatusUI";
import { Avatar } from "@/components/common/Avatar";

function money(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0.00M";
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

const POS_DEPTH_SLOTS: Record<string, number> = {
  QB: 2, RB: 3, WR: 4, TE: 2, OL: 5, DL: 4, EDGE: 3, LB: 3, CB: 4, S: 3,
};
const POS_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"];

export default function RosterAudit() {
  const SALARY_CAP = getLeague().salaryCap;
  const { state } = useGame();
  const teamId = state.acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [restructureOpen, setRestructureOpen] = useState(false);

  const players = useMemo(() => {
    if (!teamId) return [];
    return getEffectivePlayersByTeam(state, String(teamId));
  }, [state, teamId]);

  // ── Positional Depth ──────────────────────────────────────────────────────
  const depthByGroup = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const p of players) {
      const grp = normalizePos(String(p.pos ?? "UNK"));
      (groups[grp] ??= []).push(p);
    }
    // Sort each group by overall desc
    for (const grp of Object.keys(groups)) {
      groups[grp].sort((a, b) => Number(b.overall ?? b.ovr ?? 0) - Number(a.overall ?? a.ovr ?? 0));
    }
    return groups;
  }, [players]);

  // ── Expiring Contracts ────────────────────────────────────────────────────
  const expiring = useMemo(() => {
    return players
      .map((p: any) => ({ ...p, summary: getContractSummaryForPlayer(state, String(p.playerId)) }))
      .filter((p: any) => p.summary && Number(p.summary.endSeason) === state.season)
      .sort((a: any, b: any) => Number(b.overall ?? b.ovr ?? 0) - Number(a.overall ?? a.ovr ?? 0))
      .slice(0, 10);
  }, [players, state]);

  // ── Cap Posture ───────────────────────────────────────────────────────────
  const capData = useMemo(() => {
    const summaries = players
      .map((p: any) => ({ p, s: getContractSummaryForPlayer(state, String(p.playerId)) }))
      .filter((x) => !!x.s);
    const totalCapHit = summaries.reduce((sum, x) => sum + (x.s?.capHit ?? 0), 0);
    const capSpace = SALARY_CAP - totalCapHit;
    const nextYearCommitments = summaries.reduce((sum, x) => sum + (x.s?.capHitBySeason?.[state.season + 1] ?? 0), 0);
    const topHits = summaries
      .map((x) => ({ name: String(x.p.name ?? x.p.fullName ?? "Player"), pos: String(x.p.pos ?? ""), capHit: x.s?.capHit ?? 0 }))
      .sort((a, b) => b.capHit - a.capHit)
      .slice(0, 5);
    return { totalCapHit, capSpace, nextYearCommitments, topHits };
  }, [players, state]);

  const selected = useMemo(() => players.find((p: any) => String(p.playerId) === String(playerId)) ?? null, [players, playerId]);

  return (
    <div className="space-y-4 overflow-x-hidden">
      <HubPageCard
        title="Roster Audit Dashboard"
        subtitle="Depth, expiring contracts, and cap posture — all from live roster data."
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

      {/* ── Positional Depth ── */}
      <HubPageCard title="Positional Depth" subtitle="Count and average OVR of top starters by position group.">
        <Separator className="my-3 bg-slate-300/15" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {POS_ORDER.map((grp) => {
            const group = depthByGroup[grp] ?? [];
            const slots = POS_DEPTH_SLOTS[grp] ?? 3;
            const starters = group.slice(0, slots);
            const avgOvr = starters.length
              ? Math.round(starters.reduce((s, p) => s + Number(p.overall ?? p.ovr ?? 0), 0) / starters.length)
              : 0;
            const colorClass =
              avgOvr >= 80 ? "text-emerald-400" : avgOvr >= 70 ? "text-yellow-300" : "text-red-400";
            return (
              <div key={grp} className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3 text-center">
                <div className="text-xs font-semibold text-slate-400">{grp}</div>
                <div className={`text-xl font-bold ${colorClass}`}>{avgOvr || "—"}</div>
                <div className="text-xs text-slate-400">
                  {starters.length}/{slots} filled
                </div>
                <div className="text-xs text-slate-500">{group.length} total</div>
              </div>
            );
          })}
        </div>
      </HubPageCard>

      {/* ── Contract Churn ── */}
      <HubPageCard
        title="Contract Churn"
        subtitle={`Expiring contracts at end of season ${state.season} (top 10 by OVR).`}
        right={<Badge variant="outline">{expiring.length} expiring</Badge>}
      >
        <Separator className="my-3 bg-slate-300/15" />
        {expiring.length === 0 ? (
          <div className="text-sm text-slate-200/70">No expiring contracts this season.</div>
        ) : (
          <div className="space-y-2">
            {expiring.map((p: any) => {
              const apy = p.summary?.apy ?? p.summary?.salary ?? 0;
              const ovr = Number(p.overall ?? p.ovr ?? 0);
              return (
                <div key={String(p.playerId)} className="flex items-center justify-between gap-3 rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar entity={{ type: "player", id: String(p.playerId), name: String(p.name ?? p.fullName ?? "Player") }} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-100">
                        {p.name ?? p.fullName ?? "Player"}{" "}
                        <span className="text-slate-400">({getPositionLabel(normalizePos(String(p.pos ?? "UNK")))})</span>
                      </div>
                      <div className="text-xs text-slate-400">OVR {ovr} · {money(apy)} APY</div>
                    </div>
                  </div>
                  <Badge variant="outline">Expiring</Badge>
                </div>
              );
            })}
          </div>
        )}
      </HubPageCard>

      {/* ── Cap Posture ── */}
      <HubPageCard title="Cap Posture" subtitle="Current cap usage and next-year commitments.">
        <Separator className="my-3 bg-slate-300/15" />
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
            <div className="text-xs text-slate-400">Cap Hit {state.season}</div>
            <div className="text-lg font-bold text-slate-100">{money(capData.totalCapHit)}</div>
          </div>
          <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
            <div className="text-xs text-slate-400">Est. Cap Space</div>
            <div className={`text-lg font-bold ${capData.capSpace >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {money(capData.capSpace)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
            <div className="text-xs text-slate-400">Committed {state.season + 1}</div>
            <div className="text-lg font-bold text-slate-100">{money(capData.nextYearCommitments)}</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-400 mb-2">Top Cap Hits</div>
        <div className="space-y-1">
          {capData.topHits.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{h.name} <span className="text-slate-500">({h.pos})</span></span>
              <span className="font-medium text-slate-100">{money(h.capHit)}</span>
            </div>
          ))}
        </div>
      </HubPageCard>

      {/* ── Player List ── */}
      <HubPageCard
        title="Players"
        subtitle={<span className="text-slate-200/70">Tap a player to select for restructure.</span>}
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
                  <div className="flex min-w-0 min-w-[240px] items-center gap-3">
                    <Avatar
                      entity={{
                        type: "player",
                        id: String(p.playerId),
                        name: String(p.name ?? p.fullName ?? "Player"),
                      }}
                      size={44}
                    />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <div className="truncate font-semibold text-slate-100">
                        {p.name ?? p.fullName ?? "Player"}{" "}
                        <span className="text-slate-200/70">({getPositionLabel(normalizePos(String(p.pos ?? "UNK")))})</span>
                      </div>
                      <PlayerStatusIcons player={p} />
                      <div className="text-xs text-slate-200/70">{money(apy)} APY</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200/70">{p.devTrait ?? ""}</div>
                </div>
              </button>
            );
          })}
        </div>
      </HubPageCard>

      <Dialog open={restructureOpen} onOpenChange={setRestructureOpen}>
        <DialogContent className="border-slate-300/15 bg-background text-slate-100">
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
