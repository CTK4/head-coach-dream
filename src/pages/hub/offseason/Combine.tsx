import { useMemo, useState } from "react";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { HubPageCard } from "@/components/franchise-hub/HubPageCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/context/GameContext";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Combine() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const [posFilter, setPosFilter] = useState<string>("ALL");

  const combine = (state as any).offseasonData?.combine ?? {};
  const prospects: any[] = Array.isArray(combine.prospects) ? combine.prospects : [];

  const filtered = useMemo(() => {
    const list = prospects.slice();
    if (posFilter === "ALL") return list;
    return list.filter((p) => String(p.pos ?? "").toUpperCase() === posFilter);
  }, [prospects, posFilter]);

  const top = filtered.slice(0, 80);

  function completeStep() {
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "COMBINE" } } as any);
  }

  function next() {
    dispatch({ type: "OFFSEASON_ADVANCE_STEP" } as any);
  }

  return (
    <HubShell title="COMBINE">
      <div className="space-y-4 overflow-x-hidden">
        <HubPageCard
          title="Combine Results"
          subtitle="Review athletic testing and measurables. Use filters to narrow the board."
          right={
            <>
              <Badge variant="outline">{prospects.length} Prospects</Badge>
              <Button variant="outline" onClick={completeStep}>
                Complete Step
              </Button>
              <Button
                onClick={next}
                disabled={!state.offseason?.stepsComplete?.COMBINE && !(state as any).offseason?.stepsComplete?.COMBINE}
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
            {top.length === 0 ? (
              <div className="text-sm text-slate-200/70">No prospects available.</div>
            ) : (
              top.map((p, idx) => {
                const name = String(p.name ?? p.fullName ?? "Prospect");
                const pos = String(p.pos ?? "UNK");
                const forty = p.forty != null ? String(p.forty) : "—";
                const vert = p.vert != null ? String(p.vert) : "—";
                const bench = p.bench != null ? String(p.bench) : "—";
                const ras = p.ras != null ? clamp(Number(p.ras), 0, 10).toFixed(1) : "—";

                return (
                  <div
                    key={String(p.id ?? p.playerId ?? `${idx}-${name}`)}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        #{idx + 1}{" "}
                        <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(String(p.id ?? p.playerId ?? ""))}>
                          {name}
                        </button>{" "}
                        <span className="text-slate-200/70">({pos})</span>
                      </div>
                      <div className="truncate text-xs text-slate-200/70">
                        40 {forty} · Vert {vert} · Bench {bench} · RAS {ras}
                      </div>
                    </div>
                    <Badge variant="secondary">Tier {clamp(Number(p.tier ?? 60), 1, 99)}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </HubPageCard>
      </div>
      {modal}
    </HubShell>
  );
}
