import { useGame } from "@/context/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrainingCamp() {
  const { state, dispatch } = useGame();
  const s = state.offseasonData.camp.settings;
  const set = (k: "intensity" | "installFocus" | "positionFocus", v: string) => dispatch({ type: "CAMP_SET", payload: { settings: { [k]: v } } });
  const completeStep = () => dispatch({ type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "TRAINING_CAMP" } });
  const next = () => dispatch({ type: "OFFSEASON_ADVANCE_STEP" });
  return <div className="p-4 md:p-8 space-y-4"><Card><CardContent className="p-6 flex items-center justify-between"><div className="space-y-1"><div className="text-xl font-bold">Training Camp</div><div className="text-sm text-muted-foreground">Set camp emphasis (feeds later systems).</div></div><Badge variant="outline">Step 7</Badge></CardContent></Card><Card><CardContent className="p-6 space-y-4"><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><div className="text-sm font-semibold">Intensity</div><Select value={s.intensity} onValueChange={(v) => set("intensity", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="NORMAL">Normal</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent></Select></div><div className="space-y-2"><div className="text-sm font-semibold">Install Focus</div><Select value={s.installFocus} onValueChange={(v) => set("installFocus", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BALANCED">Balanced</SelectItem><SelectItem value="OFFENSE">Offense</SelectItem><SelectItem value="DEFENSE">Defense</SelectItem></SelectContent></Select></div><div className="space-y-2"><div className="text-sm font-semibold">Position Focus</div><Select value={s.positionFocus} onValueChange={(v) => set("positionFocus", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["NONE", "QB", "OL", "DL", "DB", "WR", "RB", "LB", "TE"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div></div></CardContent></Card><Card><CardContent className="p-6 flex items-center justify-between gap-3"><div className="text-sm text-muted-foreground">Complete to unlock preseason games.</div><div className="flex gap-2"><Button variant="outline" onClick={completeStep}>Complete Step</Button><Button onClick={next} disabled={!state.offseason.stepsComplete.TRAINING_CAMP}>Next →</Button></div></CardContent></Card></div>;
}
