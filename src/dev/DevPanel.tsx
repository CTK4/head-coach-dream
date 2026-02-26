import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stageToRoute } from "@/components/franchise-hub/stageRouting";
import { useGame } from "@/context/GameContext";
import { syncCurrentSave } from "@/lib/saveManager";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEV_POSITIONS, type DevAction } from "@/dev/runDevAction";
import type { DevGate } from "@/dev/applyDevGate";

const GATES: Array<{ gate: DevGate; label: string }> = [
  { gate: "OFFSEASON_HUB", label: "Offseason Hub" },
  { gate: "RESIGN", label: "Re-sign" },
  { gate: "COMBINE", label: "Combine" },
  { gate: "TAMPERING", label: "Tampering" },
  { gate: "FREE_AGENCY", label: "Free Agency" },
  { gate: "PRE_DRAFT", label: "Pre-Draft" },
  { gate: "DRAFT", label: "Draft" },
  { gate: "TRAINING_CAMP", label: "Training Camp" },
  { gate: "PRESEASON", label: "Preseason" },
  { gate: "CUTDOWNS", label: "Cutdowns" },
  { gate: "REGULAR_SEASON", label: "Regular Season" },
];

export default function DevPanel() {
  const enabled = import.meta.env.DEV || (typeof window !== "undefined" && localStorage.getItem("DEV_PANEL") === "1");
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saveAfter, setSaveAfter] = useState(false);
  const [status, setStatus] = useState("");
  const [faCount, setFaCount] = useState(50);
  const [draftYear, setDraftYear] = useState(Number(state.season ?? 2026) + 1);
  const [draftCount, setDraftCount] = useState(220);
  const [fillTeamId, setFillTeamId] = useState(String(state.acceptedOffer?.teamId ?? ""));
  const [fillCount, setFillCount] = useState(1);
  const [fillPositions, setFillPositions] = useState<string[]>(["OL", "DL"]);
  const [capAmount, setCapAmount] = useState(50_000_000);

  const teamIds = useMemo(() => {
    const ids = Object.keys(state.league?.standings ?? {});
    return ids.length ? ids : [String(state.acceptedOffer?.teamId ?? "")].filter(Boolean);
  }, [state.league, state.acceptedOffer]);

  if (!enabled) return null;

  const maybeSave = () => {
    if (!saveAfter) return;
    syncCurrentSave(state);
  };

  const runAction = (action: DevAction, payload?: Record<string, unknown>) => {
    dispatch({ type: "DEV_RUN_ACTION", payload: { action, payload } });
    maybeSave();
    setStatus(`Done: ${action}`);
  };

  const applyGate = (gate: DevGate) => {
    dispatch({ type: "DEV_APPLY_GATE", payload: { gate, options: { saveAfter } } });
    navigate(stageToRoute(gate === "OFFSEASON_HUB" ? "OFFSEASON_HUB" : (gate as any)));
    maybeSave();
    setStatus(`Done: ${gate}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">DEV</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Developer Panel</DialogTitle>
          </DialogHeader>
          <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={saveAfter} onChange={(e) => setSaveAfter(e.target.checked)} /> Save after apply/run</label>
          <Tabs defaultValue="gates">
            <TabsList>
              <TabsTrigger value="gates">Gates</TabsTrigger>
              <TabsTrigger value="actions">Dev Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="gates" className="space-y-2">
              {GATES.map((g) => (
                <Button key={g.gate} variant="outline" className="mr-2 mb-2" onClick={() => applyGate(g.gate)}>{g.label}</Button>
              ))}
            </TabsContent>
            <TabsContent value="actions" className="space-y-3">
              <div className="space-x-2">
                <Input className="inline-block w-28" type="number" value={faCount} onChange={(e) => setFaCount(Number(e.target.value || 50))} />
                <Button onClick={() => runAction("SPAWN_FREE_AGENTS", { count: faCount })}>Spawn Free Agents</Button>
              </div>
              <div className="space-x-2">
                <Input className="inline-block w-28" type="number" value={draftYear} onChange={(e) => setDraftYear(Number(e.target.value || state.season + 1))} />
                <Input className="inline-block w-28" type="number" value={draftCount} onChange={(e) => setDraftCount(Number(e.target.value || 220))} />
                <Button onClick={() => runAction("REGEN_DRAFT_CLASS", { year: draftYear, count: draftCount })}>Regenerate Upcoming Draft Class</Button>
              </div>
              <Button onClick={() => runAction("ADVANCE_PHASE")}>Fast-forward to Next Phase</Button>
              <Button onClick={() => runAction("CLEAR_INJURIES")}>Clear All Injuries</Button>
              <div className="space-x-2">
                <select className="h-9 rounded border px-2" value={fillTeamId} onChange={(e) => setFillTeamId(e.target.value)}>
                  {teamIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
                <Input className="inline-block w-20" type="number" value={fillCount} onChange={(e) => setFillCount(Number(e.target.value || 1))} />
                <Button onClick={() => runAction("FILL_ROSTER_NEEDS", { teamId: fillTeamId, positions: fillPositions, countPerPosition: fillCount })}>Fill Roster Needs</Button>
                <div className="flex flex-wrap gap-2 pt-1">
                  {DEV_POSITIONS.map((pos) => (
                    <label key={pos} className="text-xs">
                      <input
                        type="checkbox"
                        checked={fillPositions.includes(pos)}
                        onChange={(e) => setFillPositions((prev) => e.target.checked ? [...prev, pos] : prev.filter((x) => x !== pos))}
                      /> {pos}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={() => runAction("RESET_UNREAD_NEWS")}>Reset Unread News</Button>
              <div className="space-x-2">
                <Input className="inline-block w-32" type="number" value={capAmount} onChange={(e) => setCapAmount(Number(e.target.value || 50_000_000))} />
                <Button onClick={() => runAction("GIVE_CAP_SPACE", { amount: capAmount })}>Give Cap Space</Button>
              </div>
            </TabsContent>
          </Tabs>
          {status ? <p className="mt-2 text-xs text-muted-foreground">{status}</p> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
