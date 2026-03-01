import type { GameState } from "@/context/GameContext";

type ResolveOptions = {
  chunkSize?: number;
  onProgress?: (done: number, total: number) => void;
};

export async function resolveFreeAgencyWeek(state: GameState, opts: ResolveOptions = {}): Promise<GameState> {
  const chunkSize = Math.max(1, Number(opts.chunkSize ?? 50));
  const offers = Object.values(state.freeAgency.offersByPlayerId ?? {}).flat();
  let done = 0;
  const total = offers.length;

  for (let i = 0; i < offers.length; i++) {
    done += 1;
    if (done % chunkSize === 0) {
      opts.onProgress?.(done, total);
      await Promise.resolve();
    }
  }

  return {
    ...state,
    freeAgency: {
      ...state.freeAgency,
      isResolving: false,
      progress: { done: total, total },
      lastResolveWeekKey: `${state.season}-W${state.week}`,
    } as any,
  };
}
