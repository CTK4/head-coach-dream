import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteSave, listSaves, loadSave } from "@/lib/saveManager";
import { toDisplayLabel } from "@/lib/displayLabels";

const rel = (ts: number) => {
  const ms = Date.now() - ts;
  const d = Math.floor(ms / 86400000);
  if (d > 0) return `${d} day${d === 1 ? "" : "s"} ago`;
  const h = Math.floor(ms / 3600000);
  if (h > 0) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return "just now";
};

export default function LoadSave() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [tick, setTick] = useState(0);
  const saves = useMemo(() => listSaves(), [tick]);

  const quickSaveId = query.get("saveId");
  if (quickSaveId) {
    const loaded = loadSave(quickSaveId);
    if (loaded) window.location.href = "/hub";
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Load Save</h2>
      {!saves.length ? (
        <Card><CardContent className="p-6">No saves found. Start a new game. <Button className="ml-2" onClick={() => navigate('/new-save')}>New Save</Button></CardContent></Card>
      ) : saves.map((save) => (
        <Card key={save.saveId}>
          <CardHeader><CardTitle>{save.coachName} · {save.teamName}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Season {save.season} · Week {save.week} · {save.record.wins}-{save.record.losses}</div>
            <div>Stage: {toDisplayLabel(save.careerStage)}</div>
            <div className="text-muted-foreground">Last played: {rel(save.lastPlayed)}</div>
            <div className="flex gap-2">
              <Button onClick={() => { loadSave(save.saveId); window.location.href = '/hub'; }}>Load</Button>
              <Button variant="destructive" onClick={() => { if (window.confirm('Delete this save?')) { deleteSave(save.saveId); setTick((v) => v + 1); } }}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
