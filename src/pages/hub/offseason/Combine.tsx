import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { genCombine } from "@/engine/offseasonGen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Combine() {
  const { state, dispatch } = useGame();
  const seed = state.saveSeed ^ 0x22222222;

  const results = useMemo(() => (state.offseasonData.combine.generated ? genCombine(seed, 40) : []), [state.offseasonData.combine.generated, seed]);

  const generate = () => dispatch({ type: "COMBINE_GENERATE" });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "COMBINE" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">Scouting Combine</div><div className="text-sm text-muted-foreground">Generate combine testing results (deterministic by seed).</div></div><Badge variant="outline">Step 2</Badge></CardContent></Card>
      <Card><CardContent className="p-6 flex flex-wrap items-center justify-between gap-2"><div className="text-sm text-muted-foreground">{state.offseasonData.combine.generated ? "Results generated." : "Generate to unlock results."}</div><div className="flex gap-2"><Button variant="outline" onClick={generate} disabled={state.offseasonData.combine.generated}>Generate</Button><Button variant="outline" onClick={completeStep} disabled={!state.offseasonData.combine.generated}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.COMBINE}>Next →</Button></div></CardContent></Card>
      {results.length ? <Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Top Results</div><Badge variant="outline">{results.length}</Badge></div><div className="space-y-2 max-h-[420px] overflow-auto pr-1">{results.slice(0, 25).map((r) => (<div key={r.id} className="border rounded-md px-3 py-2 text-sm flex items-center justify-between"><div className="min-w-0"><div className="font-medium truncate">{r.name} <span className="text-muted-foreground">({r.pos})</span></div><div className="text-xs text-muted-foreground">40 {r.forty} · Shuttle {r.shuttle} · 3C {r.threeCone}</div></div><Badge variant="secondary">Grade {r.grade}</Badge></div>))}</div></CardContent></Card> : null}
    </div>
  );
}
