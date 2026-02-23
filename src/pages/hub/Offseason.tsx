import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { OFFSEASON_STEPS } from "@/engine/offseason";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stepRoute: Record<string, string> = {
  RESIGNING: "/offseason/resigning",
  COMBINE: "/offseason/combine",
  TAMPERING: "/offseason/tampering",
  FREE_AGENCY: "/offseason/free-agency",
  PRE_DRAFT: "/offseason/pre-draft",
  DRAFT: "/offseason/draft",
  TRAINING_CAMP: "/offseason/training-camp",
  PRESEASON: "/offseason/preseason",
  CUT_DOWNS: "/offseason/cutdowns",
};

export default function Offseason() {
  const { state } = useGame();
  const navigate = useNavigate();
  const step = state.offseason.stepId;
  const stepMeta = OFFSEASON_STEPS.find((s) => s.id === step)!;
  const goCurrent = () => navigate(stepRoute[step]);
  const ready = useMemo(() => !!state.orgRoles.ocCoachId && !!state.orgRoles.dcCoachId && !!state.orgRoles.stcCoachId, [state.orgRoles.ocCoachId, state.orgRoles.dcCoachId, state.orgRoles.stcCoachId]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card><CardContent className="p-6 flex items-center justify-between gap-3"><div className="space-y-1"><div className="text-2xl font-bold">Offseason</div><div className="text-sm text-muted-foreground">Current: <span className="font-medium">{stepMeta.title}</span></div>{!ready ? <div className="text-xs text-muted-foreground">Hire OC + DC first (Staff step).</div> : null}</div><div className="flex gap-2"><Button variant="outline" onClick={goCurrent} disabled={!ready}>Open Current Step</Button><Badge variant="outline">{state.season}</Badge></div></CardContent></Card>
      <Card><CardContent className="p-5 space-y-2"><div className="font-semibold">Schedule</div>{OFFSEASON_STEPS.map((s, idx) => { const isCurrent = s.id === step; const done = !!state.offseason.stepsComplete[s.id]; return <div key={s.id} className={`flex items-center justify-between rounded-md border px-3 py-2 ${isCurrent ? "bg-secondary/50" : ""}`}><div className="min-w-0"><div className="text-sm font-medium truncate">{idx + 1}. {s.title}</div><div className="text-xs text-muted-foreground truncate">{s.desc}</div></div><div className="flex items-center gap-2"><Badge variant={done ? "default" : isCurrent ? "secondary" : "outline"}>{done ? "Done" : isCurrent ? "Now" : "Later"}</Badge><Button size="sm" variant="outline" onClick={() => navigate(stepRoute[s.id])} disabled={!ready && s.id !== "RESIGNING"}>Open</Button></div></div>;})}</CardContent></Card>
    </div>
  );
}
