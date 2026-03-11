import { useEffect, useRef } from "react";
import type { GameState } from "@/context/GameContext";
import { getActiveSaveId, syncCurrentSave } from "@/lib/saveManager";
import { logError } from "@/lib/logger";
import { getUserTeamId } from "@/lib/userTeam";
import { clearGameCheckpoint, writeGameCheckpoint } from "@/context/persistence/gameCheckpoint";

const AUTOSAVE_DEBOUNCE_MS = 600;

function getIsGameInProgress(state: GameState): boolean {
  return (
    state.league.phase === "REGULAR_SEASON_GAME" ||
    (state.game.weekType === "PLAYOFFS" && state.game.homeTeamId !== "HOME")
  );
}

export function useGamePersistence(state: GameState) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDriveRef = useRef(state.game.driveNumber);
  const isGameInProgress = getIsGameInProgress(state);

  useEffect(() => {
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (isGameInProgress) return;

    const teamId = getUserTeamId(state);
    if (!teamId) return;

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      try {
        syncCurrentSave(state, getActiveSaveId() ?? undefined);
      } catch (error) {
        logError("state.save.failure", {
          phase: state.phase,
          saveId: getActiveSaveId(),
          season: state.season,
          week: state.week,
          meta: { message: error instanceof Error ? error.message : String(error) },
        });
        console.error("[state-save] Failed to persist save data", error);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [state, isGameInProgress]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (isGameInProgress) return;
      if (!getUserTeamId(state)) return;
      try {
        syncCurrentSave(state, getActiveSaveId() ?? undefined);
      } catch {
        // Silent — can’t show UI in a visibilitychange handler.
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state, isGameInProgress]);

  useEffect(() => {
    const prev = prevDriveRef.current;
    prevDriveRef.current = state.game.driveNumber;

    if (!isGameInProgress) {
      clearGameCheckpoint();
      return;
    }

    if (state.game.driveNumber > prev) {
      writeGameCheckpoint(state);
    }
  }, [state.game.driveNumber, isGameInProgress, state.saveSeed, state.season, state.league.phase, state.game]);
}
