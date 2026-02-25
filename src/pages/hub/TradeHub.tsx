import { getPositionLabel } from "@/lib/displayLabels";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGame } from "@/context/GameContext";
import { getTeams } from "@/data/leagueDb";
import { getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import { getDeadlineStatus } from "@/engine/tradeDeadline";
import { draftPickTradeValue, evaluateTradeProposal, playerTradeValue } from "@/engine/tradeEngine";
import type { DraftPick, TradeProposal, TradeResponse } from "@/types/trades";

function toggleInSet(setter: (fn: (s: Set<string>) => Set<string>) => void, id: string) {
  setter((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

function valuationTone(delta: number) {
  if (Math.abs(delta) <= 5) return { text: "Fair", cls: "text-slate-300" };
  if (delta > 5) return { text: `+${delta} in yours`, cls: "text-emerald-400" };
  return { text: `+${Math.abs(delta)} in theirs`, cls: "text-red-400" };
}

export default function TradeHub() {
  const { state, dispatch } = useGame();
  const userTeamId = state.acceptedOffer?.teamId;
  const [partnerTeamId, setPartnerTeamId] = useState("");
  const [queryLeft, setQueryLeft] = useState("");
  const [queryRight, setQueryRight] = useState("");
  const [leftPos, setLeftPos] = useState("ALL");
  const [rightPos, setRightPos] = useState("ALL");
  const [offerPlayers, setOfferPlayers] = useState<Set<string>>(new Set());
  const [receivePlayers, setReceivePlayers] = useState<Set<string>>(new Set());
  const [offerPickKeys, setOfferPickKeys] = useState<Set<string>>(new Set());
  const [receivePickKeys, setReceivePickKeys] = useState<Set<string>>(new Set());
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [rounds, setRounds] = useState(0);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<TradeResponse | null>(null);
  const [lastProposal, setLastProposal] = useState<TradeProposal | null>(null);

  if (!userTeamId) return <div className="p-4 text-sm text-muted-foreground">Accept a team offer to open Trade Hub.</div>;

  const teams = useMemo(() => getTeams().filter((t) => t.isActive && t.teamId !== userTeamId), [userTeamId]);
  const week = Number(state.league.week ?? state.week ?? 1);
  const deadlineWeek = Number(state.league.tradeDeadlineWeek ?? 11);
  const deadlineStatus = getDeadlineStatus(week, deadlineWeek);
  const postDeadlineLocked = state.careerStage === "REGULAR_SEASON" && deadlineStatus === "passed";

  const myRoster = useMemo(() => getEffectivePlayersByTeam(state, userTeamId).map((p: any) => ({ id: String(p.playerId), name: String(p.fullName), pos: String(p.pos ?? "UNK"), age: Number(p.age ?? 24), ovr: Number(p.overall ?? 60) })), [state, userTeamId]);
  const theirRoster = useMemo(() => partnerTeamId ? getEffectivePlayersByTeam(state, partnerTeamId).map((p: any) => ({ id: String(p.playerId), name: String(p.fullName), pos: String(p.pos ?? "UNK"), age: Number(p.age ?? 24), ovr: Number(p.overall ?? 60) })) : [], [state, partnerTeamId]);

  const myPicks = useMemo(() => (state.draft?.slots ?? [])
    .filter((s: any) => String(s.teamId) === String(userTeamId))
    .map((s: any) => ({ round: Number(s.round), year: Number(state.season) + 1, originalTeamId: String(s.originalTeamId), currentTeamId: String(s.teamId) } as DraftPick)), [state.draft?.slots, state.season, userTeamId]);
  const theirPicks = useMemo(() => (state.draft?.slots ?? [])
    .filter((s: any) => String(s.teamId) === String(partnerTeamId))
    .map((s: any) => ({ round: Number(s.round), year: Number(state.season) + 1, originalTeamId: String(s.originalTeamId), currentTeamId: String(s.teamId) } as DraftPick)), [state.draft?.slots, state.season, partnerTeamId]);

  const filteredMine = myRoster.filter((p) => (leftPos === "ALL" || normalizePos(p.pos) === leftPos) && (!queryLeft.trim() || p.name.toLowerCase().includes(queryLeft.toLowerCase())));
  const filteredTheirs = theirRoster.filter((p) => (rightPos === "ALL" || normalizePos(p.pos) === rightPos) && (!queryRight.trim() || p.name.toLowerCase().includes(queryRight.toLowerCase())));

  const selectedMine = myRoster.filter((p) => offerPlayers.has(p.id));
  const selectedTheirs = theirRoster.filter((p) => receivePlayers.has(p.id));
  const selectedMyPicks = myPicks.filter((p) => offerPickKeys.has(`${p.round}|${p.originalTeamId}`));
  const selectedTheirPicks = theirPicks.filter((p) => receivePickKeys.has(`${p.round}|${p.originalTeamId}`));

  const yourValue = selectedMine.reduce((s, p) => s + playerTradeValue({ playerId: p.id, name: p.name, teamId: userTeamId, pos: p.pos, age: p.age, overall: p.ovr }), 0)
    + selectedMyPicks.reduce((s, p) => s + draftPickTradeValue(p.round, p.year, Number(state.season)), 0);
  const theirValue = selectedTheirs.reduce((s, p) => s + playerTradeValue({ playerId: p.id, name: p.name, teamId: partnerTeamId, pos: p.pos, age: p.age, overall: p.ovr }), 0)
    + selectedTheirPicks.reduce((s, p) => s + draftPickTradeValue(p.round, p.year, Number(state.season)), 0);
  const valueDelta = yourValue - theirValue;
  const tone = valuationTone(valueDelta);

  const minRosterViolation = useMemo(() => {
    if (!partnerTeamId) return null;
    const myPost = myRoster.length - selectedMine.length + selectedTheirs.length;
    const theirPost = theirRoster.length - selectedTheirs.length + selectedMine.length;
    if (myPost < 46 || theirPost < 46) return "Trade invalid: one team would drop below the 46-man minimum roster.";
    return null;
  }, [myRoster.length, partnerTeamId, selectedMine.length, selectedTheirs.length, theirRoster.length]);

  const aiNeedPos = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of theirRoster) counts[normalizePos(p.pos)] = (counts[normalizePos(p.pos)] ?? 0) + 1;
    const needs = ["QB","RB","WR","TE","OL","DL","EDGE","LB","CB","S"];
    return needs.sort((a,b)=>(counts[a]??0)-(counts[b]??0))[0] ?? "WR";
  }, [theirRoster]);

  function buildProposal(): TradeProposal | null {
    if (!partnerTeamId) return null;
    return {
      id: `TP_${Date.now()}`,
      initiatorSide: { teamId: userTeamId, players: selectedMine.map((p) => p.id), draftPicks: selectedMyPicks },
      receiverSide: { teamId: partnerTeamId, players: selectedTheirs.map((p) => p.id), draftPicks: selectedTheirPicks },
      status: "PENDING",
      valueDelta,
      aiWillingnessScore: Math.max(0, Math.min(100, 65 - Math.max(0, valueDelta))),
      offeredPositions: selectedMine.map((p) => normalizePos(p.pos)),
      initiatorPlayerPool: myRoster.map((p) => ({ playerId: p.id, pos: normalizePos(p.pos) })),
    };
  }

  function propose(counterSource?: TradeProposal) {
    setInlineError(null);
    if (postDeadlineLocked) {
      setInlineError(`Trades are locked after deadline week ${deadlineWeek}.`);
      return;
    }
    if (minRosterViolation) {
      setInlineError(minRosterViolation);
      return;
    }
    const proposal = counterSource ?? buildProposal();
    if (!proposal) return;
    const aiTeam = { rosterByPos: theirRoster.reduce((acc, p) => ({ ...acc, [normalizePos(p.pos)]: ((acc as any)[normalizePos(p.pos)] ?? 0) + 1 }), {}) };
    const response = evaluateTradeProposal(proposal, aiTeam, state.coach as any);
    setLastProposal(proposal);
    setResult(response);
    setResultOpen(true);
    if (response.decision === "COUNTER") setRounds((r) => r + 1);
  }

  function applyAccepted(proposal: TradeProposal) {
    dispatch({
      type: "EXECUTE_TRADE",
      payload: {
        teamA: userTeamId,
        teamB: proposal.receiverSide.teamId,
        outgoingPlayerIds: proposal.initiatorSide.players,
        incomingPlayerIds: proposal.receiverSide.players,
        outgoingPicks: proposal.initiatorSide.draftPicks,
        incomingPicks: proposal.receiverSide.draftPicks,
        valueDelta: proposal.valueDelta,
      },
    });
    setResultOpen(false);
    setOfferPlayers(new Set());
    setReceivePlayers(new Set());
    setOfferPickKeys(new Set());
    setReceivePickKeys(new Set());
    setRounds(0);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Trade Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={partnerTeamId} onChange={(e) => { setPartnerTeamId(e.target.value); setReceivePlayers(new Set()); setReceivePickKeys(new Set()); setRounds(0); }}>
              <option value="">Select AI team</option>
              {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.name}</option>)}
            </select>
            <Badge variant={deadlineStatus === "passed" ? "destructive" : "outline"}>Deadline: Week {deadlineWeek}</Badge>
            {postDeadlineLocked ? <span className="text-sm text-red-400">Post-deadline: trades blocked</span> : null}
          </div>
          {inlineError ? <div className="text-sm text-red-400">{inlineError}</div> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Your Offer</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2"><Input placeholder="Search your roster" value={queryLeft} onChange={(e)=>setQueryLeft(e.target.value)} /><Input placeholder="Pos (ALL/QB/WR...)" value={leftPos} onChange={(e)=>setLeftPos(e.target.value.toUpperCase())} /></div>
            <div className="max-h-64 overflow-auto space-y-1">
              {filteredMine.map((p) => <button key={p.id} type="button" onClick={()=>toggleInSet(setOfferPlayers,p.id)} className={`w-full rounded border px-2 py-1 text-left text-sm ${offerPlayers.has(p.id)?"bg-secondary":""}`}>{p.name} ({getPositionLabel(normalizePos(p.pos))}) OVR {p.ovr}</button>)}
            </div>
            <div className="text-sm font-medium">Your picks</div>
            <div className="max-h-32 overflow-auto space-y-1">
              {myPicks.map((p) => {
                const key = `${p.round}|${p.originalTeamId}`;
                return <button key={key} type="button" onClick={()=>toggleInSet(setOfferPickKeys,key)} className={`w-full rounded border px-2 py-1 text-left text-sm ${offerPickKeys.has(key)?"bg-secondary":""}`}>R{p.round} ({p.originalTeamId})</button>;
              })}
            </div>
            <div className="text-sm">Your offer: <span className="font-semibold">{yourValue} pts</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>You Receive</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2"><Input placeholder="Search their roster" value={queryRight} onChange={(e)=>setQueryRight(e.target.value)} /><Input placeholder="Pos (ALL/QB/WR...)" value={rightPos} onChange={(e)=>setRightPos(e.target.value.toUpperCase())} /></div>
            <div className="max-h-64 overflow-auto space-y-1">
              {filteredTheirs.map((p) => <button key={p.id} type="button" onClick={()=>toggleInSet(setReceivePlayers,p.id)} className={`w-full rounded border px-2 py-1 text-left text-sm ${receivePlayers.has(p.id)?"bg-secondary":""}`}>{p.name} ({getPositionLabel(normalizePos(p.pos))}) OVR {p.ovr}</button>)}
            </div>
            <div className="text-sm font-medium">Their picks</div>
            <div className="max-h-32 overflow-auto space-y-1">
              {theirPicks.map((p) => {
                const key = `${p.round}|${p.originalTeamId}`;
                return <button key={key} type="button" onClick={()=>toggleInSet(setReceivePickKeys,key)} className={`w-full rounded border px-2 py-1 text-left text-sm ${receivePickKeys.has(key)?"bg-secondary":""}`}>R{p.round} ({p.originalTeamId})</button>;
              })}
            </div>
            <div className="text-sm">Their offer: <span className="font-semibold">{theirValue} pts</span></div>
            <div className={`text-sm font-semibold ${tone.cls}`}>Value delta: {tone.text}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="text-xs text-muted-foreground">AI priority need: {aiNeedPos}. Negotiation rounds used: {rounds}/3</div>
          <Button onClick={() => propose()} disabled={!partnerTeamId || rounds >= 3}>Propose Trade</Button>
          {rounds >= 3 ? <div className="text-xs text-amber-400">Negotiation limit reached. Final response must be accept/reject.</div> : null}
        </CardContent>
      </Card>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{result?.decision === "ACCEPT" ? "Trade Accepted" : result?.decision === "COUNTER" ? "Counter Proposal" : "Trade Rejected"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">{result?.message}</div>
            {result?.decision === "ACCEPT" && lastProposal ? <Button onClick={() => applyAccepted(lastProposal)}>Confirm & Execute</Button> : null}
            {result?.decision === "COUNTER" && result.counterProposal ? (
              <div className="space-y-2">
                <div className="text-sm">Counter asks for one more asset.</div>
                <div className="flex gap-2">
                  <Button onClick={() => applyAccepted(result.counterProposal!)}>Accept Counter</Button>
                  <Button variant="secondary" onClick={() => setResultOpen(false)}>Decline</Button>
                  <Button variant="outline" onClick={() => { setResultOpen(false); if (rounds < 3) propose(result.counterProposal!); }}>Counter Back</Button>
                </div>
              </div>
            ) : null}
            {result?.decision === "REJECT" ? <Button onClick={() => setResultOpen(false)}>Dismiss</Button> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
