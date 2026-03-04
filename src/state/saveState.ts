import { loadContractsFixture, loadPlayersFixture, loadTeamsFixture } from "@/data/hcdLeagueDB";
import { CAP_LIMIT, DEF_SCHEMES, OFF_SCHEMES } from "@/lib/constants";
import { hashSeed, mulberry32, rI, rPick, rShuffle } from "@/lib/rng";
import type { Coach, Contract, LeaguePhase, Player, SaveState, TeamId, TxEvent } from "@/types";

const SAVE_VERSION = 1;

type InitArgs = { seed: string | number; userTeamId: TeamId };

type PhaseController = {
  canEnter: (state: SaveState) => boolean;
  canAdvance: (state: SaveState) => boolean;
  advance: (state: SaveState) => SaveState;
};

const PHASE_ORDER: LeaguePhase[] = [
  "FRONT_OFFICE_HUB",
  "STAFF",
  "ROSTER_AUDIT",
  "FREE_AGENCY",
  "DRAFT_PREP",
  "DRAFT",
  "PRESEASON",
  "REGULAR_SEASON_WEEK",
  "PLAYOFFS",
  "ROLLOVER",
];

export function createNewSave({ seed, userTeamId }: InitArgs): SaveState {
  const numericSeed = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  const teams = Object.fromEntries(loadTeamsFixture().map((team) => [team.id, team]));
  const players = loadPlayersFixture();
  const playersById = Object.fromEntries(players.map((player) => [player.id, player]));
  const assignments = Object.fromEntries(players.map((player) => [player.id, player.teamId]));
  const contracts = Object.fromEntries(loadContractsFixture().map((contract) => [contract.playerId, contract]));

  const state: SaveState = {
    meta: {
      saveVersion: SAVE_VERSION,
      createdAt: new Date(0).toISOString(),
      seed: numericSeed,
      userTeamId,
    },
    league: {
      teams,
      schedule: buildSchedule(Object.keys(teams), numericSeed),
      standings: Object.fromEntries(Object.keys(teams).map((teamId) => [teamId, { wins: 0, losses: 0, ties: 0 }])),
      week: 1,
      phase: "FRONT_OFFICE_HUB",
    },
    roster: {
      playersById,
      assignments,
    },
    contracts: {
      records: contracts,
      capTable: {},
    },
    coaches: createSeededCoachState(numericSeed, Object.keys(teams)),
    scouting: { knowledge: {} },
    transactions: [],
    ui: { lastRoute: "/hub" },
  };

  return rebuildIndices(state);
}

function buildSchedule(teamIds: string[], seed: number): SaveState["league"]["schedule"] {
  const rng = mulberry32(hashSeed(seed, "schedule"));
  const shuffled = rShuffle(rng, teamIds);
  const schedule: SaveState["league"]["schedule"] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const homeTeamId = shuffled[i];
    const awayTeamId = shuffled[(i + 1) % shuffled.length];
    schedule.push({ week: 1, homeTeamId, awayTeamId });
  }
  return schedule;
}

function createSeededCoachState(seed: number, teamIds: string[]): SaveState["coaches"] {
  const rng = mulberry32(hashSeed(seed, "coach-market"));
  const byId: Record<string, Coach> = {};
  const staffByTeam: SaveState["coaches"]["staffByTeam"] = {};
  const marketCoachIds: string[] = [];

  teamIds.forEach((teamId, idx) => {
    const hcId = `COACH_${idx}_HC`;
    byId[hcId] = {
      id: hcId,
      name: `Coach ${idx}`,
      role: "HC",
      side: "OFFENSE",
      schemePrefs: {
        offense: OFF_SCHEMES[idx % OFF_SCHEMES.length].id,
        defense: DEF_SCHEMES[idx % DEF_SCHEMES.length].id,
      },
      ratings: {
        teaching: rI(rng, 55, 95),
        strategy: rI(rng, 55, 95),
        discipline: rI(rng, 55, 95),
        recruiting: rI(rng, 55, 95),
      },
      traits: [rPick(rng, ["Developer", "Culture", "GameManager"])],
      cost: rI(rng, 2_000_000, 12_000_000),
      teamId,
    };
    staffByTeam[teamId] = { HC: hcId };
  });

  for (let i = 0; i < Math.max(12, Math.floor(teamIds.length / 2)); i += 1) {
    const id = `COACH_MARKET_${i}`;
    byId[id] = {
      id,
      name: `Market Coach ${i}`,
      role: rPick(rng, ["HC", "OC", "DC", "ST"]),
      side: rPick(rng, ["OFFENSE", "DEFENSE", "ST"]),
      schemePrefs: {
        offense: rPick(rng, OFF_SCHEMES).id,
        defense: rPick(rng, DEF_SCHEMES).id,
      },
      ratings: {
        teaching: rI(rng, 45, 90),
        strategy: rI(rng, 45, 90),
        discipline: rI(rng, 45, 90),
        recruiting: rI(rng, 45, 90),
      },
      traits: [rPick(rng, ["Aggressive", "Teacher", "Analytics"])],
      cost: rI(rng, 1_000_000, 7_500_000),
    };
    marketCoachIds.push(id);
  }

  return { byId, staffByTeam, marketCoachIds };
}

