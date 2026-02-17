import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, type OffseasonTaskId } from "@/context/GameContext";
import { OFFSEASON_STEPS } from "@/engine/offseason";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TASKS: { id: OffseasonTaskId; title: string; desc: string }[] = [
  { id: "STAFF", title: "Staff", desc: "Hire OC + DC (required) and optionally AHC." },
  { id: "INSTALL", title: "Install", desc: "Sets initial offense/defense scheme defaults." },
  { id: "SCOUTING", title: "Scouting", desc: "Seeds scouting board + combine flag." },
  { id: "MEDIA", title: "Media", desc: "Sets baseline reputation + media expectations." },
];

export default function Offseason() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const done = state.offseason.completed;
  const staffOk = !!state.orgRoles.ocCoachId && !!state.orgRoles.dcCoachId;
  const tasksOk = useMemo(() => {
    const base = Object.values(done).every(Boolean);
    return base && staffOk;
  }, [done, staffOk]);

  const step = state.offseason.stepId;
  const stepMeta = OFFSEASON_STEPS.find((s) => s.id === step)!;
  const stepDone = !!state.offseason.stepsComplete[step];

  const toggle = (id: OffseasonTaskId) => {
    const next = !done[id];
    dispatch({ type: "OFFSEASON_SET_TASK", payload: { taskId: id, completed: next } });
    if (next) dispatch({ type: "OFFSEASON_APPLY_TASK_EFFECT", payload: { taskId: id } });
  };

  const completeStep = () => {
    if (step === "RESIGNING" && !tasksOk) return;
    dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: step } });
  };

  const advance = () => {
    dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
    dispatch({ type: "AUTO_ADVANCE_STAGE_IF_READY" });
    if (step === "TRAINING_CAMP") navigate("/hub/preseason");
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-bold">Offseason</div>
              <div className="text-sm text-muted-foreground">
                Current: <span className="font-medium">{stepMeta.title}</span>
              </div>
            </div>
            <Badge variant="outline">{state.season}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">{stepMeta.desc}</div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {TASKS.map((t) => {
          const locked = t.id === "STAFF" ? false : !staffOk;
          const disabledReason = t.id !== "STAFF" && !staffOk ? "Hire OC+DC first" : null;
          return (
            <Card
              key={t.id}
              className={`cursor-pointer hover:border-primary ${locked ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => toggle(t.id)}
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{t.title}</div>
                  <Badge variant={done[t.id] ? "default" : "outline"}>{done[t.id] ? "Done" : "Todo"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{t.desc}</div>
                {disabledReason ? <div className="text-xs text-muted-foreground">{disabledReason}</div> : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {step === "RESIGNING"
              ? tasksOk
                ? "Ready to complete this step."
                : "Complete Staff + tasks to proceed."
              : stepDone
                ? "Step complete."
                : "Mark step complete to proceed."}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={completeStep} disabled={stepDone || (step === "RESIGNING" && !tasksOk)}>
              Complete Step
            </Button>
            <Button onClick={advance} disabled={!stepDone}>
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-2">
          <div className="font-semibold">Offseason Schedule</div>
          <div className="grid gap-2">
            {OFFSEASON_STEPS.map((s, idx) => {
              const isCurrent = s.id === step;
              const doneStep = !!state.offseason.stepsComplete[s.id];
              return (
                <div key={s.id} className={`flex items-center justify-between rounded-md border px-3 py-2 ${isCurrent ? "bg-secondary/50" : ""}`}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {idx + 1}. {s.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
                  </div>
                  <Badge variant={doneStep ? "default" : isCurrent ? "secondary" : "outline"}>
                    {doneStep ? "Done" : isCurrent ? "Now" : "Later"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
