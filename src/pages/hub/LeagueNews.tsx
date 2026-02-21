import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from "@/context/GameContext";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hapticTap } from "@/lib/haptics";

export default function LeagueNews() {
  const { state, dispatch } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const openItem = (id: string) => {
    setOpenId(id);
    dispatch({ type: "HUB_MARK_NEWS_ITEM_READ", payload: { id } });
  };

  const selected = useMemo(
    () => (openId ? state.hub.news.find((n) => n.id === openId) ?? null : null),
    [openId, state.hub.news],
  );

  const selectedIndex = useMemo(() => {
    if (!openId) return -1;
    return state.hub.news.findIndex((n) => n.id === openId);
  }, [openId, state.hub.news]);

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex >= 0 && selectedIndex < state.hub.news.length - 1;

  const openPrev = async () => {
    if (!canPrev) return;
    const nextId = state.hub.news[selectedIndex - 1].id;
    await hapticTap("light");
    openItem(nextId);
  };

  const openNext = async () => {
    if (!canNext) return;
    const nextId = state.hub.news[selectedIndex + 1].id;
    await hapticTap("light");
    openItem(nextId);
  };

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") void openPrev();
      if (e.key === "ArrowRight") void openNext();
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, selectedIndex, canPrev, canNext]);

  return (
    <HubPanel title="LEAGUE NEWS">
      <ScrollArea className="h-[65vh] pr-3" aria-label="League news list">
        <ul className="space-y-3">
          {state.hub.news.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => openItem(n.id)}
                className="w-full rounded-md border border-border/50 bg-background/40 p-3 text-left text-sm text-foreground/90 hover:bg-background/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-semibold">{n.title}</div>
                      {!state.hub.newsReadIds?.[n.id] ? (
                        <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                          NEW
                        </Badge>
                      ) : null}
                    </div>
                    {n.category ? <div className="text-[11px] text-muted-foreground">{n.category}</div> : null}
                  </div>
                  <div className="tabular-nums text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                {n.body ? <div className="mt-1 line-clamp-2 text-sm text-foreground/80">{n.body}</div> : null}
              </button>
            </li>
          ))}
          {state.hub.news.length === 0 ? (
            <li>
              <HubEmptyState title="No headlines yet" description="The wire is quiet this week." action={{ label: "Back to Hub", to: "/hub" }} />
            </li>
          ) : null}
        </ul>
      </ScrollArea>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent
          className="max-w-xl"
          onPointerDown={(e) => {
            if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
            swipeRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
          }}
          onPointerUp={async (e) => {
            if (!swipeRef.current) return;
            const dx = e.clientX - swipeRef.current.x;
            const dy = e.clientY - swipeRef.current.y;
            const dt = Date.now() - swipeRef.current.t;
            swipeRef.current = null;
            if (dt > 600) return;
            if (Math.abs(dy) > 60) return;
            if (dx > 80) await openPrev();
            if (dx < -80) await openNext();
          }}
        >
          <DialogHeader>
            <DialogTitle>{selected?.title ?? "Story"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {selected?.category ? `${selected.category} • ` : ""}
              {selected ? new Date(selected.createdAt).toLocaleString() : ""}
            </div>
            <div className="whitespace-pre-wrap text-sm text-foreground/90">{selected?.body ?? "No additional details."}</div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <Button variant="secondary" onClick={() => void openPrev()} disabled={!canPrev}>
              Prev
            </Button>
            <div className="tabular-nums text-xs text-muted-foreground">
              {selectedIndex >= 0 ? `${selectedIndex + 1} / ${state.hub.news.length}` : ""}
              <span className="ml-2 hidden sm:inline">• Arrow keys / swipe</span>
            </div>
            <Button variant="secondary" onClick={() => void openNext()} disabled={!canNext}>
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </HubPanel>
  );
}
