import { useMemo, useState } from "react";
import { getUserProspectEval, useGame, type PriorityPos } from "@/context/GameContext";
import type { NormalizedDraftProspect } from "@/engine/scouting/normalizeProspect";
import { PREDRAFT_MAX_SLOTS } from "@/engine/offseasonConstants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { getPositionLabel } from "@/lib/displayLabels";
import { getAthleticSummary } from "@/engine/scouting/athleticSummary";
import { getDrillCompositeScore, hasEnoughDrillDataForPercentile } from "@/engine/scouting/drillComposite";
import { getCanonicalCombineResult, getCanonicalDraftProspects, getCanonicalInterviewResult, getCanonicalMedicalResult, getCanonicalScoutProfile, hasEnoughAthleticDataForSummary, parseCanonicalMetric } from "@/engine/scouting/selectors";
import { buildProspectForGmEval } from "@/engine/scouting/gmEvalAdapter";
import { athleticTierFromTopPercentile, topPercentDisplay, topPercentileFromAscendingRank } from "@/engine/scouting/percentiles";
import { normalizeProspectPosition } from "@/lib/prospectPosition";


function consensusRankValue(rank: unknown): number {
  const numeric = Number(rank);
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
}

function combineScoreOrNull(result: { forty?: number | string; vert?: number | string; shuttle?: number | string; bench?: number | string }): number | null {
  return getDrillCompositeScore({
    forty: parseCanonicalMetric(result.forty) ?? undefined,
    vert: parseCanonicalMetric(result.vert) ?? undefined,
    shuttle: parseCanonicalMetric(result.shuttle) ?? undefined,
    bench: parseCanonicalMetric(result.bench) ?? undefined,
  });
}
const POS_FILTER_ALL = "ALL";

// Same group normalization as Combine page
function normalizeCombinePosGroup(pos: string): string {
  const raw = normalizeProspectPosition(String(pos ?? ""), "DRAFT");
  if (raw === "DT") return "DL";
  return raw;
}

// Deterministic integer hash for a string
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SCOUT_BLURBS = [
  "Exceptional motor — plays through the whistle every snap.",
  "Scheme fit is a question but athleticism is undeniable.",
  "Leadership qualities stood out in all interviews.",
  "Technique needs polish but ceiling is very high.",
  "Production relative to competition warrants caution.",
  "Medical history is clean — no red flags.",
  "Strong hands and contested-catch ability above average.",
  "Struggled against elite competition in last two seasons.",
  "Off-script instincts offset any measurable limitations.",
  "Work ethic and film study habits are elite.",
];

function priorityWeight(priorities: PriorityPos[], pos: string): number {
  const p = String(pos || "").toUpperCase().trim() as PriorityPos;
  const idx = priorities.indexOf(p);
  if (idx < 0) return 0;
  return Math.max(0, 1 - idx * 0.25);
}

type TabMode = "BOARD" | "MY_BOARD";


