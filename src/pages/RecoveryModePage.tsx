import { AlertTriangle, RefreshCw, RotateCcw, Wrench } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useRecoveryController } from "@/controllers/recoveryController";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecoveryModePage() {
  const { state } = useGame();
  const { error, busyAction, rebuildIndices, restoreBackup, startFreshSave } = useRecoveryController();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Recovery Mode Required
            </CardTitle>
            <CardDescription>
              This save needs recovery before normal navigation can continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(state.recoveryErrors ?? []).length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {(state.recoveryErrors ?? []).map((recoveryError) => (
                  <li key={recoveryError}>{recoveryError}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No detailed error was provided, but integrity checks failed.</p>
            )}
            {error ? <p className="text-sm text-destructive">Last recovery attempt failed: {error}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery Actions</CardTitle>
            <CardDescription>Use one of these options to repair or reset the save.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button onClick={() => void restoreBackup()} disabled={busyAction !== null} className="justify-start gap-2">
              <RotateCcw className="h-4 w-4" />
              {busyAction === "restore" ? "Restoring backup..." : "Restore Backup"}
            </Button>
            <Button onClick={rebuildIndices} disabled={busyAction !== null} variant="secondary" className="justify-start gap-2">
              <Wrench className="h-4 w-4" />
              {busyAction === "rebuild" ? "Rebuilding indices..." : "Rebuild Indices"}
            </Button>
            <Button onClick={startFreshSave} disabled={busyAction !== null} variant="destructive" className="justify-start gap-2">
              <RefreshCw className="h-4 w-4" />
              {busyAction === "fresh" ? "Starting fresh..." : "Start Fresh Save"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
