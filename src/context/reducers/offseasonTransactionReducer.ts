import { getContractById, getPlayerById, getPlayerContract, getPlayers } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { Tx } from "@/engine/transactions/transactionAPI";
import { getRestructureEligibility } from "@/engine/contractMath";
import type { GameAction, GameState, PlayerContractOverride } from "@/context/GameContext";

type ResignOffer = {
  years: number;
  apy: number;
  guaranteesPct: number;
  discountPct: number;
  createdFrom?: "AUDIT" | "RESIGN_SCREEN";
  rejectedCount?: number;
};

type Obj = Record<string, unknown>;

type OffseasonTransactionReducerDeps = {
  gameReducer: (state: GameState, action: GameAction) => GameState;
  applyCanonicalTx: (state: GameState, txState: unknown) => GameState;
  applyFinances: (state: GameState, patch?: Record<string, unknown>) => GameState;
  pushNews: (state: GameState, line: string) => GameState;
  buildCpuTeamContext: (state: GameState, teamId: string) => unknown;
  cpuResignPlayers: (teamCtx: unknown, expiring: Array<{ playerId: string; pos: string; age: number; overall: number; devTrait: string }>) => Array<{ playerId: string; years: number; offerApy: number }>;
  getAllTeamIds: () => string[];
  contractOverrideFromOffer: (state: GameState, offer: ResignOffer) => PlayerContractOverride;
  hasPendingFreeAgencyOffers: (state: GameState) => boolean;
  expireRemainingFreeAgencyOffers: (state: GameState, reason: string) => GameState;
  buildResignOffer: (state: GameState, playerId: string, createdFrom: "AUDIT" | "RESIGN_SCREEN") => ResignOffer | null;
  sanitizeResignOffer: (offer: ResignOffer) => ResignOffer | null;
  resolveDeterministicResignSubmission: (state: GameState, playerId: string, offer: ResignOffer) => GameState;
  isNewsworthyRecommit: (player: unknown) => boolean;
  applyFranchiseTag: (state: GameState, playerId: string, tagType: "FRANCHISE_NON_EX" | "TRANSITION") => GameState;
  moneyRound: (n: number) => number;
  expireExpiringContractsToFreeAgency: (state: GameState, nextSeason: number) => GameState;
};

const HANDLED_ACTIONS = new Set<GameAction["type"]>([
  "OFFSEASON_COMPLETE_STEP",
  "RESIGN_SET_DECISION",
  "RESIGN_DRAFT_FROM_AUDIT",
  "RESIGN_MAKE_OFFER",
  "RESIGN_SUBMIT_OFFER",
  "RESIGN_REJECT_OFFER",
  "RESIGN_ACCEPT_OFFER",
  "RESIGN_CLEAR_DECISION",
  "ROSTERAUDIT_SET_CUT_DESIGNATION",
  "EXPIRE_EXPIRING_CONTRACTS_TO_FA",
  "TAG_REMOVE",
  "APPLY_FRANCHISE_TAG",
  "TAG_APPLY",
  "CONTRACT_RESTRUCTURE_APPLY",
]);

export function isOffseasonTransactionAction(action: GameAction): boolean {
  return HANDLED_ACTIONS.has(action.type);
}

