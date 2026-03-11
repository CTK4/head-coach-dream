import { useEffect, useMemo, useState } from "react";
import ProspectRow, { type Prospect } from "@/components/draft/ProspectRow";
import { useGame } from "@/context/GameContext";
import { generateScoutingReport } from "@/engine/scouting/reportGenerator";
import { buildProspectScoutingViewSet } from "@/engine/scouting/viewModel";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { getPositionLabel } from "@/lib/displayLabels";

const POSITION_PILLS = ["QB", "WR", "TE", "RB", "OT", "IOL", "CB", "S", "DT", "EDGE", "LB", "K", "P", "ALL"];

export default function BigBoard() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;
  const [openId, setOpenId] = useState<string | null>(null);
  const [activePos, setActivePos] = useState<string>("ALL");
  const [boardMode, setBoardMode] = useState<"MY" | "SCOUT">("MY");
  const [ascending, setAscending] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const { openProspectProfile, modal } = useProspectProfileModal(state);

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [scouting, dispatch]);

  const scoutingViewSet = useMemo(() => buildProspectScoutingViewSet(state), [state]);
  const normalizedProspects = useMemo<Prospect[]>(() => {
    return scoutingViewSet.views.map((prospect) => {
      const id = prospect.id;
      return {
        ...prospect,
        unicornConfidence: Number(state.playerUnicorns?.[id]?.confidence ?? 0),
      };
    });
  }, [scoutingViewSet.views, state.playerUnicorns]);

  useEffect(() => {
    if (!normalizedProspects.length) return;
    dispatch({ type: "SCOUT_HYDRATE_MY_BOARD_ORDER", payload: { prospectIds: normalizedProspects.map((p) => p.id) } });
  }, [dispatch, normalizedProspects]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(pointer: coarse)");
    const apply = () => setIsCoarsePointer(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;
  if (!normalizedProspects.length) {
    return <div className="p-4 opacity-70">{scoutingViewSet.totalCanonicalProspects ? "No canonical scout profiles available." : "No canonical draft prospects are available."}</div>;
  }

  const filtered = normalizedProspects.filter((p) => activePos === "ALL" || p.pos === activePos);
  const scoutOrdered = [...filtered].sort((a, b) => (ascending ? a.estHigh - b.estHigh : b.estHigh - a.estHigh));
  const myBoardOrder = scouting.myBoardOrder ?? [];
  const myOrdered = myBoardOrder
    .map((id) => filtered.find((p) => p.id === id))
    .filter((p): p is Prospect => Boolean(p));

  const rendered = boardMode === "MY" ? myOrdered : scoutOrdered;
  const canDrag = boardMode === "MY" && !isCoarsePointer;

  const onDrop = (targetId: string) => {
    if (!canDrag || !draggedId || draggedId === targetId) return;
    dispatch({ type: "SCOUT_REORDER_MY_BOARD", payload: { draggedId, targetId } });
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-20">
      <div className="mx-auto max-w-screen-sm space-y-3 px-4 pt-4">
        <h1 className="text-xl font-bold">Big Board</h1>
        {scoutingViewSet.missingScoutProfileCount > 0 ? (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            {scoutingViewSet.missingScoutProfileCount} of {scoutingViewSet.totalCanonicalProspects} canonical prospects are excluded because scout profiles are missing.
          </div>
        ) : null}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {POSITION_PILLS.map((p) => (
            <button key={p} className={`min-h-[44px] rounded-full px-3 text-xs ${activePos === p ? "bg-blue-500 text-white" : "bg-[#1C1C27] text-slate-400"}`} onClick={() => setActivePos(p)}>{getPositionLabel(p)}</button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button className={`min-h-[44px] rounded px-3 ${boardMode === "MY" ? "bg-blue-500 text-white" : "bg-[#1C1C27] text-slate-300"}`} onClick={() => setBoardMode("MY")}>MY BOARD</button>
            <button className={`min-h-[44px] rounded px-3 ${boardMode === "SCOUT" ? "bg-blue-500 text-white" : "bg-[#1C1C27] text-slate-300"}`} onClick={() => setBoardMode("SCOUT")}>SCOUT BOARD</button>
          </div>
          <button className="min-h-[44px] rounded border border-white/10 px-3" onClick={() => setAscending((v) => !v)}>MY BOARD RANK {ascending ? "▲" : "▼"}</button>
        </div>

        <div className="space-y-2">
          {rendered.map((p, i) => {
            const id = p.id;
            const report = scouting.scoutProfiles[id]?.confidence > 20 ? generateScoutingReport({ id, pos: p.pos, name: p.name }, true) : undefined;
            return (
              <ProspectRow
                key={id}
                prospect={p}
                rank={i + 1}
                isExpanded={openId === id}
                onToggle={() => setOpenId((v) => (v === id ? null : id))}
                onDragStart={(e) => {
                  if (!canDrag) return;
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedId(id);
                }}
                onDragOver={(e) => {
                  if (!canDrag) return;
                  e.preventDefault();
                  setDragOverId(id);
                }}
                onDrop={() => onDrop(id)}
                draggable={canDrag}
                isDragging={draggedId === id}
                isDragOver={dragOverId === id}
                report={report}
                unicornCandidate={p.unicornConfidence && p.unicornConfidence > 0.5 ? p.unicornConfidence : undefined}
                onOpenProfile={openProspectProfile}
              />
            );
          })}
        </div>
      </div>
      {modal}
    </div>
  );
}
