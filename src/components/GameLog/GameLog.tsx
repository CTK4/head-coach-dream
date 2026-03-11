import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeEntries, type GameLogEntry, type GameLogProps, type LogFilter } from "@/components/GameLog/types";

const ITEM_HEIGHT = 76;
const HEADER_HEIGHT = 30;
const CONTAINER_HEIGHT = 360;
const SCROLLED_UP_THRESHOLD_PX = 50;
const OVERSCAN_PX = ITEM_HEIGHT * 3;

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

type GroupedRow =
  | { kind: "header"; quarter: GameLogEntry["quarter"] }
  | { kind: "entry"; entry: GameLogEntry };

type RowMeta = { offsetY: number; height: number };

export default function GameLog({ entries, isLive = false, onJumpToLatest, defaultFilter = "all" }: GameLogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeFilter, setActiveFilter] = useState<LogFilter>(defaultFilter);

  const sanitized = useMemo(() => sanitizeEntries(entries as unknown[]), [entries]);
  const counts = useMemo(() => computeFilterCounts(sanitized), [sanitized]);

  const filtered = useMemo(() => sanitized.filter((entry) => matchesFilter(entry, activeFilter)), [sanitized, activeFilter]);

  const grouped = useMemo<GroupedRow[]>(() => {
    return QUARTERS.flatMap((quarter) => {
      const quarterEntries = filtered.filter((entry) => entry.quarter === quarter);
      if (!quarterEntries.length) return [];
      return [
        { kind: "header" as const, quarter },
        ...quarterEntries.map((entry) => ({ kind: "entry" as const, entry })),
      ];
    });
  }, [filtered]);

  // Compute per-row absolute offsets based on actual row heights (headers ≠ entries)
  const rowMeta = useMemo<RowMeta[]>(() => {
    let y = 0;
    return grouped.map((row) => {
      const h = row.kind === "header" ? HEADER_HEIGHT : ITEM_HEIGHT;
      const meta: RowMeta = { offsetY: y, height: h };
      y += h;
      return meta;
    });
  }, [grouped]);

  const contentHeight = rowMeta.length > 0
    ? rowMeta[rowMeta.length - 1].offsetY + rowMeta[rowMeta.length - 1].height
    : 0;

  // Visibility window with overscan — no uniform-height assumption needed
  const visibleRows = useMemo(() => {
    const top = scrollTop - OVERSCAN_PX;
    const bottom = scrollTop + CONTAINER_HEIGHT + OVERSCAN_PX;
    return grouped
      .map((row, i) => ({ row, ...rowMeta[i] }))
      .filter(({ offsetY, height }) => offsetY + height > top && offsetY < bottom);
  }, [grouped, rowMeta, scrollTop]);

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
            {visibleRows.map(({ row, offsetY, height }) => {
              if (row.kind === "header") {
                return (
                  <div
                    key={`hdr-${String(row.quarter)}`}
                    className="z-10 bg-muted px-3 py-1 text-xs font-semibold border-b flex items-center"
                    style={{ position: "absolute", top: offsetY, height, width: "100%" }}
                  >
                    <span>{quarterLabel(row.quarter)}</span>
                  </div>
                );
              }

              return (
                <div
                  key={row.entry.id}
                  className={`p-2 text-sm ${rowClass(row.entry.type)}`}
                  style={{ position: "absolute", top: offsetY, height, width: "100%", boxSizing: "border-box" }}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{quarterLabel(row.entry.quarter)}</Badge>
                    {row.entry.personnelPackage ? <Badge variant="secondary">{row.entry.personnelPackage}</Badge> : null}
                  </div>
                  <div className="truncate">{row.entry.description}</div>
                </div>
              );
            })}
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
