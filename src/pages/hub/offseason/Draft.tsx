import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Draft() {
  const { state, dispatch } = useGame();

  const board = useMemo(
    () => (state.offseasonData.draft.board.length ? state.offseasonData.draft.board : []),
    [state.offseasonData.draft.board]
  );

  const picks = state.offseasonData.draft.picks;
  const available = useMemo(() => board.filter((p) => !picks.some((x) => x.id === p.id)).slice(0, 80), [board, picks]);

  const pick = (id: string) => dispatch({ type: "DRAFT_PICK", payload: { prospectId: id } });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "DRAFT" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });

  return <div className="p-4 md:p-8 space-y-4"><Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">Draft</div><div className="text-sm text-muted-foreground">MVP: choose 7 picks from the board.</div></div><Badge variant="outline">Step 6</Badge></CardContent></Card><div className="grid md:grid-cols-2 gap-4"><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Available</div><Badge variant="outline">{available.length}</Badge></div><div className="space-y-2 max-h-[560px] overflow-auto pr-1">{available.map((p, idx) => <div key={p.id} className="border rounded-md px-3 py-2 flex items-center justify-between"><div className="min-w-0"><div className="font-medium truncate">#{idx + 1} {p.name} <span className="text-muted-foreground">({p.pos})</span></div><div className="text-xs text-muted-foreground">Grade {p.grade} · RAS {p.ras} · {p.archetype}</div></div><Button size="sm" variant="outline" onClick={() => pick(p.id)} disabled={picks.length >= 7}>Pick</Button></div>)}</div></CardContent></Card><Card><CardContent className="p-5 space-y-3"><div className="flex items-center justify-between"><div className="font-semibold">Your Picks</div><Badge variant="secondary">{picks.length}/7</Badge></div><div className="space-y-2 max-h-[560px] overflow-auto pr-1">{picks.length ? picks.map((p, idx) => <div key={p.id} className="border rounded-md px-3 py-2"><div className="font-medium">R{idx + 1}: {p.name} <span className="text-muted-foreground">({p.pos})</span></div><div className="text-xs text-muted-foreground">Grade {p.grade} · RAS {p.ras} · Interview {p.interview}</div></div>) : <div className="text-sm text-muted-foreground">No picks yet.</div>}</div></CardContent></Card></div><Card><CardContent className="p-6 flex items-center justify-between gap-3"><div className="text-sm text-muted-foreground">{picks.length >= 7 ? "Draft complete." : "Make 7 picks to finish."}</div><div className="flex gap-2"><Button variant="outline" onClick={completeStep} disabled={picks.length < 7}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.DRAFT}>Next →</Button></div></CardContent></Card></div>;
}
