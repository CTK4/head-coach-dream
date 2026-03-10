import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeEntries, type GameLogEntry, type GameLogProps, type LogFilter } from "@/components/GameLog/types";
import { useVirtualList } from "@/hooks/useVirtualList";

const ITEM_HEIGHT = 76;
const HEADER_HEIGHT = 30;
const CONTAINER_HEIGHT = 360;
const SCROLLED_UP_THRESHOLD_PX = 50;

const FILTERS: Array<{ key: LogFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "run", label: "Run" },
  { key: "pass", label: "Pass" },
  { key: "penalty", label: "Penalty" },
];

const QUARTERS: Array<GameLogEntry["quarter"]> = [1, 2, 3, 4, "OT"];

function quarterLabel(q: GameLogEntry["quarter"]): string {
  return q === "OT" ? "OT" : `Q${q}`;
}

function matchesFilter(entry: GameLogEntry, filter: LogFilter): boolean {
  return filter === "all" ? true : entry.type === filter;
}

export function shouldShowJumpToLatest(args: { isLive: boolean; scrollTop: number; scrollHeight: number; containerHeight: number }): boolean {
  if (!args.isLive) return false;
  return args.scrollTop < args.scrollHeight - args.containerHeight - SCROLLED_UP_THRESHOLD_PX;
}

export function computeFilterCounts(entries: GameLogEntry[]): Record<LogFilter, number> {
  return {
    all: entries.length,
    run: entries.filter((e) => e.type === "run").length,
    pass: entries.filter((e) => e.type === "pass").length,
    penalty: entries.filter((e) => e.type === "penalty").length,
  };
}

export function getVisibleQuarters(entries: GameLogEntry[]): Array<GameLogEntry["quarter"]> {
  return QUARTERS.filter((q) => entries.some((entry) => entry.quarter === q));
}

function rowClass(type: GameLogEntry["type"]): string {
  if (type === "scoring") return "border-l-4 border-l-emerald-500 bg-emerald-500/10";
  if (type === "penalty") return "border-l-4 border-l-amber-500 bg-amber-500/10";
  if (type === "turnover") return "border-l-4 border-l-red-500 bg-red-500/10";
  return "border";
}

function quarterScore(entries: GameLogEntry[]): string | null {
  const last = entries[entries.length - 1];
  if (!last) return null;
  return null;
}

export default function GameLog({ entries, isLive = false, onJumpToLatest, defaultFilter = "all" }: GameLogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeFilter, setActiveFilter] = useState<LogFilter>(defaultFilter);

  const sanitized = useMemo(() => sanitizeEntries(entries as unknown[]), [entries]);
  const counts = useMemo(() => computeFilterCounts(sanitized), [sanitized]);

  const filtered = useMemo(() => sanitized.filter((entry) => matchesFilter(entry, activeFilter)), [sanitized, activeFilter]);
  const grouped = useMemo(() => {
    return QUARTERS.flatMap((quarter) => {
      const quarterEntries = filtered.filter((entry) => entry.quarter === quarter);
      if (!quarterEntries.length) return [];
      return [{ kind: "header" as const, quarter, score: quarterScore(quarterEntries) }, ...quarterEntries.map((entry) => ({ kind: "entry" as const, entry }))];
    });
  }, [filtered]);

  const range = useVirtualList({
    itemCount: grouped.length,
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    scrollTop,
  });

  const visibleRows = grouped.slice(Math.max(0, range.startIndex), Math.max(range.endIndex + 1, 0));
  const contentHeight = grouped.length * ITEM_HEIGHT;

  const showJump = shouldShowJumpToLatest({
    isLive,
    scrollTop,
    scrollHeight: contentHeight,
    containerHeight: CONTAINER_HEIGHT,
  });

  const emptyLabel = activeFilter === "all" ? "plays" : `${activeFilter} plays`;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={activeFilter === f.key ? "default" : "outline"}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label} ({counts[f.key]})
            </Button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto rounded-md border"
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={(e) => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
      >
        {filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No {emptyLabel} yet.</div>
        ) : (
          <div style={{ height: contentHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${range.offsetY}px)` }}>
              {visibleRows.map((row, idx) => {
                if (row.kind === "header") {
                  return (
                    <div
                      key={`hdr-${String(row.quarter)}-${idx}`}
                      className="sticky top-0 z-10 h-[30px] bg-muted px-3 py-1 text-xs font-semibold border-b flex items-center justify-between"
                      style={{ height: HEADER_HEIGHT }}
                    >
                      <span>{quarterLabel(row.quarter)}</span>
                      {row.score ? <span className="text-muted-foreground">{row.score}</span> : null}
                    </div>
                  );
                }

                return (
                  <div key={row.entry.id} className={`h-[76px] p-2 text-sm ${rowClass(row.entry.type)}`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{quarterLabel(row.entry.quarter)}</Badge>
                      {row.entry.personnelPackage ? <Badge variant="secondary">{row.entry.personnelPackage}</Badge> : null}
                    </div>
                    <div className="truncate">{row.entry.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showJump ? (
          <Button
            className="absolute bottom-3 right-3"
            size="sm"
            onClick={() => {
              containerRef.current?.scrollTo({ top: contentHeight, behavior: "smooth" });
              onJumpToLatest?.();
            }}
          >
            ↓ Latest
          </Button>
        ) : null}
      </div>
    </div>
  );
}
