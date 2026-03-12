import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteSave, exportSave, importSave, listSaves, loadSaveResult } from "@/lib/saveManager";
import { toDisplayLabel } from "@/lib/displayLabels";
import { isCapacitorIosEnvironment } from "@/lib/saveStorageAdapter";
import { createImportExportApi } from "@/lib/native/importExport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [error, setError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const saves = useMemo(() => listSaves(), [tick]);
  const [isNative] = useState(() => isCapacitorIosEnvironment());

  const quickSaveId = query.get("saveId");
  useEffect(() => {
    if (!quickSaveId) return;
    const loaded = loadSaveResult(quickSaveId);
    if (loaded.ok) {
      window.location.href = "/hub";
      return;
    }
    if (!loaded.ok && "message" in loaded) {
      setError(`Could not load save: ${loaded.message}`);
    }
  }, [quickSaveId]);

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importSave(text);
    if (!result.ok && "message" in result) {
      setError(`Import failed: ${result.message}`);
      return;
    }
    setTick((v) => v + 1);
    setError(null);
  };

  const handleExport = async (save: typeof saves[0]) => {
    try {
      const exported = exportSave(save.saveId);
      if (!exported) {
        setError("Export failed. This save may be corrupted.");
        return;
      }

      if (isNative) {
        // Use native share on iOS
        const importExportApi = await createImportExportApi();
        const jsonData = await exported.blob.text();
        await importExportApi.exportToShare(exported.fileName, jsonData);
      } else {
        // Use web download on browser
        const url = URL.createObjectURL(exported.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exported.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(`Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Load Save</h2>
      <div className="flex items-center gap-2">
        {!isNative && (
          <>
            <input ref={importInputRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
            <Button variant="secondary" onClick={() => importInputRef.current?.click()}>Import Save</Button>
          </>
        )}
        {isNative && (
          <Button variant="secondary" disabled>Import (use Files app)</Button>
        )}
      </div>
      {error ? <Card><CardContent className="p-4 text-sm text-red-300">{error} You can delete the affected save and import a backup.</CardContent></Card> : null}
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
              <Button onClick={() => {
                const result = loadSaveResult(save.saveId);
                if (result.ok) {
                  setError(null);
                  window.location.href = '/hub';
                  return;
                }
                if (!result.ok && "message" in result) {
                  setError(`Could not load \"${save.teamName}\": ${result.message}`);
                }
              }}>Load</Button>
              <Button variant="secondary" onClick={() => handleExport(save)}>Export</Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this save?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the save for {save.coachName} ({save.teamName}).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        deleteSave(save.saveId);
                        setTick((v) => v + 1);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
