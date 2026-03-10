import { expectedSalary } from "@/engine/staffSalary";
import { getPerkHiringModifier } from "@/engine/perkWiring";
import { isOfferAccepted } from "@/engine/coachAcceptance";
import { getPersonnelById } from "@/data/leagueDb";
import type { AssistantStaff, GameAction, GameState } from "@/context/GameContext";

type StaffingReducerDeps = {
  addMemoryEvent: (state: GameState, type: string, payload: Record<string, unknown>) => GameState["memoryLog"];
  gameReducer: (state: GameState, action: GameAction) => GameState;
};

export function isStaffingAction(action: GameAction): boolean {
  return action.type === "STAFF_COUNTER_OFFER" || action.type === "STAFF_COUNTER_OFFER_RESPONSE";
}

export function staffingReducer(state: GameState, action: GameAction, deps: StaffingReducerDeps): GameState | null {
  switch (action.type) {
    case "STAFF_COUNTER_OFFER": {
      const offer = state.staffOffers.find((x) => x.id === action.payload.offerId);
      if (!offer || offer.status !== "COUNTERED") return state;
      if ((offer.revisionCount ?? 0) >= 1) return { ...state, uiToast: "You can only revise a counter-offer once." };

      const revisedYears = Math.max(1, Math.min(5, Math.round(Number(action.payload.years) || 1)));
      const revisedSalary = Math.max(0, Math.round(Number(action.payload.salary) || 0));
      if (!revisedSalary) return { ...state, uiToast: "Offer salary must be greater than $0." };

      const staffBudgetRemaining = state.staffBudget.total - state.staffBudget.used;
      if (revisedSalary > staffBudgetRemaining) {
        return { ...state, uiToast: `Exceeds coaching budget ($${(staffBudgetRemaining / 1_000_000).toFixed(1)}M remaining).` };
      }

      const person = getPersonnelById(offer.personId);
      if (!person) return state;

      const personRep = Number((person as any)?.reputation ?? 55);
      const expSalary = expectedSalary(offer.role as any, personRep);
      const perkMod = getPerkHiringModifier(state.coach, offer.roleType === "COORDINATOR" ? "COORD" : "ASST");
      const userTeamId = String(state.acceptedOffer?.teamId ?? state.teamId ?? "");
      const revisedAccepted = isOfferAccepted({
        season: state.season,
        teamId: userTeamId,
        personId: offer.personId,
        roleKey: String(offer.role),
        reputation: personRep,
        expectedSalary: expSalary,
        offeredSalary: revisedSalary,
        isCoordinator: offer.roleType === "COORDINATOR",
        hiringModifier: perkMod,
      });

      if (!revisedAccepted) {
        const rejected = state.staffOffers.map((x) =>
          x.id === offer.id
            ? { ...x, status: "REJECTED" as const, years: revisedYears, salary: revisedSalary, revisionCount: (x.revisionCount ?? 0) + 1, counterProposal: null, reason: "Revised offer rejected." }
            : x,
        );
        return {
          ...state,
          staffOffers: rejected,
          uiToast: `${String((person as any).fullName ?? "Candidate")} rejected your revised offer.`,
          memoryLog: deps.addMemoryEvent(state, "STAFF_OFFER_REJECTED", { personId: offer.personId, role: offer.role, years: revisedYears, salary: revisedSalary, reason: "Revised offer rejected." }),
        };
      }

      const acceptedState: GameState = {
        ...state,
        staffOffers: state.staffOffers.map((x) =>
          x.id === offer.id
            ? { ...x, status: "ACCEPTED" as const, years: revisedYears, salary: revisedSalary, revisionCount: (x.revisionCount ?? 0) + 1, counterProposal: null, reason: "Revised offer accepted." }
            : x,
        ),
      };

      const next =
        offer.roleType === "COORDINATOR"
          ? deps.gameReducer(acceptedState, {
              type: "HIRE_STAFF",
              payload: { role: offer.role as "OC" | "DC" | "STC", personId: offer.personId, salary: revisedSalary },
            })
          : deps.gameReducer(acceptedState, {
              type: "HIRE_ASSISTANT",
              payload: { role: offer.role as keyof AssistantStaff, personId: offer.personId, salary: revisedSalary },
            });

      return {
        ...next,
        uiToast: `${String((person as any).fullName ?? "Candidate")} accepted your revised offer.`,
        memoryLog: deps.addMemoryEvent(next, "STAFF_OFFER_ACCEPTED", { personId: offer.personId, role: offer.role, years: revisedYears, salary: revisedSalary, revisedFromCounter: true }),
      };
    }
    case "STAFF_COUNTER_OFFER_RESPONSE": {
      const offer = state.staffOffers.find((x) => x.id === action.payload.offerId);
      if (!offer || offer.status !== "COUNTERED") return state;
      const person = getPersonnelById(offer.personId);
      if (!person) return state;

      if (!action.payload.accepted) {
        return {
          ...state,
          staffOffers: state.staffOffers.map((x) =>
            x.id === offer.id ? { ...x, status: "REJECTED" as const, counterProposal: null, reason: "Counter-offer rejected by team." } : x,
          ),
          uiToast: "Counter-offer rejected.",
          memoryLog: deps.addMemoryEvent(state, "STAFF_OFFER_REJECTED", { personId: offer.personId, role: offer.role, years: offer.years, salary: offer.salary, reason: "Counter-offer rejected by team." }),
        };
      }

      const proposal = offer.counterProposal;
      if (!proposal) return state;

      const staffBudgetRemaining = state.staffBudget.total - state.staffBudget.used;
      if (proposal.salary > staffBudgetRemaining) {
        return { ...state, uiToast: `Counter exceeds coaching budget ($${(staffBudgetRemaining / 1_000_000).toFixed(1)}M remaining).` };
      }

      const acceptedState: GameState = {
        ...state,
        staffOffers: state.staffOffers.map((x) =>
          x.id === offer.id
            ? { ...x, status: "ACCEPTED" as const, years: proposal.years, salary: proposal.salary, counterProposal: null, reason: "Counter-offer accepted." }
            : x,
        ),
      };

      const next =
        offer.roleType === "COORDINATOR"
          ? deps.gameReducer(acceptedState, {
              type: "HIRE_STAFF",
              payload: { role: offer.role as "OC" | "DC" | "STC", personId: offer.personId, salary: proposal.salary },
            })
          : deps.gameReducer(acceptedState, {
              type: "HIRE_ASSISTANT",
              payload: { role: offer.role as keyof AssistantStaff, personId: offer.personId, salary: proposal.salary },
            });

      return {
        ...next,
        uiToast: `${String((person as any).fullName ?? "Candidate")} accepted after counter negotiation.`,
        memoryLog: deps.addMemoryEvent(next, "STAFF_OFFER_ACCEPTED", { personId: offer.personId, role: offer.role, years: proposal.years, salary: proposal.salary, acceptedCounter: true }),
      };
    }
    default:
      return null;
  }
}
