import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { getActiveSaveId, loadSaveResult } from "@/lib/saveManager";

export function useRecoveryController() {
  const { dispatch } = useGame();
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"restore" | "rebuild" | "fresh" | null>(null);

  const restoreBackup = async () => {
    setBusyAction("restore");
    setError(null);

    const activeSaveId = getActiveSaveId();
    if (!activeSaveId) {
      dispatch({ type: "RECOVERY_RESTORE_BACKUP" });
      setBusyAction(null);
      return;
    }

    const restored = loadSaveResult(activeSaveId);
    if (!restored.ok) {
      setError(restored.message);
      setBusyAction(null);
      return;
    }

    window.location.assign("/");
  };

  const rebuildIndices = () => {
    setBusyAction("rebuild");
    setError(null);
    dispatch({ type: "RECOVERY_REBUILD_INDICES" });
    setBusyAction(null);
  };

  const startFreshSave = () => {
    setBusyAction("fresh");
    setError(null);
    dispatch({ type: "RECOVERY_RESTORE_BACKUP" });
    setBusyAction(null);
  };

  return {
    error,
    busyAction,
    restoreBackup,
    rebuildIndices,
    startFreshSave,
  };
}
