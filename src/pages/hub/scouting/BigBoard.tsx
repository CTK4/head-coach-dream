import { useEffect, useMemo, useState } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

const TIERS = ["T1", "T2", "T3", "T4", "T5"] as const;

export default function BigBoard() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
  }, [scouting, dispatch]);

  const draftClass = getDraftClass() as any[];
  const byId = useMemo(() => {
    const m = new Map<string, any>();
    for (const p of draftClass) m.set(p.id ?? p.prospectId ?? p["Player ID"], p);
    return m;
  }, [draftClass]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  return (
    <div className="space-y-3 p-4">
      {TIERS.map((tierId) => {
        const ids = scouting.bigBoard.tiers[tierId] ?? [];
        return (
          <div key={tierId} className="rounded-lg border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-3 py-2 font-semibold">{tierId}</div>
            {ids.map((id) => {
              const p = byId.get(id);
              const s = scouting.scoutProfiles[id];
              if (!p || !s) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-3 p-3">
                  <button className="min-w-0 text-left" onClick={() => setOpenId(id)}>
                    <div className="truncate font-semibold">{p.name ?? p["Name"]} <span className="opacity-70">{p.pos ?? p["POS"]}</span></div>
                    <div className="text-xs opacity-70">Band {s.estLow}-{s.estHigh} • Conf {s.confidence}%</div>
                  </button>
                  <div className="flex gap-2">
                    <button className="rounded border border-white/10 px-3 py-1" onClick={() => dispatch({ type: "SCOUT_BOARD_MOVE", payload: { prospectId: id, dir: "UP" } })}>↑</button>
                    <button className="rounded border border-white/10 px-3 py-1" onClick={() => dispatch({ type: "SCOUT_BOARD_MOVE", payload: { prospectId: id, dir: "DOWN" } })}>↓</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {openId ? <div className="text-xs opacity-70">Selected: {openId}</div> : null}
    </div>
  );
}
