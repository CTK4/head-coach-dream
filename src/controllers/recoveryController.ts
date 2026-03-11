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
      const message = "No active save is selected, so backup restore cannot run.";
      setError(message);
      dispatch({ type: "RECOVERY_SET_ERRORS", payload: { errors: [message] } });
      setBusyAction(null);
      return;
    }

    const restored = loadSaveResult(activeSaveId);
    if (!restored.ok) {
      const message = "message" in restored ? restored.message : "Failed to restore backup.";
      setError(message);
      dispatch({ type: "RECOVERY_SET_ERRORS", payload: { errors: [message] } });
      setBusyAction(null);
      return;
    }

    dispatch({ type: "RECOVERY_HYDRATE_STATE", payload: { state: restored.state } });
    setBusyAction(null);
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
    dispatch({ type: "RESET" });
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
