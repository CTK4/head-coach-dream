import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getContractById, getPersonnel, getPersonnelById, getPlayersByTeam, getTeamById, upsertContract } from "@/data/leagueDb";
import { computeTeamGameRatings } from "@/engine/game/teamRatings";
import { getEffectiveFreeAgents, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { getInjuryPlayersForTeam } from "@/pages/hub/InjuryReport";
import { loadSaveResult, syncCurrentSave } from "@/lib/saveManager";

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

type RestoreItem = {
  personId: string;
  teamId: string;
  status: string;
  contractId: string;
  contract?: Record<string, unknown>;
};

const restorePersonnel: RestoreItem[] = [];

function initStateForTeam(teamId: string): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: {
        teamId,
        years: 4,
        salary: 4_000_000,
        autonomy: 65,
        patience: 55,
        mediaNarrativeKey: "story_start",
        base: { years: 4, salary: 4_000_000, autonomy: 65 },
      },
      teamName: "Test Team",
    },
  });

  const teamName = getTeamById(teamId)?.name ?? "Test Team";
  return gameReducer(seeded, {
    type: "INIT_FREE_PLAY_CAREER",
    payload: { teamId, teamName },
  });
}

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: new LocalStorageMock(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  while (restorePersonnel.length > 0) {
    const item = restorePersonnel.pop()!;
    const person = getPersonnelById(item.personId) as any;
    if (person) {
      person.teamId = item.teamId;
      person.status = item.status;
      person.contractId = item.contractId;
    }
    if (item.contract) upsertContract(item.contract as any);
  }
});

describe("transactions QA closure", () => {
  it("trade accept updates effective roster, injury selectors, and team ratings", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const userTeamId = String(base.acceptedOffer?.teamId ?? "");
    const destinationTeamId = "ATLANTA_APEX";
    const tradePlayer = getEffectivePlayersByTeam(base, userTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase().startsWith("QB"))
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0];

    expect(tradePlayer).toBeTruthy();
    const before = computeTeamGameRatings(base, destinationTeamId);

    const next = gameReducer(base, {
      type: "TRADE_ACCEPT",
      payload: { playerId: String(tradePlayer.playerId), toTeamId: destinationTeamId, valueTier: "MID" },
    });

    const team2Ids = getEffectivePlayersByTeam(next, destinationTeamId).map((p: any) => String(p.playerId));
    expect(team2Ids).toContain(String(tradePlayer.playerId));

    const injuryTeam1Ids = getInjuryPlayersForTeam(next, userTeamId).map((p: any) => String(p.playerId));
    expect(injuryTeam1Ids).not.toContain(String(tradePlayer.playerId));

    const after = computeTeamGameRatings(next, destinationTeamId);
    expect(after.qbProcessing).not.toBe(before.qbProcessing);
  });

  it("cut apply sets free-agent override and affects effective selectors + ratings", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const cutCandidate = getEffectivePlayersByTeam(base, teamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase().startsWith("QB"))
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0];

    expect(cutCandidate).toBeTruthy();
    const before = computeTeamGameRatings(base, teamId);

    const next = gameReducer(base, { type: "CUT_APPLY", payload: { playerId: String(cutCandidate.playerId) } });

    expect(next.playerTeamOverrides[String(cutCandidate.playerId)]).toBe("FREE_AGENT");
    expect(getInjuryPlayersForTeam(next, teamId).map((p: any) => String(p.playerId))).not.toContain(String(cutCandidate.playerId));
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === String(cutCandidate.playerId))).toBe(true);

    const after = computeTeamGameRatings(next, teamId);
    expect(after.qbProcessing).toBeLessThanOrEqual(before.qbProcessing);
  });

  it("finalize cuts persists FA status across save/load", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const rosterIds = getEffectivePlayersByTeam(base, teamId).map((p: any) => String(p.playerId));
    const keepIds = rosterIds.slice(0, 53);
    const cutId = rosterIds.find((pid) => !keepIds.includes(pid)) ?? rosterIds[53] ?? rosterIds[0];
    expect(cutId).toBeTruthy();

    const prepped: GameState = {
      ...base,
      rosterMgmt: {
        active: Object.fromEntries(keepIds.map((pid) => [pid, true])),
        cuts: { [String(cutId)]: true },
        finalized: false,
      },
    };

    const finalized = gameReducer(prepped, { type: "FINALIZE_CUTS" });
    expect(finalized.playerTeamOverrides[String(cutId)]).toBe("FREE_AGENT");

    const saveReady = migrateSave({ ...finalized, phase: "REGULAR_SEASON", saveId: "qa-finalize-cuts" }) as GameState;
    syncCurrentSave(saveReady, "qa-finalize-cuts");
    const loaded = loadSaveResult("qa-finalize-cuts");
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw new Error("failed to load save");

    expect(loaded.state.playerTeamOverrides[String(cutId)]).toBe("FREE_AGENT");
    expect(getEffectiveFreeAgents(loaded.state).some((p: any) => String(p.playerId) === String(cutId))).toBe(true);
  });

  it("advancing season expires base player contracts into free agency", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const candidate = getPlayersByTeam(teamId).find((p: any) => !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();

    const contract = getContractById(String((candidate as any).contractId ?? "")) as any;
    contract.endSeason = base.season;
    contract.isExpired = false;
    upsertContract(contract);

    const next = gameReducer(base, { type: "ADVANCE_SEASON" });
    expect(next.playerTeamOverrides[String((candidate as any).playerId)]).toBe("FREE_AGENT");
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === String((candidate as any).playerId))).toBe(true);
  });

  it("advancing season expires staff contracts and unassigns them", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const staffer = getPersonnel().find((p: any) => !!p.contractId);
    expect(staffer).toBeTruthy();
    const personId = String((staffer as any).personId);

    const person = getPersonnelById(personId) as any;
    const contract = getContractById(String(person.contractId ?? "")) as any;
    restorePersonnel.push({
      personId,
      teamId: String(person.teamId ?? ""),
      status: String(person.status ?? "ACTIVE"),
      contractId: String(person.contractId ?? ""),
      contract: { ...contract },
    });

    person.teamId = teamId;
    person.status = "ACTIVE";
    contract.endSeason = base.season;
    contract.isExpired = false;
    upsertContract(contract);

    const prepped: GameState = {
      ...base,
      staff: { ...base.staff, ocId: personId },
      staffBudget: {
        ...base.staffBudget,
        byPersonId: { ...base.staffBudget.byPersonId, [personId]: 700_000 },
        used: (base.staffBudget.used ?? 0) + 700_000,
      },
    };

    const next = gameReducer(prepped, { type: "ADVANCE_SEASON" });

    expect(next.staff.ocId).toBeUndefined();
    expect(next.staffBudget.byPersonId[personId]).toBeUndefined();
    expect(getPersonnelById(personId)?.teamId).toBe("FREE_AGENT");
    const remainingYears = Math.max(0, Number(contract.endSeason ?? 0) - next.season + 1);
    expect(remainingYears).toBe(0);
  });
});
