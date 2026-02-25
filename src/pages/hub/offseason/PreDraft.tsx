import { useMemo, useState } from "react";
import { getUserProspectEval, useGame, type PriorityPos } from "@/context/GameContext";
import type { Prospect } from "@/engine/offseasonData";
import { PREDRAFT_MAX_SLOTS } from "@/engine/offseasonConstants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { computeCombineScore, formatCombineScore10 } from "@/engine/scouting/combineScore";

const POS_FILTER_ALL = "ALL";

function priorityWeight(priorities: PriorityPos[], pos: string): number {
  const p = String(pos || "").toUpperCase().trim() as PriorityPos;
  const idx = priorities.indexOf(p);
  if (idx < 0) return 0;
  return Math.max(0, 1 - idx * 0.25);
}

export default function PreDraft() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const viewMode = (state.offseasonData.preDraft.viewMode as "CONSENSUS" | "GM" | "TEAM") ?? "CONSENSUS";
  const priorities = useMemo<PriorityPos[]>(() => state.strategy?.draftFaPriorities ?? ["QB", "OL", "EDGE"], [state.strategy?.draftFaPriorities]);

  const [pickerOpen, setPickerOpen] = useState(true);
  const [posFilter, setPosFilter] = useState<string>(POS_FILTER_ALL);

  const board = useMemo(() => {
    const base = state.offseasonData.preDraft.board.length ? state.offseasonData.preDraft.board : state.offseasonData.draft.board;
    const ranked: Prospect[] = (base.length ? base : []).slice();
    if (viewMode !== "TEAM") return ranked.slice(0, 90);

    return ranked
      .map((p) => {
        const rank = Number(p.rank ?? p.Rank ?? 9999);
        const grade = Number(p.grade ?? 0);
        const score = -rank + priorityWeight(priorities, String(p.pos ?? "")) * 25 + grade * 0.01;
        return { ...p, __score: score };
      })
      .sort((a, b) => (b.__score ?? 0) - (a.__score ?? 0))
      .slice(0, 90);
  }, [state.offseasonData.preDraft.board, state.offseasonData.draft.board, viewMode, priorities]);

  const visits = state.offseasonData.preDraft.visits;
  const workouts = state.offseasonData.preDraft.workouts;

  const visitsUsed = Object.values(visits).filter(Boolean).length;
  const workoutsUsed = Object.values(workouts).filter(Boolean).length;
  const slotsUsed = Math.min(PREDRAFT_MAX_SLOTS, visitsUsed + workoutsUsed);
  const allSlotsUsed = slotsUsed >= PREDRAFT_MAX_SLOTS;

  const positionFilters = useMemo(() => {
    const values = new Set<string>();
    for (const p of board) values.add(String(p.pos ?? "UNK").toUpperCase());
    return [POS_FILTER_ALL, ...Array.from(values).sort()];
  }, [board]);

  const filteredBoard = useMemo(() => {
    if (posFilter === POS_FILTER_ALL) return board;
    return board.filter((p) => String(p.pos ?? "UNK").toUpperCase() === posFilter);
  }, [board, posFilter]);

  const toggleVisit = (id: string) => dispatch({ type: "PREDRAFT_TOGGLE_VISIT", payload: { prospectId: id } });
  const toggleWorkout = (id: string) => dispatch({ type: "PREDRAFT_TOGGLE_WORKOUT", payload: { prospectId: id } });
  const setViewMode = (mode: "CONSENSUS" | "GM" | "TEAM") => dispatch({ type: "PREDRAFT_SET_VIEWMODE", payload: { mode } });

  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "PRE_DRAFT" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  const togglePicker = () => {
    const nextOpen = !pickerOpen;
    setPickerOpen(nextOpen);
    if (nextOpen) setPosFilter(POS_FILTER_ALL);
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">Pre-Draft</div>
            <div className="text-sm text-muted-foreground">Top 30 visits / private workouts.</div>
            <div className="text-sm font-medium">Slots used: {slotsUsed} / {PREDRAFT_MAX_SLOTS}</div>
            {allSlotsUsed ? <div className="text-xs text-amber-500">All {PREDRAFT_MAX_SLOTS} slots used</div> : null}
          </div>
          <Badge variant="outline">Step 5</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">Board</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="min-h-11" onClick={togglePicker}>
                {pickerOpen ? "Hide Picker" : "Open Picker"}
              </Button>
              <div className="flex overflow-x-auto rounded-md border">
                <Button size="sm" variant={viewMode === "CONSENSUS" ? "default" : "ghost"} className="min-h-11 rounded-none" onClick={() => setViewMode("CONSENSUS")}>
                  Consensus
                </Button>
                <Button size="sm" variant={viewMode === "GM" ? "default" : "ghost"} className="min-h-11 rounded-none" onClick={() => setViewMode("GM")}>
                  GM View
                </Button>
                <Button size="sm" variant={viewMode === "TEAM" ? "default" : "ghost"} className="min-h-11 rounded-none" onClick={() => setViewMode("TEAM")}>
                  Team View
                </Button>
              </div>
              <Badge variant="outline">{filteredBoard.length}</Badge>
            </div>
          </div>

          {viewMode === "TEAM" ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Priority bump:</span>
              {priorities.slice(0, 3).map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
          ) : null}

          {pickerOpen ? (
            <>
              <div className="overflow-x-auto pb-1"><div className="flex min-w-max items-center gap-2">
                {positionFilters.map((pos) => (
                  <Button key={pos} size="sm" variant={posFilter === pos ? "default" : "outline"} className="min-h-11 rounded-full" onClick={() => setPosFilter(pos)}>
                    {pos}
                  </Button>
                ))}
              </div></div>

              <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                {filteredBoard.map((p, idx) => {
                  const v = !!visits[p.id];
                  const w = !!workouts[p.id];
                  const alreadyScheduledOtherType = (v && !w) || (w && !v);

                  const disableVisitAdd = (!v && allSlotsUsed) || w;
                  const disableWorkoutAdd = (!w && allSlotsUsed) || v;

                  const gmEval = viewMode === "GM" ? getUserProspectEval(state, p) : null;
                  const combineScore10 = computeCombineScore({
                    ...(p as Record<string, unknown>),
                    ...(state.offseasonData.combine.results?.[p.id] ?? {}),
                  }).combineScore10;

                  return (
                    <div key={p.id} className="border rounded-md px-3 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          #{idx + 1}{" "}
                          <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(String(p.id))}>
                            {p.name}
                          </button>{" "}
                          <span className="text-muted-foreground">({p.pos})</span>
                        </div>

                        {viewMode === "CONSENSUS" ? (
                          <div className="text-xs text-muted-foreground">
                            CS {formatCombineScore10(combineScore10)} · Interview {p.interview} · {p.archetype}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            GM Grade {gmEval?.roundBand} <span className="text-muted-foreground">({gmEval?.value})</span> · Consensus {p.grade} · CS {formatCombineScore10(combineScore10)}
                          </div>
                        )}
                        {alreadyScheduledOtherType ? (
                          <div className="text-xs text-amber-500">Already scheduled ({v ? "Visit" : "Workout"}). Cannot add both.</div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={v ? "default" : "outline"} className="min-h-11" onClick={() => toggleVisit(p.id)} disabled={disableVisitAdd}>
                          {v ? "Visited" : "Visit"}
                        </Button>
                        <Button size="sm" variant={w ? "default" : "outline"} className="min-h-11" onClick={() => toggleWorkout(p.id)} disabled={disableWorkoutAdd}>
                          {w ? "Workout" : "Set Workout"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Visits/workouts are saved; complete when ready.</div>
          <div className="flex gap-2">
            <Button variant="outline" className="min-h-11" onClick={completeStep}>
              Complete Step
            </Button>
            <Button className="min-h-11" onClick={next} disabled={!state.offseason.stepsComplete.PRE_DRAFT}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
      {modal}
    </div>
  );
}
