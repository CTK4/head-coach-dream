import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith } from "@/context/GameContext";
import {
  clearPersonnelTeam,
  getPersonnelById,
  getPersonnelContract,
  getPersonnelFreeAgents,
  replayPersonnelOverrides,
  setPersonnelTeamAndContract,
} from "@/data/leagueDb";

const USER_TEAM_ID = "MILWAUKEE_NORTHSHORE";

describe("personnel overlay replay", () => {
  it("stores personnel + contract overlays when hiring staff", () => {
    let state = { ...createInitialStateForTests(), userTeamId: USER_TEAM_ID, teamId: USER_TEAM_ID };
    const candidate = getPersonnelFreeAgents().find((p) => String(p.role ?? "").toUpperCase() === "OFF_COORDINATOR");
    const candidateId = String(candidate?.personId ?? "");
    if (!candidateId) return;

    state = gameReducerMonolith(state, {
      type: "HIRE_STAFF",
      payload: { role: "OC", personId: candidateId, salary: 2_000_000 },
    });

    const overlay = state.personnelTeamOverrides[candidateId];
    expect(overlay).toBeTruthy();
    expect(overlay?.teamId).toBe(USER_TEAM_ID);
    expect(overlay?.status).toBe("ACTIVE");

    const savedContract = state.staffContractsByPersonId[candidateId];
    expect(savedContract).toBeTruthy();
    expect(savedContract?.contractId).toBe(overlay?.contractId);
  });

  it("replays hired personnel overlays into module DB getters", () => {
    let state = { ...createInitialStateForTests(), userTeamId: USER_TEAM_ID, teamId: USER_TEAM_ID };
    const candidate = getPersonnelFreeAgents().find((p) => String(p.role ?? "").toUpperCase() === "DEF_COORDINATOR");
    const candidateId = String(candidate?.personId ?? "");
    if (!candidateId) return;

    state = gameReducerMonolith(state, {
      type: "HIRE_STAFF",
      payload: { role: "DC", personId: candidateId, salary: 3_000_000 },
    });

    // Simulate stale module DB state before replay.
    clearPersonnelTeam(candidateId);

    replayPersonnelOverrides(state.personnelTeamOverrides, state.staffContractsByPersonId);

    const person = getPersonnelById(candidateId);
    expect(person?.teamId).not.toBe("FREE_AGENT");

    const inFreeAgency = getPersonnelFreeAgents().some((p) => String(p.personId) === candidateId);
    expect(inFreeAgency).toBe(false);

    const contract = getPersonnelContract(candidateId);
    const savedContract = state.staffContractsByPersonId[candidateId];
    expect(contract?.salaryY1).toBe(savedContract?.salaryY1);
    expect(contract?.endSeason).toBe(savedContract?.endSeason);
  });

  it("stores FREE_AGENT personnel override on fire and replay keeps them in FA", () => {
    let state = { ...createInitialStateForTests(), userTeamId: USER_TEAM_ID, teamId: USER_TEAM_ID };
    const candidate = getPersonnelFreeAgents().find((p) => String(p.role ?? "").toUpperCase() === "ST_COORDINATOR");
    const candidateId = String(candidate?.personId ?? "");
    if (!candidateId) return;

    state = gameReducerMonolith(state, {
      type: "HIRE_STAFF",
      payload: { role: "STC", personId: candidateId, salary: 1_500_000 },
    });

    state = gameReducerMonolith(state, {
      type: "FIRE_STAFF",
      payload: { personId: candidateId, roleLabel: "STC", spreadSeasons: 1 },
    });

    expect(state.personnelTeamOverrides[candidateId]).toEqual({ teamId: "FREE_AGENT", status: "FREE_AGENT" });

    setPersonnelTeamAndContract({
      personId: candidateId,
      teamId: USER_TEAM_ID,
      startSeason: state.season,
      years: 1,
      salary: 1_000_000,
      notes: "test reset",
    });

    replayPersonnelOverrides(state.personnelTeamOverrides, state.staffContractsByPersonId);
    expect(getPersonnelById(candidateId)?.teamId).toBe("FREE_AGENT");
  });
});
