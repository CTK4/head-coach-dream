import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith, type GameState } from "@/context/GameContext";
import { getAssistantHeadCoachCandidates, getCoordinatorFreeAgents } from "@/data/leagueDb";

function makeCoordinatorCounterState(role: "OC" | "DC" | "STC" = "OC") {
  const base = createInitialStateForTests();
  const candidate = getCoordinatorFreeAgents(role)[0];
  expect(candidate).toBeTruthy();

  const next = gameReducerMonolith(base, {
    type: "CREATE_STAFF_OFFER",
    payload: {
      roleType: "COORDINATOR",
      role,
      personId: String(candidate.personId),
      years: 3,
      salary: 1,
    },
  });

  expect(next.staffOffers[0]?.status).toBe("COUNTERED");
  expect(next.staffOffers[0]?.counterProposal).toBeTruthy();
  return { base, next, candidateId: String(candidate.personId), offerId: String(next.staffOffers[0].id) };
}

function makeAssistantCounterState(role: "assistantHcId" = "assistantHcId") {
  const base = createInitialStateForTests();
  const candidate = getAssistantHeadCoachCandidates()[0];
  expect(candidate).toBeTruthy();

  const next = gameReducerMonolith(base, {
    type: "CREATE_STAFF_OFFER",
    payload: {
      roleType: "ASSISTANT",
      role,
      personId: String(candidate.personId),
      years: 2,
      salary: 1,
    },
  });

  expect(next.staffOffers[0]?.status).toBe("COUNTERED");
  expect(next.staffOffers[0]?.counterProposal).toBeTruthy();
  return { base, next, candidateId: String(candidate.personId), offerId: String(next.staffOffers[0].id) };
}

describe("staff counter-offer regression coverage", () => {
  it("coordinator offer can enter COUNTERED negotiation state", () => {
    const { next } = makeCoordinatorCounterState("OC");
    expect(next.staffOffers[0].roleType).toBe("COORDINATOR");
    expect(next.staffOffers[0].reason).toContain("counter-offer");
  });

  it("coordinator counter can be accepted or rejected interactively", () => {
    const acceptPath = makeCoordinatorCounterState("OC");
    const accepted = gameReducerMonolith(acceptPath.next, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: acceptPath.offerId, accepted: true },
    });

    expect(accepted.staffOffers[0].status).toBe("ACCEPTED");
    expect(accepted.staff.ocId).toBe(acceptPath.candidateId);

    const rejectPath = makeCoordinatorCounterState("DC");
    const rejected = gameReducerMonolith(rejectPath.next, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: rejectPath.offerId, accepted: false },
    });

    expect(rejected.staffOffers[0].status).toBe("REJECTED");
    expect(rejected.staff.dcId).not.toBe(rejectPath.candidateId);
  });

  it("assistant counter-offer flow supports COUNTERED then accept/reject outcomes", () => {
    const acceptPath = makeAssistantCounterState("assistantHcId");
    const accepted = gameReducerMonolith(acceptPath.next, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: acceptPath.offerId, accepted: true },
    });

    expect(accepted.staffOffers[0].status).toBe("ACCEPTED");
    expect(accepted.assistantStaff.assistantHcId).toBe(acceptPath.candidateId);

    const rejectPath = makeAssistantCounterState("assistantHcId");
    const rejected = gameReducerMonolith(rejectPath.next, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: rejectPath.offerId, accepted: false },
    });

    expect(rejected.staffOffers[0].status).toBe("REJECTED");
    expect(rejected.assistantStaff.assistantHcId).not.toBe(rejectPath.candidateId);
  });

  it("budget and filled-role constraints block invalid counter-resolution hires", () => {
    const budgetCase = makeCoordinatorCounterState("OC");
    const budgetBlockedState: GameState = {
      ...budgetCase.next,
      staffBudget: { ...budgetCase.next.staffBudget, used: budgetCase.next.staffBudget.total - 1_000 },
    };
    const budgetBlocked = gameReducerMonolith(budgetBlockedState, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: budgetCase.offerId, accepted: true },
    });

    expect(budgetBlocked.staffOffers[0].status).toBe("COUNTERED");
    expect(budgetBlocked.staff.ocId).not.toBe(budgetCase.candidateId);

    const roleCase = makeAssistantCounterState("assistantHcId");
    const existing = getAssistantHeadCoachCandidates()[1];
    expect(existing).toBeTruthy();
    const roleFilledState: GameState = {
      ...roleCase.next,
      assistantStaff: { ...roleCase.next.assistantStaff, assistantHcId: String(existing.personId) },
    };
    const roleBlocked = gameReducerMonolith(roleFilledState, {
      type: "STAFF_COUNTER_OFFER_RESPONSE",
      payload: { offerId: roleCase.offerId, accepted: true },
    });

    expect(roleBlocked.assistantStaff.assistantHcId).toBe(String(existing.personId));
    expect(roleBlocked.assistantStaff.assistantHcId).not.toBe(roleCase.candidateId);
  });
});
