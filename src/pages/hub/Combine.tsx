import { useEffect, useMemo, useState } from "react";
import { useGame, getDraftClass } from "@/context/GameContext";
import { IntelMeters } from "@/components/IntelMeters";
import { ProspectProfileModal } from "@/components/ProspectProfileModal";
import { getPositionLabel } from "@/lib/displayLabels";
import { computeCombineScore, formatCombineScore10 } from "@/engine/scouting/combineScore";

const POS_TABS = ["Top", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"];

const toProspect = (r: Record<string, any>, idx: number) => ({
  id: String(r["Player ID"] ?? `DC_${idx + 1}`),
  name: String(r["Name"] ?? "Prospect"),
  pos: String(r["POS"] ?? "UNK").toUpperCase(),
  archetype: "Prospect",
  grade: Number(r["Grade"] ?? r["Overall"] ?? 70),
  ras: Number(r["RAS"] ?? 50),
  interview: Number(r["Interview"] ?? 50),
});

export default function Combine() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState("Top");
  const [profileId, setProfileId] = useState<string | null>(null);

  const draftClass = useMemo(() => getDraftClass().map((r, i) => toProspect(r, i)), []);
  const combine = state.offseasonData.combine.results ?? {};
  const intelById = state.offseasonData.scouting.intelByProspectId ?? {};

  useEffect(() => {
    dispatch({ type: "SCOUTING_WINDOW_INIT", payload: { windowId: "COMBINE" } });
    if (!state.offseasonData.combine.generated) dispatch({ type: "COMBINE_GENERATE" });
  }, [dispatch, state.offseasonData.combine.generated]);

  const prospects = useMemo(() => {
    let list = [...draftClass];
    if (tab !== "Top") list = list.filter((p) => p.pos === tab);
    return list.sort((a, b) => (combine[b.id]?.ras ?? -1) - (combine[a.id]?.ras ?? -1));
  }, [draftClass, tab, combine]);

  const profileProspect = profileId ? prospects.find((p) => p.id === profileId) ?? null : null;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">SCOUTING COMBINE</h1><div>SCP {state.offseasonData.scouting.budget.spent}/{state.offseasonData.scouting.budget.total}</div></div>
      <div className="flex gap-2 overflow-x-auto">{POS_TABS.map((t) => <button key={t} className="px-2 py-1 border rounded" onClick={() => setTab(t)}>{t}</button>)}</div>
      {prospects.slice(0, 80).map((p) => (
        <div key={p.id} className="border rounded p-3 flex items-center justify-between gap-3">
          <div>
            <button className="font-semibold" onClick={() => setProfileId(p.id)}>{p.name} ({getPositionLabel(p.pos)})</button>
            <IntelMeters intel={intelById[p.id]} />
            <div className="text-xs opacity-70">40 {combine[p.id]?.forty ?? "-"} · CS {formatCombineScore10(computeCombineScore({ ...(p as Record<string, unknown>), ...(combine[p.id] ?? {}) }).combineScore10)}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "SCOUTING_SPEND", payload: { targetType: "PROSPECT", targetId: p.id, actionType: "FILM_QUICK", prospect: p } })}>Film Quick (-2)</button>
            <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: "SCOUTING_SPEND", payload: { targetType: "PROSPECT", targetId: p.id, actionType: "COMBINE_REVIEW", prospect: p } })}>Combine Review (-3)</button>
          </div>
        </div>
      ))}
      <ProspectProfileModal open={!!profileId} onClose={() => setProfileId(null)} prospect={profileProspect} intel={profileProspect ? intelById[profileProspect.id] : undefined} combine={profileProspect ? combine[profileProspect.id] : undefined} />
    </div>
  );
}