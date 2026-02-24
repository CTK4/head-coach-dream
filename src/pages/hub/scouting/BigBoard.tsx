import { useEffect, useMemo, useState } from "react";
import ProspectRow, { type Prospect } from "@/components/draft/ProspectRow";
import { getDraftClass, useGame } from "@/context/GameContext";
import { generateScoutingReport } from "@/engine/scouting/reportGenerator";

const POSITION_PILLS = ["QB", "WR", "TE", "RB", "OT", "IOL", "CB", "S", "DL", "LB", "K", "P", "ALL"];

export default function BigBoard() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;
  const [openId, setOpenId] = useState<string | null>(null);
  const [activePos, setActivePos] = useState<string>("ALL");
  const [boardMode, setBoardMode] = useState<"MY" | "SCOUT">("MY");
  const [ascending, setAscending] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [boardOrder, setBoardOrder] = useState<string[]>([]);

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [scouting, dispatch]);

  const draftClass = getDraftClass() as Record<string, unknown>[];
  const normalizedProspects = useMemo<Prospect[]>(
    () =>
      draftClass.map((p, i) => ({
        id: String(p.id ?? p.prospectId ?? p["Player ID"] ?? `p-${i}`),
        name: String(p.name ?? p["Name"] ?? "Unknown Prospect"),
        pos: String(p.pos ?? p["POS"] ?? "ATH"),
        school: String(p.school ?? p["School"] ?? "Unknown"),
        estLow: Number((scouting?.scoutProfiles[String(p.id ?? p.prospectId ?? p["Player ID"])]?.estLow as number) ?? 65),
        estHigh: Number((scouting?.scoutProfiles[String(p.id ?? p.prospectId ?? p["Player ID"])]?.estHigh as number) ?? 85),
        confidence: Number((scouting?.scoutProfiles[String(p.id ?? p.prospectId ?? p["Player ID"])]?.confidence as number) ?? 0),
        height: String(p.height ?? "—"),
        weight: String(p.weight ?? "—"),
      })),
    [draftClass, scouting?.scoutProfiles]
  );

  useEffect(() => {
    if (!normalizedProspects.length) return;
    setBoardOrder((prev) => (prev.length ? prev.filter((id) => normalizedProspects.some((p) => p.id === id)) : normalizedProspects.map((p) => p.id)));
  }, [normalizedProspects]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  const filtered = normalizedProspects.filter((p) => activePos === "ALL" || p.pos === activePos);
  const scoutOrdered = [...filtered].sort((a, b) => (ascending ? a.estHigh - b.estHigh : b.estHigh - a.estHigh));
  const myOrdered = boardOrder
    .map((id) => filtered.find((p) => p.id === id))
    .filter((p): p is Prospect => Boolean(p));

  const rendered = boardMode === "MY" ? myOrdered : scoutOrdered;

  const onDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setBoardOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggedId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-20">
      <div className="mx-auto max-w-screen-sm space-y-3 px-4 pt-4">
        <h1 className="text-xl font-bold">Big Board</h1>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {POSITION_PILLS.map((p) => (
            <button key={p} className={`min-h-[44px] rounded-full px-3 text-xs ${activePos === p ? "bg-blue-500 text-white" : "bg-[#1C1C27] text-slate-400"}`} onClick={() => setActivePos(p)}>{p}</button>
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
            const report = scouting.scoutProfiles[p.id]?.confidence > 20 ? generateScoutingReport({ id: p.id, pos: p.pos, name: p.name }, true) : undefined;
            return (
              <ProspectRow
                key={p.id}
                prospect={p}
                rank={i + 1}
                isExpanded={openId === p.id}
                onToggle={() => setOpenId((v) => (v === p.id ? null : p.id))}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedId(p.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(p.id);
                }}
                onDrop={() => onDrop(p.id)}
                isDragging={draggedId === p.id}
                isDragOver={dragOverId === p.id}
                report={report}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
