import { useEffect, useMemo, useState } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

const TIERS = ["T1", "T2", "T3", "T4", "T5"] as const;

export default function BigBoard() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"MANUAL" | "MY_GRADE">("MANUAL");

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

  const isCombine = scouting.windowId === "COMBINE";
  const focusEnabled = scouting.combine.day === 2 || scouting.combine.day === 3;

  const move = (prospectId: string, dir: "UP" | "DOWN") =>
    dispatch({ type: "SCOUT_BOARD_MOVE", payload: { prospectId, dir } });

  const moveTier = (prospectId: string, tierId: "T1" | "T2" | "T3" | "T4" | "T5") =>
    dispatch({ type: "SCOUT_BOARD_MOVE_TIER", payload: { prospectId, tierId } });

  const spend = (prospectId: string, action: "FILM_QUICK" | "FILM_DEEP" | "REQUEST_MED" | "BACKGROUND") =>
    dispatch({ type: "SCOUT_SPEND", payload: { prospectId, action } });

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-[52px] z-20 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Big Board</div>
          <div className="flex items-center gap-3 text-xs opacity-70">
            <span>
              SCP {scouting.budget.spent}/{scouting.budget.total}
            </span>
            {isCombine ? (
              <span>
                Combine Hours {Object.values(scouting.allocation.byGroup).reduce((a, b) => a + b, 0)}/{scouting.allocation.poolHours}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            className={`rounded border px-3 py-1 ${sortMode === "MANUAL" ? "border-sky-400 text-sky-200" : "border-white/10"}`}
            onClick={() => setSortMode("MANUAL")}
          >
            Sort: Manual
          </button>
          <button
            className={`rounded border px-3 py-1 ${sortMode === "MY_GRADE" ? "border-sky-400 text-sky-200" : "border-white/10"}`}
            onClick={() => setSortMode("MY_GRADE")}
          >
            Sort: My Grade
          </button>
        </div>
      </div>
      {TIERS.map((tierId) => {
        const idsBase = scouting.bigBoard.tiers[tierId] ?? [];
        const ids =
          sortMode === "MY_GRADE"
            ? [...idsBase].sort((a, b) => (scouting.scoutProfiles[b]?.estCenter ?? 0) - (scouting.scoutProfiles[a]?.estCenter ?? 0))
            : idsBase;
        return (
          <div key={tierId} className="rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="font-semibold">{tierId}</div>
              <div className="text-xs opacity-70">{idsBase.length} players</div>
            </div>
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
                  <div className="flex flex-col gap-2">
                    <button className="rounded border border-white/10 px-3 py-1" onClick={() => move(id, "UP")}>↑</button>
                    <button className="rounded border border-white/10 px-3 py-1" onClick={() => move(id, "DOWN")}>↓</button>
                    <select
                      className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs"
                      value={scouting.bigBoard.tierByProspectId[id]}
                      onChange={(e) => moveTier(id, e.target.value as "T1" | "T2" | "T3" | "T4" | "T5")}
                    >
                      {TIERS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
            {!idsBase.length ? <div className="p-3 text-xs opacity-70">Empty.</div> : null}
          </div>
        );
      })}
      {openId ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={() => setOpenId(null)}>
          <div className="w-full rounded-t-2xl border border-white/10 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{byId.get(openId)?.name ?? byId.get(openId)?.["Name"]}</div>
                <div className="text-xs opacity-70">{byId.get(openId)?.pos ?? byId.get(openId)?.["POS"]}</div>
              </div>
              <button className="rounded border border-white/10 px-3 py-1" onClick={() => setOpenId(null)}>Close</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isCombine ? (
                <button
                  className={`rounded border px-3 py-2 ${(focusEnabled ? "border-sky-500 text-sky-200" : "cursor-not-allowed border-white/10 text-white/40")}`}
                  disabled={!focusEnabled}
                  onClick={() => dispatch({ type: "SCOUT_COMBINE_FOCUS", payload: { prospectId: openId } })}
                >
                  Focus Combine Drill (uses hours)
                </button>
              ) : null}
              <button className="rounded border border-white/10 px-3 py-2" onClick={() => spend(openId, "FILM_QUICK")}>Watch Film (Quick)</button>
              <button className="rounded border border-white/10 px-3 py-2" onClick={() => spend(openId, "FILM_DEEP")}>Watch Film (Deep)</button>
              <button className="rounded border border-white/10 px-3 py-2" onClick={() => spend(openId, "REQUEST_MED")}>Request Medical</button>
              <button className="rounded border border-white/10 px-3 py-2" onClick={() => spend(openId, "BACKGROUND")}>Background Check</button>
              <button className="rounded border border-white/10 px-3 py-2" onClick={() => dispatch({ type: "SCOUT_PIN", payload: { prospectId: openId } })}>
                {scouting.scoutProfiles[openId]?.pinned ? "Unpin" : "Pin"}
              </button>
            </div>
            <div className="mt-3 text-xs opacity-70">Sort “My Grade” is view-only; manual order is preserved.</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
