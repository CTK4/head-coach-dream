import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Preseason() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "PRESEASON" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
  return <div className="p-4 md:p-8 space-y-4"><Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">Preseason (3 Games)</div><div className="text-sm text-muted-foreground">Play games via the Preseason page.</div></div><Badge variant="outline">Step 8</Badge></CardContent></Card><Card><CardContent className="p-6 flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-muted-foreground">Current week: {state.hub.preseasonWeek} / 3</div><div className="flex gap-2"><Button variant="outline" onClick={() => navigate("/hub/preseason")}>Go to Preseason Games</Button><Button variant="outline" onClick={completeStep} disabled={state.hub.preseasonWeek < 3}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.PRESEASON}>Next →</Button></div></CardContent></Card></div>;
}
