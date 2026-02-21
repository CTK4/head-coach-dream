import { useEffect, useMemo } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";

const DAYS = [
  { day: 1 as const, label: "Day 1" },
  { day: 2 as const, label: "Day 2" },
  { day: 3 as const, label: "Day 3" },
  { day: 4 as const, label: "Day 4" },
  { day: 5 as const, label: "Day 5" },
];

export default function ScoutingCombine() {
  const { state, dispatch } = useGame();
  const scouting = state.scoutingState;

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
    if (scouting && !scouting.combine.generated) dispatch({ type: "SCOUT_COMBINE_GENERATE" });
  }, [dispatch, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  const day = scouting.combine.day;
  const focusEnabled = day === 2 || day === 3;
  const feed = scouting.combine.feed.filter((f) => f.day === day).slice(-12).reverse();
  const used = Object.values(scouting.allocation.byGroup).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, scouting.allocation.poolHours - used);

  const draftClass = useMemo(() =>
    (getDraftClass() as any[]).map((row, i) => ({
      id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${i + 1}`,
      name: row.name ?? row["Name"] ?? "Unknown",
      pos: row.pos ?? row["POS"] ?? "UNK",
    })),
  []);
  const topList = useMemo(() => {
    const ids = Object.keys(scouting.scoutProfiles);
    return ids
      .map((id) => ({ id, s: scouting.scoutProfiles[id], p: draftClass.find((x: any) => x.id === id) }))
      .filter((x) => x.p)
      .sort((a, b) => (b.s?.estCenter ?? 0) - (a.s?.estCenter ?? 0))
      .slice(0, 25);
  }, [draftClass, scouting]);

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-[52px] z-20 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Combine</div>
          <div className="text-xs opacity-70">
            Combine Hours: {used}/{scouting.allocation.poolHours} (rem {remaining}) • Focus: {focusEnabled ? "ON" : "OFF"}
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d.day}
              className={`rounded border px-3 py-1 ${day === d.day ? "border-sky-400 text-sky-200" : "border-white/10"}`}
              onClick={() => dispatch({ type: "SCOUT_COMBINE_SET_DAY", payload: { day: d.day } })}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="font-semibold">Focus Drill</div>
        <div className="mt-1 text-xs opacity-70">Spend Combine Hours to tighten confidence (by position group).</div>
        <div className="mt-3 space-y-2">
          {topList.map(({ id, p, s }) => (
            <div key={id} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/20 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.name} <span className="opacity-70">{p.pos}</span></div>
                <div className="text-xs opacity-70">Band {s.estLow}-{s.estHigh} • Conf {s.confidence}%</div>
              </div>
              <button
                className={`rounded border px-3 py-2 ${focusEnabled ? "border-sky-500 text-sky-200" : "cursor-not-allowed border-white/10 text-white/40"}`}
                disabled={!focusEnabled}
                onClick={() => dispatch({ type: "SCOUT_COMBINE_FOCUS", payload: { prospectId: id } })}
              >
                Focus (-4h)
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="font-semibold">Combine Day {day}</div>
      <div className="space-y-2">
        {feed.length ? feed.map((i) => <div key={i.id} className="rounded border border-white/10 p-2">{i.text}</div>) : <div className="text-sm opacity-70">No events yet.</div>}
      </div>
    </div>
  );
}
