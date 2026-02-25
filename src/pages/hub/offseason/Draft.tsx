import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getDraftClass as getDraftClassFromSim } from "@/engine/draftSim";
import { IntelMeters } from "@/components/IntelMeters";
import { normalizeScoutingDraftPosition } from "@/utils/positionTaxonomy";

export default function Draft() {
  const { state, dispatch } = useGame();
  const [pos, setPos] = useState("ALL");
  const sim = state.draft;
  const scouting = state.offseasonData.scouting;

  useEffect(() => {
    if (!sim.started) dispatch({ type: "DRAFT_INIT" });
    else if (!sim.complete && sim.slots[sim.cursor]?.teamId !== sim.userTeamId) dispatch({ type: "DRAFT_CPU_ADVANCE" });
  }, [dispatch, sim]);

  const available = useMemo(() => {
    let list = getDraftClassFromSim().filter((p) => !sim.takenProspectIds[p.prospectId]);
    if (pos !== "ALL") list = list.filter((p) => normalizeScoutingDraftPosition(p.pos) === pos);
    return list;
  }, [sim.takenProspectIds, pos]);

  const onClock = sim.slots[sim.cursor]?.teamId === sim.userTeamId;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">DRAFT</h1><div>{onClock ? "YOU ARE ON THE CLOCK" : "CPU SIMULATING"}</div></div>
      <div className="overflow-x-auto pb-1"><div className="flex min-w-max gap-2">{["ALL", "QB", "RB", "WR", "TE", "OL", "DT", "EDGE", "LB", "CB", "S"].map((x) => <button key={x} className="min-h-11 rounded-full border px-3 py-1" onClick={() => setPos(x)}>{x}</button>)}</div></div>
      {available.slice(0, 80).map((p) => (
        <div key={p.prospectId} className="border rounded p-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">{p.name} ({p.pos})</div>
            <IntelMeters intel={scouting.intelByProspectId[p.prospectId]} />
          </div>
          <div className="flex flex-col gap-2">
            <button disabled={!onClock} className="min-h-11 rounded border px-3 py-1 disabled:opacity-50" onClick={() => dispatch({ type: "DRAFT_USER_PICK", payload: { prospectId: p.prospectId } })}>Draft Player</button>
            <button className="min-h-11 rounded border px-3 py-1" onClick={() => dispatch({ type: "SCOUTING_SPEND", payload: { targetType: "PROSPECT", targetId: p.prospectId, actionType: "FILM_DEEP", prospect: { id: p.prospectId, name: p.name, pos: p.pos, archetype: "Prospect", grade: 70, ras: 50, interview: 50 } } })}>Deep Scout (-5)</button>
          </div>
        </div>
      ))}
    </div>
  );
}
