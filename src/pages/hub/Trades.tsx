import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { decideTrade, type TradePlayer } from "@/engine/tradeEngine";
import { getPhaseKey, isTradesAllowed } from "@/engine/phase";
import { LockedPhaseCard } from "@/components/hub/LockedPhaseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function resolveUserTeamId(state: any): string | undefined {
  return state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? state.profile?.teamId ?? state.coach?.teamId;
}

function toTradePlayer(p: any): TradePlayer {
  return {
    playerId: String(p.playerId),
    name: String(p.fullName ?? p.name ?? "Player"),
    teamId: String(p.teamId ?? ""),
    pos: p.pos ? String(p.pos) : undefined,
    age: p.age != null ? Number(p.age) : undefined,
    overall: p.overall != null ? Number(p.overall) : p.ovr != null ? Number(p.ovr) : undefined,
  };
}

export default function TradesPage() {
  const { state, dispatch } = useGame();
  const userTeamId = resolveUserTeamId(state);
  const phaseOk = isTradesAllowed(state);

  const [partnerTeamId, setPartnerTeamId] = useState("");
  const [outgoingIds, setOutgoingIds] = useState<Set<string>>(new Set());
  const [incomingIds, setIncomingIds] = useState<Set<string>>(new Set());
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{ accepted: boolean; reason: string } | null>(null);

  const teams = useMemo(() => getTeams().filter((t) => t.teamId !== userTeamId), [userTeamId]);

  const myPlayers = useMemo(() => {
    if (!userTeamId) return [];
    return getEffectivePlayersByTeam(state, String(userTeamId)).map(toTradePlayer);
  }, [state, userTeamId]);

  const partnerPlayers = useMemo(() => {
    if (!partnerTeamId) return [];
    return getEffectivePlayersByTeam(state, String(partnerTeamId)).map(toTradePlayer);
  }, [state, partnerTeamId]);

  const outgoing = useMemo(() => myPlayers.filter((p) => outgoingIds.has(p.playerId)), [myPlayers, outgoingIds]);
  const incoming = useMemo(() => partnerPlayers.filter((p) => incomingIds.has(p.playerId)), [partnerPlayers, incomingIds]);

  const decision = useMemo(() => {
    if (!userTeamId || !partnerTeamId) return null;
    const gmMode = state.strategy?.gmMode ?? "CONTEND";
    // CONTEND: slightly more lenient CPU accept (lower surplus needed), REBUILD: stricter (trading veterans away)
    const hardRejectDeficitPct = gmMode === "REBUILD" ? 0.22 : gmMode === "CONTEND" ? 0.14 : 0.18;
    const autoAcceptSurplusPct = gmMode === "REBUILD" ? 0.08 : gmMode === "CONTEND" ? 0.16 : 0.12;
    return decideTrade({
      season: Number(state.season ?? 0),
      userTeamId: String(userTeamId),
      partnerTeamId: String(partnerTeamId),
      pkg: { outgoing, incoming },
      hardRejectDeficitPct,
      autoAcceptSurplusPct,
    });
  }, [state.season, state.strategy?.gmMode, userTeamId, partnerTeamId, outgoing, incoming]);

  if (!userTeamId) {
    return <LockedPhaseCard title="TRADES" message="No team selected yet." nextAvailable="After accepting an offer." />;
  }

  if (!phaseOk) {
    const phase = getPhaseKey(state);
    return (
      <LockedPhaseCard
        title="TRADES"
        message="Trades are unavailable in the current phase."
        nextAvailable={phase === "PHASE_2_RETENTION" ? "Free Agency / Regular Season" : "Free Agency or Regular Season"}
      />
    );
  }

  function toggle(setter: (fn: (s: Set<string>) => Set<string>) => void, id: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (!decision || !partnerTeamId) return;
    setResult({ accepted: decision.accepted, reason: decision.reason });
    setResultOpen(true);
    if (!decision.accepted) return;

    dispatch({
      type: "EXECUTE_TRADE",
      payload: {
        teamA: String(userTeamId),
        teamB: String(partnerTeamId),
        outgoingPlayerIds: outgoing.map((p) => p.playerId),
        incomingPlayerIds: incoming.map((p) => p.playerId),
      },
    } as any);

    setOutgoingIds(new Set());
    setIncomingIds(new Set());
  }

  const canSubmit = Boolean(partnerTeamId) && outgoing.length > 0 && incoming.length > 0;

  return (
    <div className="space-y-4 overflow-x-hidden">
      <Card className="border-slate-300/15 bg-slate-950/35">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-100">Trade Center</div>
            <div className="text-sm text-slate-200/70">Select a partner team, build a package, submit an offer.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-md border border-slate-300/15 bg-slate-950/30 px-3 text-sm text-slate-100"
              value={partnerTeamId}
              onChange={(e) => {
                setPartnerTeamId(e.target.value);
                setIncomingIds(new Set());
              }}
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.teamId} value={t.teamId}>{t.name}</option>
              ))}
            </select>
            <Badge variant="outline">{decision ? `Accept ${Math.round((decision.acceptProb ?? 0) * 100)}%` : "Build Offer"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
        <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
          <CardContent className="min-w-0 space-y-3 p-4">
            <div className="flex items-center justify-between gap-2"><div className="text-sm font-semibold text-slate-100">Your Assets</div><Badge variant="secondary">{outgoing.length}</Badge></div>
            <Separator className="bg-slate-300/15" />
            <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
              {myPlayers.slice().sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)).map((p) => (
                <button
                  key={p.playerId}
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left transition ${outgoingIds.has(p.playerId) ? "border-emerald-400/50 bg-emerald-900/20" : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"}`}
                  onClick={() => toggle(setOutgoingIds, p.playerId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-100">{p.name} <span className="text-slate-200/70">({p.pos ?? "—"})</span></div><div className="truncate text-xs text-slate-200/70">OVR {p.overall ?? "—"} • Age {p.age ?? "—"}</div></div>
                    <Badge variant="outline">{p.overall ?? "—"}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
          <CardContent className="min-w-0 space-y-3 p-4">
            <div className="flex items-center justify-between gap-2"><div className="text-sm font-semibold text-slate-100">Their Assets</div><Badge variant="secondary">{incoming.length}</Badge></div>
            <Separator className="bg-slate-300/15" />
            {!partnerTeamId ? <div className="text-sm text-slate-200/70">Select a partner team to view their roster.</div> : (
              <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                {partnerPlayers.slice().sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)).map((p) => (
                  <button
                    key={p.playerId}
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left transition ${incomingIds.has(p.playerId) ? "border-emerald-400/50 bg-emerald-900/20" : "border-slate-300/15 bg-slate-950/20 hover:bg-slate-950/35"}`}
                    onClick={() => toggle(setIncomingIds, p.playerId)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-100">{p.name} <span className="text-slate-200/70">({p.pos ?? "—"})</span></div><div className="truncate text-xs text-slate-200/70">OVR {p.overall ?? "—"} • Age {p.age ?? "—"}</div></div>
                      <Badge variant="outline">{p.overall ?? "—"}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
          <CardContent className="space-y-3 p-4">
            <div className="text-sm font-semibold text-slate-100">Trade Meter</div>
            <Separator className="bg-slate-300/15" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-200/80"><span>Outgoing Value</span><span className="font-semibold text-slate-100">{decision ? decision.outgoingValue : 0}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-200/80"><span>Incoming Value</span><span className="font-semibold text-slate-100">{decision ? decision.incomingValue : 0}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-200/80"><span>Delta</span><span className={`font-semibold ${decision && decision.delta >= 0 ? "text-emerald-300" : "text-amber-300"}`}>{decision ? decision.delta : 0}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-200/80"><span>CPU Accept</span><span className="font-semibold text-slate-100">{decision ? `${Math.round(decision.acceptProb * 100)}%` : "—"}</span></div>
            </div>
            <div className="pt-2">
              <Button className="w-full" disabled={!canSubmit} onClick={submit}>Submit Offer</Button>
              <div className="mt-2 text-xs text-slate-200/60">MVP: player-only trades. Cap impact & picks can be added later.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>{result?.accepted ? "Trade Accepted" : "Trade Rejected"}</DialogTitle>
            <DialogDescription className="text-slate-200/70">{result?.reason ?? ""}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setResultOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
