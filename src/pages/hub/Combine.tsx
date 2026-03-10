import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { IntelMeters } from "@/components/IntelMeters";
import { getPositionLabel } from "@/lib/displayLabels";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";

const POS_TABS = ["Top", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"];

const athleticLetter = (score: number) => (score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F");

export default function Combine() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState("Top");

  const prospects = useMemo(() => {
    const list = state.offseasonData.combine.prospects ?? [];
    if (tab === "Top") return list;
    return list.filter((p) => p.pos === tab);
  }, [state.offseasonData.combine.prospects, tab]);

  const results = state.offseasonData.combine.resultsByProspectId ?? state.offseasonData.combine.results ?? {};
  const interviewPoolIds = state.offseasonData.combine.interviewPoolIds ?? [];
  const interviewPool = interviewPoolIds
    .map((id) => state.offseasonData.combine.prospects.find((p) => p.id === id))
    .filter(Boolean) as typeof prospects;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">SCOUTING COMBINE</h1>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "COMBINE_RUN_EVENTS" })}>Run Combine</button>
          <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "COMBINE_GENERATE_INTERVIEW_POOL" })}>Build Interview Pool</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">{POS_TABS.map((t) => <button key={t} className="px-2 py-1 border rounded" onClick={() => setTab(t)}>{t}</button>)}</div>

      {prospects.slice(0, 120).map((p) => {
        const r = results[p.id] ?? {};
        const scoutView = getScoutViewProspect(state, p.id);
        const confidence = Number((scoutView?.confidence ?? state.offseasonData.scouting.intelByProspectId[p.id]?.confidence ?? 0) || 0);
        const est = scoutView?.estOverallRange ?? [Math.max(40, p.grade - 12), Math.min(99, p.grade + 8)];
        const ath = Number(r.athleticismGrade ?? 0);
        return (
          <div key={p.id} className="border rounded p-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{p.name} ({getPositionLabel(p.pos)})</div>
              <IntelMeters intel={state.offseasonData.scouting.intelByProspectId[p.id]} />
              <div className="text-xs opacity-70">40 {r.forty ?? "-"} · Shuttle {r.shuttle ?? "-"} · 3C {r.threeCone ?? "-"} · Vert {r.vert ?? "-"} · Bench {r.bench ?? "-"}</div>
              <div className="text-xs opacity-70">Athleticism Grade {ath ? `${athleticLetter(ath)} (${ath})` : "-"} · Est OVR {est[0]}-{est[1]} · Confidence {Math.round(confidence * 100)}%</div>
            </div>
          </div>
        );
      })}

      <div className="border rounded p-3">
        <div className="font-semibold mb-2">Combine Interview Pool ({interviewPool.length})</div>
        {interviewPool.length === 0 ? <div className="text-sm opacity-70">No interviews selected yet.</div> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {interviewPool.map((p) => <div key={p.id} className="text-sm">{p.name} ({getPositionLabel(p.pos)})</div>)}
        </div>
      </div>
    </div>
  );
}