export function offseasonTransactionReducer(state: GameState, action: GameAction, deps: OffseasonTransactionReducerDeps): GameState | null {
  switch (action.type) {
    case "OFFSEASON_COMPLETE_STEP": {
      const stepsComplete = { ...state.offseason.stepsComplete, [action.payload.stepId]: true };
      let next = { ...state, offseason: { ...state.offseason, stepsComplete } };
      if (action.payload.stepId === "RESIGNING") {
        const userTeamId = String(state.acceptedOffer?.teamId ?? "");
        for (const teamId of deps.getAllTeamIds().filter((id) => id !== userTeamId)) {
          const teamCtx = deps.buildCpuTeamContext(next, teamId);
          const expiring = getEffectivePlayersByTeam(next, teamId)
            .filter((p: unknown) => {
              const row = p as Obj;
              const playerId = String(row.playerId ?? "");
              const override = next.playerContractOverrides[playerId];
              const contractId = row.contractId ?? getPlayerById(playerId)?.contractId;
              const db = contractId ? getContractById(String(contractId)) : getPlayerContract(playerId);
              const endSeason = Number(override?.endSeason ?? db?.endSeason ?? -1);
              return endSeason === next.season;
            })
            .map((p: unknown) => {
              const row = p as Obj;
              const dev = row.development as Obj | undefined;
              return {
                playerId: String(row.playerId ?? ""),
                pos: String(row.pos ?? "UNK"),
                age: Number(row.age ?? 26),
                overall: Number(row.overall ?? row.ovr ?? 60),
                devTrait: String(dev?.trait ?? "normal"),
              };
            });
          const offers = deps.cpuResignPlayers(teamCtx, expiring);
          for (const offer of offers) {
            const ovr = deps.contractOverrideFromOffer(next, { years: offer.years, apy: offer.offerApy, guaranteesPct: 0, discountPct: 0 });
            next = deps.applyCanonicalTx(next, Tx.resign(teamId, String(offer.playerId), ovr));
          }
        }
      }
      if (action.payload.stepId === "FREE_AGENCY") {
        while (next.freeAgency.resolvesUsedThisPhase < next.freeAgency.maxResolvesPerPhase && deps.hasPendingFreeAgencyOffers(next)) {
          const resolved = deps.gameReducer(next, { type: "FA_RESOLVE" });
          if (resolved === next) break;
          next = resolved;
        }
        next = deps.expireRemainingFreeAgencyOffers(next, "Expired: offseason free agency step completed");
      }
      return next;
    }
    case "RESIGN_SET_DECISION":
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          resigning: { decisions: { ...state.offseasonData.resigning.decisions, [action.payload.playerId]: action.payload.decision } },
        },
      };
    case "RESIGN_DRAFT_FROM_AUDIT": {
      const { playerId } = action.payload;
      const offer = deps.buildResignOffer(state, String(playerId), "AUDIT");
      if (!offer) return state;
      const decisions = { ...state.offseasonData.resigning.decisions } as Record<string, unknown>;
      decisions[String(playerId)] = { action: "RESIGN", offer };
      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } };
    }
    case "RESIGN_MAKE_OFFER": {
      const { playerId, createdFrom } = action.payload;
      const offer = deps.buildResignOffer(state, String(playerId), createdFrom);
      if (!offer) return state;
      const decisions = { ...state.offseasonData.resigning.decisions } as Record<string, unknown>;
      decisions[String(playerId)] = { action: "RESIGN", offer };
      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } };
    }
    case "RESIGN_SUBMIT_OFFER": {
      return deps.resolveDeterministicResignSubmission(state, action.payload.playerId, action.payload.offer);
    }
    case "RESIGN_REJECT_OFFER": {
      const { playerId } = action.payload;
      const cur = state.offseasonData.resigning.decisions?.[String(playerId)];
      if (!cur?.offer) return state;
      const decisions = { ...state.offseasonData.resigning.decisions };
      delete decisions[String(playerId)];
      return deps.pushNews({ ...state, offseasonData: { ...state.offseasonData, resigning: { decisions } } }, "Offer declined. Active proposal cleared.");
    }
    case "RESIGN_ACCEPT_OFFER": {
      const { playerId } = action.payload;
      const cur = state.offseasonData.resigning.decisions?.[String(playerId)] as { offer?: ResignOffer } | undefined;
      if (!cur?.offer) return state;
      const offer = deps.sanitizeResignOffer(cur.offer as ResignOffer);
      if (!offer) return state;
      const ovr = deps.contractOverrideFromOffer(state, offer);
      const decisions = { ...state.offseasonData.resigning.decisions } as Record<string, unknown>;
      delete decisions[String(playerId)];

      const morale = { ...(state.playerMorale ?? {}) };
      const curMorale = Number(morale[String(playerId)] ?? 60);
      morale[String(playerId)] = Math.max(0, Math.min(100, curMorale + 5));

      let next = deps.applyCanonicalTx(state, Tx.resign(String(state.acceptedOffer?.teamId ?? ""), String(playerId), ovr));
      next = deps.applyFinances({ ...next, playerMorale: morale, offseasonData: { ...next.offseasonData, resigning: { decisions } } });

      const p = getPlayers().find((x) => String((x as Obj).playerId ?? "") === String(playerId)) as Obj | undefined;
      if (deps.isNewsworthyRecommit(p)) {
        next = deps.pushNews(next, `Star re-commits early: ${String(p?.fullName ?? "Player")} agrees to an extension.`);
      }

      return next;
    }
    case "RESIGN_CLEAR_DECISION": {
      const next = { ...state.offseasonData.resigning.decisions };
      delete next[action.payload.playerId];
      return { ...state, offseasonData: { ...state.offseasonData, resigning: { decisions: next } } };
    }
    case "ROSTERAUDIT_SET_CUT_DESIGNATION": {
      const { playerId, designation } = action.payload;
      const cutDesignations = { ...state.offseasonData.rosterAudit.cutDesignations };
      if (designation === "NONE") delete cutDesignations[playerId];
      else cutDesignations[playerId] = designation;
      return {
        ...state,
        offseasonData: {
          ...state.offseasonData,
          rosterAudit: { cutDesignations },
        },
      };
    }
    case "EXPIRE_EXPIRING_CONTRACTS_TO_FA": {
      return deps.expireExpiringContractsToFreeAgency(state, Number(action.payload.nextSeason));
    }
    case "TAG_REMOVE": {
      const applied = state.offseasonData.tagCenter.applied;
      if (!applied) return state;
      const next = deps.applyCanonicalTx(state, Tx.franchiseTagRemove(String(applied.teamId ?? state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? ""), applied.playerId, applied.priorContract));
      const franchiseTags = { ...next.franchiseTags };
      delete franchiseTags[applied.playerId];
      return deps.applyFinances({ ...next, offseasonData: { ...next.offseasonData, tagCenter: { applied: undefined } }, franchiseTags });
    }
    case "APPLY_FRANCHISE_TAG":
    case "TAG_APPLY": {
      const playerId = action.payload.playerId;
      try {
        const tagType = action.type === "TAG_APPLY" ? action.payload.type : "FRANCHISE_NON_EX";
        return deps.applyFranchiseTag(state, playerId, tagType);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "TAG_FAILED";
        return deps.pushNews(state, `Franchise tag failed: ${reason}.`);
      }
    }
    case "CONTRACT_RESTRUCTURE_APPLY": {
      const teamId = state.acceptedOffer?.teamId;
      if (!teamId) return state;
      const { playerId } = action.payload;
      const gate = getRestructureEligibility(state, playerId);
      if (!gate.eligible) return deps.pushNews(state, `Restructure blocked: ${gate.reasons[0]}`);

      const amount = deps.moneyRound(Math.max(0, action.payload.amount));
      const o = state.playerContractOverrides[playerId];
      if (!o) return state;

      const idx = Math.max(0, Math.min(o.salaries.length - 1, state.season - o.startSeason));
      const curSalary = Number(o.salaries[idx] ?? 0);
      const x = deps.moneyRound(Math.min(amount, curSalary));
      if (x <= 0) return state;

      const yearsRemaining = Math.max(1, o.endSeason - state.season + 1);
      const addedProration = deps.moneyRound(x / yearsRemaining);
      const nextO: PlayerContractOverride = {
        ...o,
        salaries: o.salaries.map((s, i) => (i === idx ? deps.moneyRound(Number(s ?? 0) - x) : deps.moneyRound(Number(s ?? 0)))),
        signingBonus: deps.moneyRound(Number(o.signingBonus ?? 0) + x),
        prorationBySeason: { ...(o.prorationBySeason ?? {}) },
      };

      for (let y = state.season; y <= o.endSeason; y++) {
        nextO.prorationBySeason![y] = deps.moneyRound((nextO.prorationBySeason![y] ?? 0) + addedProration);
      }

      const next = deps.applyFinances({ ...state, playerContractOverrides: { ...state.playerContractOverrides, [playerId]: nextO } });
      return deps.pushNews(next, `Restructure applied: ${Math.round(x / 1_000_000)}M converted to bonus.`);
    }
    default:
      return null;
  }
}
