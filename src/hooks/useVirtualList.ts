import { useMemo } from "react";

export type VirtualListRange = { startIndex: number; endIndex: number; offsetY: number };

type Args = {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  scrollTop: number;
  overscan?: number;
};

export function computeVirtualRange(args: Args): VirtualListRange {
  const { itemCount, itemHeight, containerHeight, scrollTop, overscan = 4 } = args;
  if (itemCount <= 0) return { startIndex: 0, endIndex: -1, offsetY: 0 };

  const safeHeight = Math.max(1, Math.floor(itemHeight));
  const safeContainerHeight = Math.max(0, Math.floor(containerHeight));
  const maxIndex = itemCount - 1;

  const firstVisible = Math.floor(Math.max(0, scrollTop) / safeHeight);
  const visibleCount = Math.ceil(safeContainerHeight / safeHeight);

  const startIndex = Math.max(0, firstVisible - overscan);
  const endIndex = Math.min(maxIndex, firstVisible + visibleCount + overscan);

  return { startIndex, endIndex, offsetY: startIndex * safeHeight };
}

/**
 * Fixed-row virtualization.
 * NOTE: This assumes every rendered row has the same height (`itemHeight`).
 * If row heights become variable, this range calculation will drift and should be replaced.
 */
export function useVirtualList(args: Args): VirtualListRange {
  return useMemo(
    () => computeVirtualRange(args),
    [args.itemCount, args.itemHeight, args.containerHeight, args.scrollTop, args.overscan]
  );
}
