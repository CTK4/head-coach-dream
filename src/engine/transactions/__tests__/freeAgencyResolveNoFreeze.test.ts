import { describe, expect, it } from "vitest";
import { resolveFreeAgencyWeek } from "@/engine/transactions/faResolve";

describe("fa resolver", () => {
  it("completes in chunks", async () => {
    const state: any = {
      season: 2025,
      week: 2,
      freeAgency: {
        offersByPlayerId: {
          a: Array.from({ length: 75 }, (_, i) => ({ id: i })),
        },
        isResolving: true,
      },
    };
    const next = await resolveFreeAgencyWeek(state, { chunkSize: 10 });
    expect(next.freeAgency.isResolving).toBe(false);
    expect(next.freeAgency.progress.done).toBe(75);
  });
});
