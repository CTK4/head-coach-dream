import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";
import { IntelMeters } from "@/components/IntelMeters";
import { PlayerNameLink } from "@/components/players/PlayerNameLink";

const TABS = ["Top", "Offense", "Defense", "Special"];
const groupTab = (pos: string) => (["QB", "RB", "WR", "TE", "OL"].includes(pos) ? "Offense" : ["DL", "EDGE", "LB", "CB", "S"].includes(pos) ? "Defense" : ["K", "P"].includes(pos) ? "Special" : "Top");

export default function FreeAgency() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState("Top");
  const [hideSigned, setHideSigned] = useState(true);

  useEffect(() => {
    dispatch({ type: "SCOUTING_WINDOW_INIT", payload: { windowId: "FREE_AGENCY" } });
    dispatch({ type: "FA_BOOTSTRAP_FROM_TAMPERING" });
    if (!state.freeAgency.cpuTickedOnOpen) dispatch({ type: "FA_CPU_TICK" });
  }, [dispatch, state.freeAgency.cpuTickedOnOpen]);

  const pool = useMemo(() => getEffectiveFreeAgents(state).map((p: any) => ({ id: String(p.playerId), name: String(p.fullName), pos: String(p.pos ?? "UNK").toUpperCase(), age: Number(p.age ?? 0), ovr: Number(p.overall ?? 0) })), [state]);
  const shown = useMemo(() => pool.filter((p) => tab === "Top" || groupTab(p.pos) === tab).filter((p) => !hideSigned || !state.freeAgency.signingsByPlayerId[p.id]).sort((a, b) => b.ovr - a.ovr), [pool, tab, hideSigned, state.freeAgency.signingsByPlayerId]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">FREE AGENCY</h1><div className="flex gap-2"><button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "FA_OPEN_MY_OFFERS" })}>My Offers</button><button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "FA_RESOLVE" })}>Resolve</button></div></div>
      <div className="flex gap-2">{TABS.map((t) => <button key={t} className="px-2 py-1 border rounded" onClick={() => setTab(t)}>{t}</button>)}<label className="ml-2 text-sm"><input type="checkbox" checked={hideSigned} onChange={(e) => setHideSigned(e.target.checked)} /> Hide signed</label></div>
      {shown.slice(0, 120).map((p) => {
        const offers = state.freeAgency.offersByPlayerId[p.id] ?? [];
        const latestUserDecision = offers.filter((o) => o.isUser && (o.status === "ACCEPTED" || o.status === "REJECTED")).slice().sort((a, b) => b.createdWeek - a.createdWeek)[0];
        return (
        <div key={p.id} className="border rounded p-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">
              <PlayerNameLink playerId={p.id} name={p.name} pos={p.pos} namespace="free-agency" /> {state.freeAgency.signingsByPlayerId[p.id] ? "(SIGNED)" : ""}
            </div>
            <div className="text-xs opacity-70">OVR {p.ovr} · Age {p.age}</div>
            <IntelMeters intel={state.offseasonData.scouting.intelByFAId[p.id]} />
            <div className="flex gap-2 mt-2"><button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "SCOUTING_SPEND", payload: { targetType: "FA", targetId: p.id, actionType: "FA_TAPE_SCAN" } })}>Tape (-2)</button><button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "SCOUTING_SPEND", payload: { targetType: "FA", targetId: p.id, actionType: "FA_FULL_DD" } })}>Full DD (-10)</button></div>
            {latestUserDecision?.decisionReason ? <div className="text-xs opacity-70 mt-2">Reason: {latestUserDecision.decisionReason}</div> : null}
          </div>
          <button className="px-3 py-2 border rounded" onClick={() => dispatch({ type: "FA_OPEN_PLAYER", payload: { playerId: p.id } })}>Offer Contract</button>
        </div>
      );
      })}
    </div>
  );
}
