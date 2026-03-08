import { describe, expect, it } from "vitest";
import { hashSeed, mulberry32 } from "@/engine/rng";
import { gameReducer, migrateSave, type DraftState, type GameState } from "@/context/GameContext";

function initDraftState(): GameState {
  let state = migrateSave({}) as GameState;
  state = gameReducer(state, { type: "DRAFT_INIT" });
  return state;
}

function initNearClockIncomingOfferState(): GameState {
  let state = initDraftState();
  const nextSlot = state.draft.slots[state.draft.cursor + 1];
  state = { ...state, draft: { ...state.draft, userTeamId: nextSlot?.teamId ?? state.draft.userTeamId } };
  state = gameReducer(state, { type: "DRAFT_SHOP" });
  return state;
}

function deterministicCpuDelayMs(params: {
  minDelayMs: number;
  maxDelayMs: number;
  saveSeed: number;
  season: number;
  cursor: number;
  slotOverall?: number;
}): number {
  const minDelay = Math.min(params.minDelayMs, params.maxDelayMs);
  const maxDelay = Math.max(params.minDelayMs, params.maxDelayMs);
  const seed = hashSeed("DRAFT_CPU_DELAY", params.saveSeed, params.season, params.cursor, params.slotOverall ?? -1);
  const roll = mulberry32(seed)();
  return Math.floor(roll * (maxDelay - minDelay + 1)) + minDelay;
}

function deriveUserPickSections(draft: DraftState) {
  const currentSlot = draft.slots[draft.cursor];
  const myOwnedSlots = draft.slots.filter((slot) => slot.teamId === draft.userTeamId);
  const myFutureSlots = myOwnedSlots.filter((slot) => slot.overall >= (currentSlot?.overall ?? Number.MAX_SAFE_INTEGER));
  const selectionsByOverall = new Map(draft.selections.map((selection) => [selection.overall, selection]));
  const myCompletedPicks = myOwnedSlots
    .map((slot) => ({ slot, selection: selectionsByOverall.get(slot.overall) }))
    .filter((row) => !!row.selection) as Array<{ slot: (typeof myOwnedSlots)[number]; selection: NonNullable<(typeof draft.selections)[number]> }>;

  return { currentSlot, myOwnedSlots, myFutureSlots, myCompletedPicks };
}

describe("draft timing + trade offer regressions", () => {
  it("CPU delay helper remains deterministic for same save/season/cursor/slot context", () => {
    const tuple = {
      minDelayMs: 800,
      maxDelayMs: 1500,
      saveSeed: 12345,
      season: 2029,
      cursor: 17,
      slotOverall: 18,
    };

    const a = deterministicCpuDelayMs(tuple);
    const b = deterministicCpuDelayMs(tuple);
    const c = deterministicCpuDelayMs(tuple);

    expect(a).toBeGreaterThanOrEqual(tuple.minDelayMs);
    expect(a).toBeLessThanOrEqual(tuple.maxDelayMs);
    expect(a).toBe(b);
    expect(b).toBe(c);

    const movedCursor = deterministicCpuDelayMs({ ...tuple, cursor: tuple.cursor + 1, slotOverall: tuple.slotOverall + 1 });
    expect(movedCursor).not.toBe(a);
  });

  it("accepting an incoming draft trade updates slot ownership for give/receive assets", () => {
    let state = initNearClockIncomingOfferState();
    const offer = state.draft.tradeOffers.find((o) => o.source === "INCOMING");
    expect(offer).toBeTruthy();

    state = gameReducer(state, { type: "DRAFT_ACCEPT_TRADE", payload: { offerId: offer!.offerId } });

    for (const given of offer!.give) {
      const slot = state.draft.slots.find((s) => s.overall === given.overall);
      expect(slot?.teamId).toBe(offer!.fromTeamId);
    }
    for (const received of offer!.receive) {
      const slot = state.draft.slots.find((s) => s.overall === received.overall);
      expect(slot?.teamId).toBe(state.draft.userTeamId);
    }
  });

  it("declining an incoming draft trade leaves slot ownership unchanged", () => {
    let state = initNearClockIncomingOfferState();
    const offer = state.draft.tradeOffers.find((o) => o.source === "INCOMING");
    expect(offer).toBeTruthy();

    const beforeSlotOwners = new Map(state.draft.slots.map((slot) => [slot.overall, slot.teamId]));
    state = gameReducer(state, { type: "DRAFT_DECLINE_OFFER", payload: { offerId: offer!.offerId } });

    const afterSlotOwners = new Map(state.draft.slots.map((slot) => [slot.overall, slot.teamId]));
    expect(afterSlotOwners).toEqual(beforeSlotOwners);
    expect(state.draft.tradeOffers.some((o) => o.offerId === offer!.offerId)).toBe(false);
  });

  it("upcoming/completed user pick derivations stay consistent after accepted trade", () => {
    let state = initNearClockIncomingOfferState();
    const offer = state.draft.tradeOffers.find((o) => o.source === "INCOMING");
    expect(offer).toBeTruthy();

    state = gameReducer(state, { type: "DRAFT_ACCEPT_TRADE", payload: { offerId: offer!.offerId } });

    const sections = deriveUserPickSections(state.draft);

    expect(sections.myFutureSlots.every((slot) => slot.teamId === state.draft.userTeamId)).toBe(true);
    expect(sections.myFutureSlots.every((slot) => slot.overall >= (sections.currentSlot?.overall ?? Number.MAX_SAFE_INTEGER))).toBe(true);

    expect(sections.myCompletedPicks.every((row) => row.slot.teamId === state.draft.userTeamId)).toBe(true);
    expect(sections.myCompletedPicks.every((row) => row.selection.overall === row.slot.overall)).toBe(true);
    expect(sections.myCompletedPicks.every((row) => row.selection.teamId === state.draft.userTeamId)).toBe(true);

    const receivedOveralls = new Set(offer!.receive.map((slot) => slot.overall));
    const userOwnedReceived = state.draft.slots.filter((slot) => receivedOveralls.has(slot.overall) && slot.teamId === state.draft.userTeamId);
    expect(userOwnedReceived.length).toBeGreaterThan(0);
  });
});
