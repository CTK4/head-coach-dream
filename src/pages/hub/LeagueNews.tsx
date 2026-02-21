import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from "@/context/GameContext";
import { HubPanel } from "@/components/franchise-hub/HubPanel";
import { HubEmptyState } from "@/components/franchise-hub/states/HubEmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hapticTap } from "@/lib/haptics";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function LeagueNews() {
  const { state, dispatch } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [query, setQuery] = useState<string>("");

  const filter = (state.hub.newsFilter ?? "ALL").toUpperCase();
  const filters = useMemo(() => {
    const preferred = ["LEAGUE", "COACHING", "DRAFT", "INJURY"];
    const present = new Set<string>();
    for (const n of state.hub.news) if (n.category) present.add(String(n.category).toUpperCase());
    const cats = preferred.filter((c) => present.has(c));
    for (const c of Array.from(present)) if (!cats.includes(c)) cats.push(c);
    return ["ALL", ...cats];
  }, [state.hub.news]);

  useEffect(() => {
    try {
      localStorage.setItem("hcd:newsFilter", filter);
    } catch {
      // ignore
    }
  }, [filter]);

  useEffect(() => {
    try {
      localStorage.setItem("hcd:newsQuery", query);
    } catch {
      // ignore
    }
  }, [query]);

  useEffect(() => {
    const current = (state.hub.newsFilter ?? "ALL").toUpperCase();
    if (current !== "ALL") return;
    try {
      const saved = String(localStorage.getItem("hcd:newsFilter") ?? "").toUpperCase();
      if (saved && saved !== "ALL") dispatch({ type: "HUB_SET_NEWS_FILTER", payload: { filter: saved } });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const saved = String(localStorage.getItem("hcd:newsQuery") ?? "");
      if (saved && !query) setQuery(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openItem = (id: string) => {
    setOpenId(id);
    dispatch({ type: "HUB_MARK_NEWS_ITEM_READ", payload: { id } });
  };

  const visibleNews = useMemo(() => {
    const base =
      filter === "ALL" ? state.hub.news : state.hub.news.filter((n) => String(n.category ?? "").toUpperCase() === filter);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((n) => {
      const t = String(n.title ?? "").toLowerCase();
      const b = String(n.body ?? "").toLowerCase();
      const c = String(n.category ?? "").toLowerCase();
      return t.includes(q) || b.includes(q) || c.includes(q);
    });
  }, [state.hub.news, filter, query]);

  const selected = useMemo(() => (openId ? visibleNews.find((n) => n.id === openId) ?? null : null), [openId, visibleNews]);

  const selectedIndex = useMemo(() => {
    if (!openId) return -1;
    return visibleNews.findIndex((n) => n.id === openId);
  }, [openId, visibleNews]);

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex >= 0 && selectedIndex < visibleNews.length - 1;

  const openPrev = async () => {
    if (!canPrev) return;
    const nextId = visibleNews[selectedIndex - 1].id;
    await hapticTap("light");
    openItem(nextId);
  };

  const openNext = async () => {
    if (!canNext) return;
    const nextId = visibleNews[selectedIndex + 1].id;
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
      <div className="px-4 pt-3">
        <Tabs value={filter} onValueChange={(v) => dispatch({ type: "HUB_SET_NEWS_FILTER", payload: { filter: v } })}>
          <TabsList className="flex w-full overflow-x-auto">
            {filters.map((f) => (
              <TabsTrigger key={f} value={f} className="min-w-[88px] flex-1">
                {f === "ALL" ? "All" : f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-3">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search news (title/body/category)…" aria-label="Search news" />
          {query.trim() ? <div className="mt-1 text-xs text-muted-foreground">Showing {visibleNews.length} match{visibleNews.length === 1 ? "" : "es"}</div> : null}
        </div>
      </div>

      <ScrollArea className="h-[65vh] pr-3" aria-label="League news list">
        <ul className="space-y-3">
          {visibleNews.map((n) => (
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
          {visibleNews.length === 0 ? (
            <li>
              <HubEmptyState
                title={query.trim() ? "No results" : "No stories in this filter"}
                description={query.trim() ? "Try a different search term or category." : "Try a different category, or check back later."}
                action={{ label: "Back to Hub", to: "/hub" }}
              />
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
              {selectedIndex >= 0 ? `${selectedIndex + 1} / ${visibleNews.length}` : ""}
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