export function applyTx(state: SaveState, tx: TxEvent): SaveState {
  const next = structuredClone(state);
  next.transactions.push(tx);

  switch (tx.type) {
    case "SIGN_FA": {
      next.roster.assignments[tx.playerId] = tx.teamId;
      next.roster.playersById[tx.playerId].teamId = tx.teamId;
      next.contracts.records[tx.playerId] = {
        id: `${tx.playerId}-${tx.id}`,
        playerId: tx.playerId,
        teamId: tx.teamId,
        ...tx.contract,
      };
      break;
    }
    case "RELEASE_PLAYER": {
      next.roster.assignments[tx.playerId] = "FA";
      next.roster.playersById[tx.playerId].teamId = "FA";
      delete next.contracts.records[tx.playerId];
      break;
    }
    case "RE_SIGN": {
      next.contracts.records[tx.playerId] = {
        id: `${tx.playerId}-${tx.id}`,
        playerId: tx.playerId,
        teamId: tx.teamId,
        ...tx.contract,
      };
      break;
    }
    case "FRANCHISE_TAG": {
      const current = next.contracts.records[tx.playerId];
      next.contracts.records[tx.playerId] = {
        ...current,
        id: `${tx.playerId}-${tx.id}`,
        playerId: tx.playerId,
        teamId: tx.teamId,
        startSeason: tx.season,
        endSeason: tx.season,
        apy: tx.apy,
        guaranteed: tx.apy,
        isFranchiseTag: true,
      };
      break;
    }
    case "TRADE": {
      tx.playerIds.forEach((playerId) => {
        const currentTeam = next.roster.assignments[playerId];
        const destination = currentTeam === tx.fromTeamId ? tx.toTeamId : tx.fromTeamId;
        next.roster.assignments[playerId] = destination;
        next.roster.playersById[playerId].teamId = destination;
        if (next.contracts.records[playerId]) {
          next.contracts.records[playerId]!.teamId = destination;
        }
      });
      break;
    }
    case "RETIRE": {
      next.roster.assignments[tx.playerId] = "FA";
      delete next.roster.playersById[tx.playerId];
      delete next.contracts.records[tx.playerId];
      break;
    }
  }

  return rebuildIndices(next);
}

export function rebuildIndices(state: SaveState): SaveState {
  const next = structuredClone(state);
  const capTable: Record<string, number> = Object.fromEntries(Object.keys(next.league.teams).map((id) => [id, 0]));

  Object.values(next.contracts.records).forEach((contract) => {
    if (!contract) return;
    capTable[contract.teamId] = (capTable[contract.teamId] ?? 0) + contract.apy;
  });

  next.contracts.capTable = capTable;
  return next;
}

export function getEffectiveRoster(state: SaveState, teamId: TeamId): Player[] {
  return Object.values(state.roster.playersById).filter((player) => state.roster.assignments[player.id] === teamId);
}

export function computeSchemeFit(player: Player, schemeId: string): number {
  const emphasis = [...OFF_SCHEMES, ...DEF_SCHEMES].find((scheme) => scheme.id === schemeId)?.emphasis ?? [];
  if (emphasis.length === 0) return Math.round(player.overall);
  const score = emphasis.reduce((sum, attr) => sum + (player.attributes[attr] ?? 50), 0) / emphasis.length;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeTeamSchemeFit(state: SaveState, teamId: TeamId): number {
  const team = state.league.teams[teamId];
  if (!team) return 0;
  const roster = getEffectiveRoster(state, teamId);
  if (roster.length === 0) return 0;
  const total = roster.reduce(
    (sum, player) => sum + (computeSchemeFit(player, team.offenseScheme) + computeSchemeFit(player, team.defenseScheme)) / 2,
    0,
  );
  return Math.round(total / roster.length);
}

export function getPhaseController(phase: LeaguePhase): PhaseController {
  const index = PHASE_ORDER.indexOf(phase);
  return {
    canEnter: () => index >= 0,
    canAdvance: (state) => state.league.phase === phase,
    advance: (state) => {
      const nextIndex = (index + 1) % PHASE_ORDER.length;
      const nextPhase = PHASE_ORDER[nextIndex];
      const weekIncrement = nextPhase === "REGULAR_SEASON_WEEK" ? 1 : 0;
      return {
        ...state,
        league: {
          ...state.league,
          phase: nextPhase,
          week: state.league.week + weekIncrement,
        },
      };
    },
  };
}

export function validatePostTx(state: SaveState): string[] {
  const errors: string[] = [];
  Object.entries(state.contracts.capTable).forEach(([teamId, cap]) => {
    if (cap > CAP_LIMIT) {
      errors.push(`${teamId} exceeds cap limit with ${cap}.`);
    }
  });

  Object.entries(state.roster.assignments).forEach(([playerId, teamId]) => {
    if (teamId !== "FA" && !state.league.teams[teamId]) {
      errors.push(`Player ${playerId} assigned to unknown team ${teamId}.`);
    }
  });

  return errors;
}

export function replayTransactions(base: SaveState, transactions: TxEvent[]): SaveState {
  return transactions.reduce((acc, tx) => applyTx(acc, tx), { ...base, transactions: [] });
}
