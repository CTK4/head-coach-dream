import { useMemo, useState } from "react";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/context/GameContext";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function PreDraft() {
  const { state, dispatch } = useGame();
  const [posFilter, setPosFilter] = useState<string>("ALL");

  const pre = (state as any).offseasonData?.preDraft ?? {};
  const prospects: any[] = Array.isArray(pre.prospects) ? pre.prospects : [];
  const board: any[] = Array.isArray(pre.board) ? pre.board : [];

  const list = useMemo(() => {
    const merged = board.length ? board : prospects;
    const filtered = posFilter === "ALL" ? merged : merged.filter((p) => String(p.pos ?? "").toUpperCase() === posFilter);
    return filtered
      .slice()
      .sort((a, b) => Number(b.grade ?? 0) - Number(a.grade ?? 0))
      .slice(0, 80);
  }, [board, prospects, posFilter]);

  function completeStep() {
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "PRE_DRAFT" } } as any);
  }

  function next() {
    dispatch({ type: "OFFSEASON_ADVANCE_STEP" } as any);
  }

  return (
    <HubShell title="PRE-DRAFT">
      <div className="space-y-4 overflow-x-hidden">
        <HubPageCard
          title="Pre-Draft Board"
          subtitle="Finalize your board and scout priorities before Draft day."
          right={
            <>
              <Badge variant="outline">{list.length} Shown</Badge>
              <Button variant="outline" onClick={completeStep}>
                Complete Step
              </Button>
              <Button
                onClick={next}
                disabled={!state.offseason?.stepsComplete?.PRE_DRAFT && !(state as any).offseason?.stepsComplete?.PRE_DRAFT}
              >
                Continue →
              </Button>
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "QB", "RB", "WR", "TE", "OL", "DL", "EDGE", "LB", "CB", "S"].map((p) => (
              <Button key={p} size="sm" variant={posFilter === p ? "default" : "secondary"} onClick={() => setPosFilter(p)}>
                {p}
              </Button>
            ))}
          </div>

          <Separator className="my-3 bg-slate-300/15" />

          <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
            {list.length === 0 ? (
              <div className="text-sm text-slate-200/70">No prospects available.</div>
            ) : (
              list.map((p, idx) => {
                const name = String(p.name ?? p.fullName ?? "Prospect");
                const pos = String(p.pos ?? "UNK");
                const tier = clamp(Number(p.tier ?? 60), 1, 99);
                const grade = Number.isFinite(Number(p.grade)) ? Number(p.grade).toFixed(0) : "—";

                return (
                  <div
                    key={String(p.id ?? p.playerId ?? `${idx}-${name}`)}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        #{idx + 1} {name} <span className="text-slate-200/70">({pos})</span>
                      </div>
                      <div className="truncate text-xs text-slate-200/70">
                        Grade {grade} · {p.archetype ? `Archetype ${p.archetype}` : "Archetype —"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Tier {tier}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </HubPageCard>
      </div>
    </HubShell>
  );
}
