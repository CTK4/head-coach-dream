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
import { getDrillCompositeScore } from "@/engine/scouting/drillComposite";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";
import { getLegacyCombineProspectsView } from "@/engine/scouting/legacyBridge";
import { getCanonicalCombineResult, getCanonicalInterviewResult, getCanonicalMedicalResult, getCanonicalScoutProfile } from "@/engine/scouting/selectors";
import { normalizeProspectPosition } from "@/lib/prospectPosition";

function normalizeCombinePosGroup(pos: string): string {
  const raw = normalizeProspectPosition(String(pos ?? ""), "DRAFT");
  if (raw === "DT") return "DL"; // interior DL bucket
  return raw;
}

function pctToTier(pct: number): string {
  if (pct >= 90) return "Elite";
  if (pct >= 85) return "Top 15%";
  if (pct >= 60) return "Above Avg";
  if (pct >= 40) return "Average";
  return "Below Avg";
}

export default function Combine() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [viewId, setViewId] = useState<string | null>(null);

  const combine = state.offseasonData.combine;

  useEffect(() => {
    dispatch({ type: "OFFSEASON_SET_STEP", payload: { stepId: "COMBINE" } });
  }, [dispatch]);

  const prospects = useMemo(() => getLegacyCombineProspectsView(state), [state]);

  const percentileMap = useMemo(() => {
    const byGroup: Record<string, Array<{ id: string; score: number }>> = {};
    for (const p of prospects) {
      const id = String(p.id);
      const result = getCanonicalCombineResult(state, id);
      const forty = Number(result.forty ?? p.forty ?? 4.9);
      const vert = Number(result.vert ?? p.vert ?? 30);
      const shuttle = Number(result.shuttle ?? p.shuttle ?? 4.4);
      const bench = Number(result.bench ?? p.bench ?? 18);
      const score = getDrillCompositeScore({ forty, vert, shuttle, bench });
      const grp = normalizeCombinePosGroup(String(p.pos ?? ""));
      (byGroup[grp] ??= []).push({ id, score });
    }
    const out: Record<string, number> = {};
    for (const group of Object.values(byGroup)) {
      const sorted = group.slice().sort((a, b) => a.score - b.score);
      const n = sorted.length;
      sorted.forEach(({ id }, rank) => {
        out[id] = n > 1 ? Math.round((rank / (n - 1)) * 100) : 100;
      });
    }
    return out;
  }, [prospects, state]);

  const filtered = useMemo(() => {
    const list = prospects
      .map((p) => ({ ...p, ...getCanonicalCombineResult(state, p.id) }))
      .sort((a, b) => getDrillCompositeScore({ forty: Number(b.forty), vert: Number(b.vert), shuttle: Number(b.shuttle), bench: Number(b.bench) }) - getDrillCompositeScore({ forty: Number(a.forty), vert: Number(a.vert), shuttle: Number(a.shuttle), bench: Number(a.bench) }));
    if (posFilter === "ALL") return list;
    return list.filter((p) => normalizeCombinePosGroup(String(p.pos ?? "")) === posFilter);
  }, [prospects, posFilter, state]);

  const isCombineReady = combine.generated && prospects.length > 0;
  const top = filtered.slice(0, 80);

  const shortlist = (combine as { shortlist?: Record<string, boolean> }).shortlist ?? {};

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
              <Badge variant="outline">{isCombineReady ? `${prospects.length} Prospects` : "Loading combine..."}</Badge>
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
            {!isCombineReady ? (
              <div className="text-sm text-slate-200/70">Generating combine data for this season…</div>
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
                const athleticSummary = getAthleticSummary({
                  forty: Number(p.forty),
                  vert: Number(p.vert),
                  shuttle: Number(p.shuttle),
                  threeCone: Number(p.threeCone),
                  bench: Number(p.bench),
                });
                const pct = percentileMap[id];
                const tier = pct != null ? pctToTier(pct) : null;
                const topPct = pct != null ? 100 - pct : null;
                const isShortlisted = !!shortlist[id];
                const medicalTier = (getCanonicalMedicalResult(state, id) as { riskTier?: string } | null)?.riskTier ?? "—";
                const interviewScore = (getCanonicalInterviewResult(state, id) as Array<{ score?: number }> | null)?.slice(-1)?.[0]?.score;

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
                        40 {forty} · Vert {vert} · Shuttle {p.shuttle ?? "—"} · Bench {bench} · {athleticSummary.overallLabel} · Interview {interviewScore ?? p.interview ?? "—"} · Medical {medicalTier}
                        {tier ? <span className="ml-1 font-medium text-sky-300">{tier}{topPct != null ? ` (Top ${topPct}%)` : ""}</span> : null}
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
            const pct = percentileMap[id];
            const tier = pct != null ? pctToTier(pct) : "—";
            const topPct = pct != null ? 100 - pct : null;
            const athleticSummary = getAthleticSummary({ forty: Number(viewProspect.forty), vert: Number(viewProspect.vert), shuttle: Number(viewProspect.shuttle), bench: Number(viewProspect.bench) });
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
                      <span className="font-medium">{athleticSummary.overallLabel}</span>
                      <span className="text-slate-400">Speed</span>
                      <span>{athleticSummary.speed}</span>
                      <span className="text-slate-400">Explosiveness</span>
                      <span>{athleticSummary.explosiveness}</span>
                      <span className="text-slate-400">Agility</span>
                      <span>{athleticSummary.agility}</span>
                      <span className="text-slate-400">Power</span>
                      <span>{athleticSummary.power}</span>
                      <span className="text-slate-400">Tier</span>
                      <span className="font-medium text-sky-300">{tier}{topPct != null ? ` (Top ${topPct}%)` : ""}</span>
                    </div>
                  </div>
                  {scoutView || canonicalProfile ? (
                    <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1">
                      <div className="font-semibold text-slate-200">Scout View</div>
                      <div className="text-slate-300">Est OVR {scoutView?.estOverallRange?.[0] ?? Math.round(canonicalProfile?.estLow ?? 65)}–{scoutView?.estOverallRange?.[1] ?? Math.round(canonicalProfile?.estHigh ?? 85)} ({scoutView?.confidence ?? Math.round(canonicalProfile?.confidence ?? 0)}% confidence)</div>
                    </div>
                  ) : null}
                  <div className="rounded-lg border border-slate-300/15 bg-slate-900/40 p-3 space-y-1">
                    <div className="font-semibold text-slate-200">Info</div>
                    <div className="grid grid-cols-2 gap-1 text-slate-300">
                      <span className="text-slate-400">Archetype</span><span>{viewProspect.archetype ?? "—"}</span>
                      <span className="text-slate-400">Interview</span><span>{(getCanonicalInterviewResult(state, id) as Array<{ score?: number }> | null)?.slice(-1)?.[0]?.score ?? viewProspect.interview ?? "—"}</span>
                      <span className="text-slate-400">Medical</span><span>{state.scoutingState?.medical?.resultsByProspectId?.[id]?.riskTier ?? "—"}</span>
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
