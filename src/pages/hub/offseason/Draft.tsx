import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { HubShell } from "@/components/franchise-hub/HubShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Draft() {
  const { state, dispatch } = useGame();

  const board = useMemo(
    () => (state.offseasonData.draft.board.length ? state.offseasonData.draft.board : []),
    [state.offseasonData.draft.board],
  );

  const picks = state.offseasonData.draft.picks;

  const available = useMemo(() => board.filter((p) => !picks.some((x) => x.id === p.id)).slice(0, 80), [board, picks]);

  const canPickMore = picks.length < 7;

  function pickProspect(id: string) {
    dispatch({ type: "DRAFT_PICK", payload: { prospectId: id } });
  }

  function completeStep() {
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "DRAFT" } });
  }

  function next() {
    dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
  }

  return (
    <HubShell title="DRAFT">
      <div className="space-y-4 overflow-x-hidden">
        <Card className="border-slate-300/15 bg-slate-950/35">
          <CardHeader className="space-y-2">
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-slate-100">
              <span>Draft</span>
              <Badge variant="outline">Step 6</Badge>
            </CardTitle>
            <div className="text-sm text-slate-200/70">MVP: choose 7 picks from the board.</div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{picks.length}/7 Picks</Badge>
              <Badge variant="outline">{available.length} Available</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={completeStep} disabled={picks.length < 7}>
                Complete Step
              </Button>
              <Button onClick={next} disabled={!state.offseason.stepsComplete.DRAFT}>
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center justify-between text-slate-100">
                <span>Available</span>
                <Badge variant="outline">{available.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator className="bg-slate-300/15" />
              <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                {available.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-300/15 bg-slate-950/20 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        #{idx + 1} {p.name} <span className="text-slate-200/70">({p.pos})</span>
                      </div>
                      <div className="truncate text-xs text-slate-200/70">
                        Grade {p.grade} · RAS {p.ras} · {p.archetype}
                      </div>
                    </div>

                    <Button size="sm" variant="secondary" onClick={() => pickProspect(p.id)} disabled={!canPickMore}>
                      Pick
                    </Button>
                  </div>
                ))}

                {available.length === 0 ? <div className="text-sm text-slate-200/70">No prospects available.</div> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center justify-between text-slate-100">
                <span>Your Picks</span>
                <Badge variant="secondary">{picks.length}/7</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator className="bg-slate-300/15" />
              <div className="max-h-[560px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                {picks.length ? (
                  picks.map((p, idx) => (
                    <div key={p.id} className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        R{idx + 1}: {p.name} <span className="text-slate-200/70">({p.pos})</span>
                      </div>
                      <div className="truncate text-xs text-slate-200/70">
                        Grade {p.grade} · RAS {p.ras} · Interview {p.interview}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-200/70">No picks yet.</div>
                )}
              </div>

              <div className="text-xs text-slate-200/70">{picks.length >= 7 ? "Draft complete." : "Make 7 picks to finish."}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HubShell>
  );
}
