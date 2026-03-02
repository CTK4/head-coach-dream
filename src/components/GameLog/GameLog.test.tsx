import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GameLog, { computeFilterCounts, getVisibleQuarters, shouldShowJumpToLatest } from "@/components/GameLog/GameLog";
import { sanitizeEntries, type GameLogEntry } from "@/components/GameLog/types";
import { adaptDriveLog } from "@/components/GameLog/adaptDriveLog";
import { computeVirtualRange } from "@/hooks/useVirtualList";
import type { DriveLogEntry } from "@/engine/gameSim";

function makeEntries(count: number): GameLogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `e-${i}`,
    quarter: i < 50 ? 1 : i < 100 ? 2 : i < 150 ? 3 : 4,
    timestamp: 900 - i,
    type: i % 3 === 0 ? "run" : i % 3 === 1 ? "pass" : "penalty",
    description: `Play ${i}`,
  }));
}

describe("GameLog", () => {
  it("renders 200 entries without crash", () => {
    const html = renderToStaticMarkup(<GameLog entries={makeEntries(200)} isLive />);
    expect(html).toContain("All (200)");
  });

  it("sanitizeEntries drops malformed rows", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const clean = sanitizeEntries([
      { id: "1", quarter: 1, timestamp: 1, type: "run", description: "ok" },
      { id: "", quarter: 1, type: "run" },
      { id: "2", quarter: 6, type: "run" },
      { id: "3", quarter: 1, type: "weird" },
    ] as unknown[]);
    expect(clean).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  it("filter counts are accurate", () => {
    const counts = computeFilterCounts(makeEntries(9));
    expect(counts.all).toBe(9);
    expect(counts.run).toBe(3);
    expect(counts.pass).toBe(3);
    expect(counts.penalty).toBe(3);
  });

  it("quarter markers include only matching quarters", () => {
    const quarters = getVisibleQuarters([
      { id: "1", quarter: 1, timestamp: 1, type: "run", description: "a" },
      { id: "2", quarter: 3, timestamp: 2, type: "run", description: "b" },
    ]);
    expect(quarters).toEqual([1, 3]);
  });

  it("jump to latest button absent when not live", () => {
    const html = renderToStaticMarkup(<GameLog entries={makeEntries(20)} isLive={false} />);
    expect(html).not.toContain("↓ Latest");
  });

  it("jump to latest predicate false at bottom", () => {
    expect(shouldShowJumpToLatest({ isLive: true, scrollTop: 960, scrollHeight: 1000, containerHeight: 100 })).toBe(false);
  });

  it("adaptDriveLog handles empty/missing fields and play types", () => {
    const empty = adaptDriveLog([]);
    expect(empty).toEqual([]);

    const src: DriveLogEntry[] = [
      {
        drive: 1,
        play: 1,
        quarter: 1,
        clockSec: 600,
        possession: "HOME",
        down: 1,
        distance: 10,
        ballOn: 25,
        playType: "INSIDE_ZONE",
        result: "Run for 5 yds",
        resultTags: [],
        homeScore: 0,
        awayScore: 0,
      },
      {
        drive: 1,
        play: 2,
        quarter: 1,
        clockSec: 580,
        possession: "HOME",
        down: 2,
        distance: 5,
        ballOn: 30,
        playType: "DROPBACK",
        result: "Interception",
        resultTags: [],
        homeScore: 0,
        awayScore: 0,
      },
      {
        drive: 1,
        play: 3,
        quarter: 1,
        clockSec: 560,
        possession: "HOME",
        down: 1,
        distance: 10,
        ballOn: 20,
        playType: "FG",
        result: "FG is GOOD",
        resultTags: [],
        homeScore: 3,
        awayScore: 0,
      },
    ];
    const out = adaptDriveLog(src);
    expect(out).toHaveLength(3);
    expect(out[0].type).toBe("run");
    expect(out[1].type).toBe("turnover");
    expect(out[2].type).toBe("scoring");
  });

  it("virtual range handles 0, 1, and 200 items", () => {
    expect(computeVirtualRange({ itemCount: 0, itemHeight: 76, containerHeight: 360, scrollTop: 0 })).toEqual({ startIndex: 0, endIndex: -1, offsetY: 0 });
    expect(computeVirtualRange({ itemCount: 1, itemHeight: 76, containerHeight: 360, scrollTop: 0 }).endIndex).toBe(0);
    const range = computeVirtualRange({ itemCount: 200, itemHeight: 76, containerHeight: 360, scrollTop: 1200 });
    expect(range.startIndex).toBeGreaterThanOrEqual(0);
    expect(range.endIndex).toBeLessThan(200);
  });
});
