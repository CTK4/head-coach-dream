import { useEffect, useMemo, useState } from "react";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGame } from "@/context/GameContext";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { getAthleticSummary } from "@/engine/scouting/athleticSummary";
import { getDrillCompositeScore, hasEnoughDrillDataForPercentile } from "@/engine/scouting/drillComposite";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";
import { getCanonicalCombineResult, getCanonicalCombineStatus, getCanonicalDraftProspects, getCanonicalInterviewResult, getCanonicalMedicalResult, getCanonicalScoutProfile, hasEnoughAthleticDataForSummary, parseCanonicalMetric } from "@/engine/scouting/selectors";
import { athleticTierFromTopPercentile, topPercentDisplay, topPercentileFromAscendingRank } from "@/engine/scouting/percentiles";
import { normalizeProspectPosition } from "@/lib/prospectPosition";

function normalizeCombinePosGroup(pos: string): string {
  const raw = normalizeProspectPosition(String(pos ?? ""), "DRAFT");
  if (raw === "DT") return "DL"; // interior DL bucket
  return raw;
}


function combineScoreOrNull(result: { forty?: number | string; vert?: number | string; shuttle?: number | string; bench?: number | string }): number | null {
  return getDrillCompositeScore({
    forty: parseCanonicalMetric(result.forty) ?? undefined,
    vert: parseCanonicalMetric(result.vert) ?? undefined,
    shuttle: parseCanonicalMetric(result.shuttle) ?? undefined,
    bench: parseCanonicalMetric(result.bench) ?? undefined,
  });
}
export default function Combine() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [viewId, setViewId] = useState<string | null>(null);


  useEffect(() => {
    dispatch({ type: "OFFSEASON_SET_STEP", payload: { stepId: "COMBINE" } });
  }, [dispatch]);

  const prospects = useMemo(() => getCanonicalDraftProspects(state), [state]);

  const topPercentileByProspectId = useMemo(() => {
    const byGroup: Record<string, Array<{ id: string; score: number }>> = {};
    for (const p of prospects) {
      const id = String(p.id);
      const result = getCanonicalCombineResult(state, id);
      if (!hasEnoughDrillDataForPercentile({ forty: parseCanonicalMetric(result.forty), vert: parseCanonicalMetric(result.vert), shuttle: parseCanonicalMetric(result.shuttle), bench: parseCanonicalMetric(result.bench) })) continue;
      const score = combineScoreOrNull(result);
      if (score == null) continue;
      const grp = normalizeCombinePosGroup(String(p.pos ?? ""));
      (byGroup[grp] ??= []).push({ id, score });
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
  }, [prospects, state]);

  const filtered = useMemo(() => {
    const list = prospects
      .map((p) => ({ ...p, ...getCanonicalCombineResult(state, p.id) }))
      .sort((a, b) => {
        const bScore = combineScoreOrNull(b);
        const aScore = combineScoreOrNull(a);
        if (aScore == null && bScore == null) return 0;
        if (aScore == null) return 1;
        if (bScore == null) return -1;
        return bScore - aScore;
      });
    if (posFilter === "ALL") return list;
    return list.filter((p) => normalizeCombinePosGroup(String(p.pos ?? "")) === posFilter);
  }, [prospects, posFilter, state]);

  const hasCanonicalProspects = prospects.length > 0;
  const combineStatus = useMemo(() => getCanonicalCombineStatus(state), [state]);
  const canonicalCombineGenerated = combineStatus.combineGenerated;
  const combineCoverage = combineStatus.coverage;
  const hasAnyMetricsCoverage = combineStatus.hasAnyMetricsCoverage;
  const hasAnyAthleticSummaryCoverage = combineStatus.hasAnyAthleticSummaryCoverage;
  const hasAnyPercentileCoverage = combineStatus.hasAnyPercentileCoverage;
  const hasUsableCanonicalCombineData = hasAnyAthleticSummaryCoverage || hasAnyPercentileCoverage;
  const hasFullAthleticSummaryCoverage = combineStatus.hasFullAthleticSummaryCoverage;
  const hasFullPercentileCoverage = combineStatus.hasFullPercentileCoverage;
  const isCoverageComplete = hasFullAthleticSummaryCoverage && hasFullPercentileCoverage;
  const hasPartialCoverage = canonicalCombineGenerated && hasUsableCanonicalCombineData && !isCoverageComplete;
  const hasGeneratedNoUsableData = canonicalCombineGenerated && !hasUsableCanonicalCombineData;

  const combineStatusLabelByKind = {
    NO_PROSPECTS: "No canonical prospects",
    NOT_GENERATED: "Combine not generated",
    GENERATED_NO_USABLE_DATA: "Combine generated (no usable data)",
    GENERATED_PARTIAL: "Combine generated (partial coverage)",
    GENERATED_FULL: "Combine generated (full coverage)",
  } as const;
  const combineStatusLabel = combineStatusLabelByKind[combineStatus.kind];

  const top = filtered.slice(0, 80);

  const shortlist = (state.offseasonData.combine as { shortlist?: Record<string, boolean> }).shortlist ?? {};

  function completeStep() {
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "COMBINE" } });
  }

  function next() {
    dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
  }

  const viewProspect = viewId
    ? top.find((p) => String(p.id) === viewId) ?? null
    : null;

  return (
    <HubShell title="COMBINE">
      <div className="space-y-4 overflow-x-hidden">
        <HubPageCard
          title="Combine Results"
          subtitle="Review athletic testing and measurables. Use filters to narrow the board."
          right={
            <>
              <Badge variant="outline">{combineStatusLabel}</Badge>
              <Button variant="outline" className="min-h-11" onClick={completeStep}>
                Complete Step
              </Button>
              <Button
                className="min-h-11"
                onClick={next}
                disabled={!state.offseason.stepsComplete.COMBINE}
              >
                Continue →
              </Button>
            </>
          }
        >
          <div className="overflow-x-auto pb-1"><div className="flex min-w-max items-center gap-2">
            {["ALL", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"].map((p) => (
              <Button key={p} size="sm" variant={posFilter === p ? "default" : "secondary"} className="min-h-11 rounded-full" onClick={() => setPosFilter(p)}>
                {p}
              </Button>
            ))}
          </div></div>

          <Separator className="my-3 bg-slate-300/15" />

          <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
            {hasPartialCoverage ? (
              <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Combine has run with partial canonical coverage. Athletic-summary coverage: {combineCoverage.prospectsWithAthleticSummaryMetrics} / {combineCoverage.totalCanonicalProspects}; percentile-ready coverage: {combineCoverage.prospectsWithPercentileMetrics} / {combineCoverage.totalCanonicalProspects}.
              </div>
            ) : null}
            {!hasCanonicalProspects ? (
              <div className="text-sm text-slate-200/70">No canonical draft prospects are available.</div>
            ) : !canonicalCombineGenerated ? (
              <div className="text-sm text-slate-200/70">Generating combine data for canonical scouting results…</div>
            ) : !hasUsableCanonicalCombineData ? (
              <div className="text-sm text-slate-200/70">{hasAnyMetricsCoverage ? "Combine generated, but canonical metrics are too incomplete for athletic summaries." : "Combine generated, but no usable canonical combine data is available yet."}</div>
            ) : top.length === 0 ? (
              <div className="text-sm text-slate-200/70">No combine prospects found for this position group.</div>
            ) : (
              top.map((p, idx) => {
                const id = String(p.id ?? `${idx}`);
                const name = String(p.name ?? "Prospect");
                const pos = String(p.pos ?? "UNK");
                const forty = p.forty != null ? String(p.forty) : "—";
                const vert = p.vert != null ? String(p.vert) : "—";
                const bench = p.bench != null ? String(p.bench) : "—";
                const athleticSummary = hasEnoughAthleticDataForSummary(p)
                  ? getAthleticSummary({
                      forty: parseCanonicalMetric(p.forty) ?? undefined,
                      vert: parseCanonicalMetric(p.vert) ?? undefined,
                      shuttle: parseCanonicalMetric(p.shuttle) ?? undefined,
                      threeCone: parseCanonicalMetric(p.threeCone) ?? undefined,
                      bench: parseCanonicalMetric(p.bench) ?? undefined,
                    })
                  : null;
                const topPercentile = topPercentileByProspectId[id];
                const tier = topPercentile != null ? athleticTierFromTopPercentile(topPercentile) : null;
                const isShortlisted = !!shortlist[id];
                const medicalTier = (getCanonicalMedicalResult(state, id) as { riskTier?: string } | null)?.riskTier ?? "—";
                const interviewScore = getCanonicalInterviewResult(state, id)?.slice(-1)?.[0]?.score;

                return (
                  <div
                    key={id}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        #{idx + 1}{" "}
                        <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(id)}>
                          {name}
                        </button>{" "}
                        <span className="text-slate-200/70">({pos})</span>
                      </div>
                      <div className="truncate text-xs text-slate-200/70">
                        40 {forty} · Vert {vert} · Shuttle {p.shuttle ?? "—"} · Bench {bench} · Athletic {athleticSummary?.overallLabel ?? "No combine data"} · Interview {interviewScore ?? "—"} · Medical {medicalTier}
                        {tier ? <span className="ml-1 font-medium text-sky-300">{tier}{topPercentile != null ? ` (${topPercentDisplay(topPercentile)})` : ""}</span> : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant={isShortlisted ? "default" : "outline"}
                        className="min-h-11"
                        onClick={() => dispatch({ type: "COMBINE_TOGGLE_SHORTLIST", payload: { prospectId: id } })}
                      >
                        {isShortlisted ? "★ Listed" : "☆ Pin"}
                      </Button>
                      <Button size="sm" variant="secondary" className="min-h-11" onClick={() => setViewId(id)}>
                        View
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </HubPageCard>
      </div>

      {/* View drawer */}
      <Sheet open={!!viewProspect} onOpenChange={(open) => { if (!open) setViewId(null); }}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto bg-slate-950 text-slate-100">
          {viewProspect ? (() => {
            const id = String(viewProspect.id);
            const topPercentile = topPercentileByProspectId[id];
            const tier = topPercentile != null ? athleticTierFromTopPercentile(topPercentile) : "—";
            const athleticSummary = hasEnoughAthleticDataForSummary(viewProspect) ? getAthleticSummary({ forty: parseCanonicalMetric(viewProspect.forty) ?? undefined, vert: parseCanonicalMetric(viewProspect.vert) ?? undefined, shuttle: parseCanonicalMetric(viewProspect.shuttle) ?? undefined, threeCone: parseCanonicalMetric(viewProspect.threeCone) ?? undefined, bench: parseCanonicalMetric(viewProspect.bench) ?? undefined }) : null;
            const scoutView = getScoutViewProspect(state, id);
            const canonicalProfile = getCanonicalScoutProfile(state, id);
            return (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-slate-100">
                    {viewProspect.name ?? "Prospect"}{" "}
                    <span className="text-slate-400">({viewProspect.pos ?? "UNK"})</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-2">
                    <div className="font-semibold text-slate-200">Athletic Testing</div>
                    <div className="grid grid-cols-2 gap-1 text-slate-300">
                      <span className="text-slate-400">40-Yard Dash</span><span>{viewProspect.forty ?? "—"}</span>
                      <span className="text-slate-400">Vertical</span><span>{viewProspect.vert ?? "—"}"</span>
                      <span className="text-slate-400">Bench Press</span><span>{viewProspect.bench ?? "—"} reps</span>
                      <span className="text-slate-400">Shuttle</span><span>{viewProspect.shuttle ?? "—"}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-2">
                    <div className="font-semibold text-slate-200">Athletic Summary</div>
                    <div className="grid grid-cols-2 gap-1 text-slate-300">
                      <span className="text-slate-400">Overall Label</span>
                      <span className="font-medium">{athleticSummary?.overallLabel ?? "No combine data"}</span>
                      <span className="text-slate-400">Speed</span>
                      <span>{athleticSummary?.speed ?? "—"}</span>
                      <span className="text-slate-400">Explosiveness</span>
                      <span>{athleticSummary?.explosiveness ?? "—"}</span>
                      <span className="text-slate-400">Agility</span>
                      <span>{athleticSummary?.agility ?? "—"}</span>
                      <span className="text-slate-400">Power</span>
                      <span>{athleticSummary?.power ?? "—"}</span>
                      <span className="text-slate-400">Tier</span>
                      <span className="font-medium text-sky-300">{tier}{topPercentile != null ? ` (${topPercentDisplay(topPercentile)})` : ""}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1">
                    <div className="font-semibold text-slate-200">Scout View</div>
                    {scoutView || canonicalProfile ? (
                      <div className="text-slate-300">Est OVR {scoutView?.estOverallRange?.[0] ?? (typeof canonicalProfile?.estLow === "number" ? Math.round(canonicalProfile.estLow) : "—")}–{scoutView?.estOverallRange?.[1] ?? (typeof canonicalProfile?.estHigh === "number" ? Math.round(canonicalProfile.estHigh) : "—")} ({scoutView?.confidence ?? (typeof canonicalProfile?.confidence === "number" ? Math.round(canonicalProfile.confidence) : "—")}% confidence)</div>
                    ) : (
                      <div className="text-slate-400">No scout profile</div>
                    )}
                  </div>
                  <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1">
                    <div className="font-semibold text-slate-200">Info</div>
                    <div className="grid grid-cols-2 gap-1 text-slate-300">
                      <span className="text-slate-400">Archetype</span><span>{viewProspect.archetype ?? "—"}</span>
                      <span className="text-slate-400">Interview</span><span>{getCanonicalInterviewResult(state, id)?.slice(-1)?.[0]?.score ?? "—"}</span>
                      <span className="text-slate-400">Medical</span><span>{(getCanonicalMedicalResult(state, id) as { riskTier?: string } | null)?.riskTier ?? "—"}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full min-h-11"
                    variant={shortlist[id] ? "default" : "outline"}
                    onClick={() => dispatch({ type: "COMBINE_TOGGLE_SHORTLIST", payload: { prospectId: id } })}
                  >
                    {shortlist[id] ? "★ Remove from My Board" : "☆ Add to My Board"}
                  </Button>
                </div>
              </>
            );
          })() : null}
        </SheetContent>
      </Sheet>

      {modal}
    </HubShell>
  );
}
