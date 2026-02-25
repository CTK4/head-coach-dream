import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getDraftClass as getDraftClassFromSim } from "@/engine/draftSim";
import { IntelMeters } from "@/components/IntelMeters";
import { getPositionLabel } from "@/lib/displayLabels";

type DraftTab = "RESULTS" | "POOL" | "MY_PICKS";

function clampDelay(value: number): number {
  if (Number.isNaN(value)) return 800;
  return Math.max(0, Math.min(5000, Math.round(value)));
}

export default function Draft() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<DraftTab>("POOL");
  const [pos, setPos] = useState("ALL");
  const [cpuDelayMinMs, setCpuDelayMinMs] = useState(800);
  const [cpuDelayMaxMs, setCpuDelayMaxMs] = useState(1500);
  const resultsEndRef = useRef<HTMLDivElement | null>(null);

  const sim = state.draft;
  const scouting = state.offseasonData.scouting;
  const currentSlot = sim.slots[sim.cursor];
  const onClock = !!currentSlot && currentSlot.teamId === sim.userTeamId;

  useEffect(() => {
    if (!sim.started) dispatch({ type: "DRAFT_INIT" });
  }, [dispatch, sim.started]);

  useEffect(() => {
    if (!sim.started || sim.complete || onClock) return;

    const minDelay = Math.min(cpuDelayMinMs, cpuDelayMaxMs);
    const maxDelay = Math.max(cpuDelayMinMs, cpuDelayMaxMs);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    const timer = window.setTimeout(() => {
      dispatch({ type: "DRAFT_CPU_ADVANCE" });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dispatch, onClock, sim.complete, sim.cursor, sim.started, cpuDelayMinMs, cpuDelayMaxMs]);

  const available = useMemo(() => {
    let list = getDraftClassFromSim().filter((p) => !sim.takenProspectIds[p.prospectId]);
    if (pos !== "ALL") list = list.filter((p) => p.pos === pos);
    return list;
  }, [sim.takenProspectIds, pos]);

  const selectionsByOverall = useMemo(() => {
    const map = new Map<number, (typeof sim.selections)[number]>();
    for (const selection of sim.selections) {
      map.set(selection.overall, selection);
    }
    return map;
  }, [sim.selections]);

  const myOwnedSlots = useMemo(
    () => sim.slots.filter((slot) => slot.teamId === sim.userTeamId),
    [sim.slots, sim.userTeamId],
  );

  const myFutureSlots = useMemo(
    () => myOwnedSlots.filter((slot) => slot.overall >= (currentSlot?.overall ?? Number.MAX_SAFE_INTEGER)),
    [myOwnedSlots, currentSlot?.overall],
  );

  const myCompletedPicks = useMemo(
    () => myOwnedSlots.map((slot) => ({ slot, selection: selectionsByOverall.get(slot.overall) })).filter((row) => !!row.selection),
    [myOwnedSlots, selectionsByOverall],
  );

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sim.selections.length]);

  const submitPick = (prospectId: string) => {
    const slot = sim.slots[sim.cursor];
    const canPick = !!slot && slot.teamId === sim.userTeamId;
    if (!canPick || sim.takenProspectIds[prospectId]) return;
    dispatch({ type: "DRAFT_USER_PICK", payload: { prospectId } });
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">DRAFT</h1><div>{onClock ? "YOU ARE ON THE CLOCK" : "CPU SIMULATING"}</div></div>
      <div className="overflow-x-auto pb-1"><div className="flex min-w-max gap-2">{["ALL", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"].map((x) => <button key={x} className="min-h-11 rounded-full border px-3 py-1" onClick={() => setPos(x)}>{getPositionLabel(x)}</button>)}</div></div>
      {available.slice(0, 80).map((p) => (
        <div key={p.prospectId} className="border rounded p-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">{p.name} ({getPositionLabel(p.pos)})</div>
            <IntelMeters intel={scouting.intelByProspectId[p.prospectId]} />
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">DRAFT</h1>
          <div className="text-right text-sm">
            <div className="font-semibold">{sim.complete ? "Draft complete" : onClock ? "YOU ARE ON THE CLOCK" : "CPU SIMULATING"}</div>
            {currentSlot && !sim.complete && (
              <div className="text-xs text-slate-500">
                Round {currentSlot.round}, Pick {currentSlot.pickInRound} · Overall {currentSlot.overall}
              </div>
            )}
          </div>
        </div>
        <div className="rounded border p-3 space-y-2">
          <div className="text-sm font-medium">CPU Pick Delay (client-side)</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="space-y-1">
              <div className="text-xs text-slate-500">Min (ms)</div>
              <input
                type="number"
                min={0}
                max={5000}
                value={cpuDelayMinMs}
                onChange={(e) => setCpuDelayMinMs(clampDelay(Number(e.target.value)))}
                className="w-full rounded border px-2 py-1"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-slate-500">Max (ms)</div>
              <input
                type="number"
                min={0}
                max={5000}
                value={cpuDelayMaxMs}
                onChange={(e) => setCpuDelayMaxMs(clampDelay(Number(e.target.value)))}
                className="w-full rounded border px-2 py-1"
              />
            </label>
          </div>
          <div className="text-xs text-slate-500">CPU picks wait a random delay between min and max before dispatching advance.</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded border bg-slate-50 p-1">
        {[
          { key: "RESULTS", label: "Draft Results" },
          { key: "POOL", label: "Player Pool" },
          { key: "MY_PICKS", label: "My Picks" },
        ].map((entry) => {
          const active = tab === entry.key;
          return (
            <button
              key={entry.key}
              className={`min-h-11 rounded px-2 text-sm font-medium ${active ? "bg-white border" : "text-slate-600"}`}
              onClick={() => setTab(entry.key as DraftTab)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {tab === "POOL" && (
        <section className="space-y-3">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {["ALL", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"].map((x) => (
                <button key={x} className="min-h-11 rounded-full border px-3 py-1" onClick={() => setPos(x)}>
                  {x}
                </button>
              ))}
            </div>
          </div>
          {available.slice(0, 80).map((p) => {
            const taken = !!sim.takenProspectIds[p.prospectId];
            return (
              <div key={p.prospectId} className="border rounded p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {p.name} ({p.pos})
                  </div>
                  <IntelMeters intel={scouting.intelByProspectId[p.prospectId]} />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    disabled={!onClock || taken}
                    className="min-h-11 rounded border px-3 py-1 disabled:opacity-50"
                    onClick={() => submitPick(p.prospectId)}
                  >
                    Draft Player
                  </button>
                  <button
                    className="min-h-11 rounded border px-3 py-1"
                    onClick={() =>
                      dispatch({
                        type: "SCOUTING_SPEND",
                        payload: {
                          targetType: "PROSPECT",
                          targetId: p.prospectId,
                          actionType: "FILM_DEEP",
                          prospect: { id: p.prospectId, name: p.name, pos: p.pos, archetype: "Prospect", grade: 70, ras: 50, interview: 50 },
                        },
                      })
                    }
                  >
                    Deep Scout (-5)
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "RESULTS" && (
        <section className="space-y-2">
          <div className="text-sm text-slate-500">Chronological pick feed</div>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 border rounded p-2">
            {sim.selections.length === 0 && <div className="text-sm text-slate-500">No picks yet.</div>}
            {sim.selections.map((pick) => (
              <div key={`${pick.overall}-${pick.prospectId}`} className="rounded border px-3 py-2">
                <div className="font-semibold text-sm">
                  {pick.overall}. {pick.name} ({pick.pos})
                </div>
                <div className="text-xs text-slate-500">
                  R{pick.round}P{pick.pickInRound} · Team {pick.teamId} · Rank #{pick.rank}
                </div>
              </div>
            ))}
            <div ref={resultsEndRef} />
          </div>
        </section>
      )}

      {tab === "MY_PICKS" && (
        <section className="space-y-3">
          <div className="rounded border p-3">
            <div className="font-semibold">Upcoming User-Owned Slots</div>
            <div className="text-xs text-slate-500 mb-2">Derived from draft slots currently owned by your team.</div>
            {myFutureSlots.length === 0 && <div className="text-sm text-slate-500">No future picks remaining.</div>}
            <div className="space-y-2">
              {myFutureSlots.map((slot) => (
                <div key={slot.overall} className="rounded border px-3 py-2 text-sm">
                  Round {slot.round} · Pick {slot.pickInRound} · Overall {slot.overall}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border p-3">
            <div className="font-semibold">Completed User-Owned Selections</div>
            <div className="text-xs text-slate-500 mb-2">Derived from slots + completed draft selections.</div>
            {myCompletedPicks.length === 0 && <div className="text-sm text-slate-500">No completed picks yet.</div>}
            <div className="space-y-2">
              {myCompletedPicks.map(({ slot, selection }) => (
                <div key={slot.overall} className="rounded border px-3 py-2 text-sm">
                  O{slot.overall} · {selection?.name} ({selection?.pos})
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-dashed p-3">
            <div className="font-semibold">Trade Offers</div>
            <div className="text-sm text-slate-500">Trade offers coming soon.</div>
          </div>
        </section>
      )}
    </div>
  );
}
