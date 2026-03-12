import React, { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { GameProvider, useGame } from "@/context/GameContext";
import { validateCriticalSaveState } from "@/lib/migrations/saveSchema";

const { syncCurrentSaveMock } = vi.hoisted(() => ({
  syncCurrentSaveMock: vi.fn(),
}));

vi.mock("@/lib/saveManager", () => ({
  getActiveSaveId: () => "slot-1",
  loadSaveResult: () => ({ ok: false, message: "missing save" }),
  syncCurrentSave: syncCurrentSaveMock,
}));

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

type DispatchHandle = ReturnType<typeof useGame>["dispatch"] | null;

function DispatchCapture({ onReady }: { onReady: (dispatch: DispatchHandle) => void }) {
  const { dispatch } = useGame();
  useEffect(() => {
    onReady(dispatch);
  }, [dispatch, onReady]);
  return null;
}

const describeWithDom = typeof document === "undefined" ? describe.skip : describe;

describeWithDom("GameProvider autosave guard", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let dispatchRef: DispatchHandle = null;

  beforeEach(() => {
    vi.useFakeTimers();
    syncCurrentSaveMock.mockReset();

    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <GameProvider>
          <DispatchCapture onReady={(dispatch) => (dispatchRef = dispatch)} />
        </GameProvider>,
      );
    });
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
    vi.useRealTimers();
  });

  it("suppresses persistence pre-team and saves after team selection", () => {
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(syncCurrentSaveMock).not.toHaveBeenCalled();

    expect(dispatchRef).toBeTruthy();
    act(() => {
      dispatchRef?.({
        type: "INIT_NEW_GAME_FROM_STORY",
        payload: {
          offer: {
            teamId: "MILWAUKEE_NORTHSHORE",
            years: 4,
            salary: 4_000_000,
            autonomy: 65,
            patience: 55,
            mediaNarrativeKey: "story_start",
            base: { years: 4, salary: 4_000_000, autonomy: 65 },
          },
          teamName: "Test Team",
        },
      });
    });

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(syncCurrentSaveMock).toHaveBeenCalledTimes(1);

    const parsed = syncCurrentSaveMock.mock.calls[0]?.[0];
    expect(validateCriticalSaveState(parsed).ok).toBe(true);
  });
});