export default function PreDraft() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const viewMode = (state.offseasonData.preDraft.viewMode as "CONSENSUS" | "GM" | "TEAM") ?? "CONSENSUS";
  const priorities = useMemo<PriorityPos[]>(() => state.strategy?.draftFaPriorities ?? ["QB", "OL", "EDGE"], [state.strategy?.draftFaPriorities]);

  const [pickerOpen, setPickerOpen] = useState(true);
  const [posFilter, setPosFilter] = useState<string>(POS_FILTER_ALL);
  const [tabMode, setTabMode] = useState<TabMode>("BOARD");

  const combine = state.offseasonData.combine;
  const shortlist = useMemo(() => (combine as { shortlist?: Record<string, boolean> }).shortlist ?? {}, [combine]);
  const intelByProspectId = state.offseasonData.preDraft.intelByProspectId ?? {};


  const canonicalPool = useMemo(() => {
    return getCanonicalDraftProspects(state)
      .slice()
      .sort((a, b) => consensusRankValue(a.rank) - consensusRankValue(b.rank));
  }, [state]);

  const board = useMemo(() => {
    if (viewMode !== "TEAM") return canonicalPool.slice(0, 90);

    return canonicalPool
      .map((p) => {
        const rank = consensusRankValue(p.rank);
        const grade = Number(p.grade ?? 0);
        const score = -rank + priorityWeight(priorities, String(p.pos ?? "")) * 25 + grade * 0.01;
        return { ...p, __score: score };
      })
      .sort((a, b) => (b.__score ?? 0) - (a.__score ?? 0))
      .slice(0, 90);
  }, [canonicalPool, viewMode, priorities]);

  // Compute percentiles from combine drill data
  const topPercentileByProspectId = useMemo(() => {
    const allProspects = canonicalPool;
    const byGroup: Record<string, Array<{ id: string; score: number }>> = {};
    for (const p of allProspects) {
      const id = String(p.id ?? "");
      const result = getCanonicalCombineResult(state, id);
      if (!hasEnoughDrillDataForPercentile({ forty: parseCanonicalMetric(result.forty), vert: parseCanonicalMetric(result.vert), shuttle: parseCanonicalMetric(result.shuttle), bench: parseCanonicalMetric(result.bench) })) continue;
      const drillScore = combineScoreOrNull(result);
      if (drillScore == null) continue;
      const grp = normalizeCombinePosGroup(String(p.pos ?? ""));
      (byGroup[grp] ??= []).push({ id, score: drillScore });
    }
    const out: Record<string, number> = {};
    for (const group of Object.values(byGroup)) {
      const sorted = group.slice().sort((a, b) => b.score - a.score);
      const n = sorted.length;
      sorted.forEach(({ id }, rank) => {
        out[id] = topPercentileFromAscendingRank(rank, n);
      });
    }
    return out;
  }, [canonicalPool, state]);

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

  // MY_BOARD intentionally follows the active board model/order (CONSENSUS / TEAM overlay).
  const myBoard = useMemo(() => board.filter((p) => Boolean(shortlist[p.id])), [board, shortlist]);

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

  function renderProspectRow(p: NormalizedDraftProspect & { __score?: number }, idx: number) {
    const id = p.id;
    const v = !!visits[id];
    const w = !!workouts[id];
    const alreadyScheduledOtherType = (v && !w) || (w && !v);
    const disableVisitAdd = (!v && allSlotsUsed) || w;
    const disableWorkoutAdd = (!w && allSlotsUsed) || v;

    const intel = intelByProspectId[id] ?? 0;
    const gmEvalInput = buildProspectForGmEval(state, id);
    const gmEval = viewMode === "GM" && gmEvalInput ? getUserProspectEval(state, gmEvalInput.prospect, gmEvalInput) : null;
    const combineResult = getCanonicalCombineResult(state, id);
    const scoutProfile = getCanonicalScoutProfile(state, id);
    const athleticSummary = hasEnoughAthleticDataForSummary(combineResult)
      ? getAthleticSummary({
          forty: parseCanonicalMetric(combineResult.forty) ?? undefined,
          vert: parseCanonicalMetric(combineResult.vert) ?? undefined,
          shuttle: parseCanonicalMetric(combineResult.shuttle) ?? undefined,
          threeCone: parseCanonicalMetric(combineResult.threeCone) ?? undefined,
          bench: parseCanonicalMetric(combineResult.bench) ?? undefined,
        })
      : null;

    const topPercentile = topPercentileByProspectId[id];
    const tier = topPercentile != null ? athleticTierFromTopPercentile(topPercentile) : null;

    const blurbSeed = simpleHash(id + String(p.archetype ?? "") + String(state.saveSeed ?? 0));
    const blurb = SCOUT_BLURBS[blurbSeed % SCOUT_BLURBS.length];

    return (
      <div key={id} className="border rounded-md px-3 py-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate">
              #{idx + 1}{" "}
              <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(String(id))}>
                {p.name}
              </button>{" "}
              <span className="text-muted-foreground">({getPositionLabel(p.pos)})</span>
              {shortlist[id] ? <span className="ml-1 text-amber-400 text-xs">★ Pinned</span> : null}
            </div>

            {viewMode === "CONSENSUS" ? (
              <div className="text-xs text-muted-foreground">
                40 {String(combineResult.forty ?? "—")} · Vert {String(combineResult.vert ?? "—")} · Shuttle {String(combineResult.shuttle ?? "—")} · Bench {String(combineResult.bench ?? "—")} · {String(p.archetype ?? "Prospect")}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                GM Grade {gmEval ? gmEval.roundBand : "—"} <span className="text-muted-foreground">({gmEval ? `${gmEval.value}${gmEvalInput?.completeness === "PARTIAL" ? ` · Partial scouting data · σ≈${gmEval.sigma.toFixed(1)}` : ""}` : "Pending canonical combine or interview"})</span> · Consensus {p.grade ?? "—"} · {athleticSummary?.overallLabel ?? "No combine data"}
              </div>
            )}

            {/* Intel-gated info */}
            {intel >= 1 ? (
              <div className="text-xs text-sky-300">
                Athletic {athleticSummary?.overallLabel ?? "No combine data"}{tier ? ` · ${tier}${topPercentile != null ? ` (${topPercentDisplay(topPercentile)})` : ""}` : ""} · Interview {getCanonicalInterviewResult(state, id)?.slice(-1)?.[0]?.score ?? "—"} · Medical {(getCanonicalMedicalResult(state, id) as { riskTier?: string } | null)?.riskTier ?? "—"} · Scout Conf {typeof scoutProfile?.confidence === "number" ? `${Math.round(scoutProfile.confidence)}%` : "—"}
              </div>
            ) : intel === 0 ? (
              <div className="text-xs text-slate-500">Schedule a visit or workout to unlock scouting intel.</div>
            ) : null}
            {intel >= 2 ? (
              <div className="text-xs text-amber-300/80 italic">{blurb}</div>
            ) : null}

            {alreadyScheduledOtherType ? (
              <div className="text-xs text-amber-500">Already scheduled ({v ? "Visit" : "Workout"}). Cannot add both.</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant={v ? "default" : "outline"} className="min-h-11" onClick={() => toggleVisit(id)} disabled={disableVisitAdd}>
              {v ? "Visited" : "Visit"}
            </Button>
            <Button size="sm" variant={w ? "default" : "outline"} className="min-h-11" onClick={() => toggleWorkout(id)} disabled={disableWorkoutAdd}>
              {w ? "Workout" : "Set Workout"}
            </Button>
          </div>
        </div>
      </div>
    );
  }


  if (board.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No canonical draft prospects are available.</CardContent></Card>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xl font-bold">Pre-Draft</div>
            <div className="text-sm text-muted-foreground">Top 30 visits / private workouts. Visit or workout unlocks scouting intel.</div>
            <div className="text-sm font-medium">Slots used: {slotsUsed} / {PREDRAFT_MAX_SLOTS}</div>
            {allSlotsUsed ? <div className="text-xs text-amber-500">All {PREDRAFT_MAX_SLOTS} slots used</div> : null}
          </div>
          <Badge variant="outline">Step 5</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="font-semibold">Board</div>
              <div className="flex rounded-md border overflow-hidden">
                <Button
                  size="sm"
                  variant={tabMode === "BOARD" ? "default" : "ghost"}
                  className="min-h-11 rounded-none"
                  onClick={() => setTabMode("BOARD")}
                >
                  Board
                </Button>
                <Button
                  size="sm"
                  variant={tabMode === "MY_BOARD" ? "default" : "ghost"}
                  className="min-h-11 rounded-none"
                  onClick={() => setTabMode("MY_BOARD")}
                >
                  My Board {myBoard.length > 0 ? `(${myBoard.length})` : ""}
                </Button>
              </div>
            </div>
            {tabMode === "BOARD" ? (
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
            ) : null}
          </div>

          {tabMode === "BOARD" && viewMode === "TEAM" ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Priority bump:</span>
              {priorities.slice(0, 3).map((p) => (
                <Badge key={p} variant="secondary">{p}</Badge>
              ))}
            </div>
          ) : null}

          {tabMode === "MY_BOARD" ? (
            <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
              {myBoard.length === 0 ? (
                <div className="text-sm text-muted-foreground">No prospects pinned. Use the Combine page to shortlist prospects.</div>
              ) : (
                myBoard.map((p, idx) => renderProspectRow(p, idx))
              )}
            </div>
          ) : null}

          {tabMode === "BOARD" && pickerOpen ? (
            <>
              <div className="overflow-x-auto pb-1"><div className="flex min-w-max items-center gap-2">
                {positionFilters.map((pos) => (
                  <Button key={pos} size="sm" variant={posFilter === pos ? "default" : "outline"} className="min-h-11 rounded-full" onClick={() => setPosFilter(pos)}>
                    {pos}
                  </Button>
                ))}
              </div></div>

              <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                {filteredBoard.map((p, idx) => renderProspectRow(p, idx))}
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
