import leagueDbJson from "@/data/leagueDB.json";
import { DEF_SCHEMES, OFF_SCHEMES } from "@/lib/constants";
import type { Contract, Player, Team } from "@/types";

type RawLeagueDb = {
  Teams: Array<Record<string, unknown>>;
  Players: Array<Record<string, unknown>>;
  Contracts: Array<Record<string, unknown>>;
};

const raw = leagueDbJson as RawLeagueDb;

export const HCD_DATA = {
  teams: raw.Teams,
  players: raw.Players,
  contracts: raw.Contracts,
} as const;

export function loadTeamsFixture(): Team[] {
  return HCD_DATA.teams.map((team, index) => ({
    id: String(team.teamId),
    abbrev: String(team.abbrev ?? "UNK"),
    name: String(team.name ?? "Unknown Team"),
    conferenceId: String(team.conferenceId ?? "UNK"),
    divisionId: String(team.divisionId ?? "UNK"),
    offenseScheme: OFF_SCHEMES[index % OFF_SCHEMES.length].id,
    defenseScheme: DEF_SCHEMES[index % DEF_SCHEMES.length].id,
  }));
}

export function loadPlayersFixture(): Player[] {
  return HCD_DATA.players.map((player) => ({
    id: String(player.playerId),
    fullName: String(player.fullName ?? "Unknown Player"),
    pos: String(player.pos ?? "UNK"),
    age: Number(player.age ?? 22),
    overall: Number(player.overall ?? 50),
    teamId: String(player.teamId ?? "FA"),
    attributes: {
      Speed: Number(player.Speed ?? 50),
      Strength: Number(player.Strength ?? 50),
      Awareness: Number(player.Awareness ?? 50),
      Agility: Number(player.Agility ?? 50),
      Coverage: Number(player.Coverage ?? 50),
      Accuracy: Number(player.Accuracy ?? 50),
      Run_Blocking: Number(player.Run_Blocking ?? 50),
      Zone_Coverage: Number(player.Zone_Coverage ?? 50),
      Pursuit: Number(player.Pursuit ?? 50),
      Instincts: Number(player.Instincts ?? 50),
      Shed_Blocks: Number(player.Shed_Blocks ?? 50),
      Route_Running: Number(player.Route_Running ?? 50),
      Hands: Number(player.Hands ?? 50),
      Release: Number(player.Release ?? 50),
      Range: Number(player.Range ?? 50),
      Run_Defense: Number(player.Run_Defense ?? 50),
    },
  }));
}

export function loadContractsFixture(): Contract[] {
  return HCD_DATA.contracts
    .filter((contract) => contract.entityType === "PLAYER")
    .map((contract) => {
      const salaryKeys = ["salaryY1", "salaryY2", "salaryY3", "salaryY4"] as const;
      const totalSalary = salaryKeys.reduce((sum, key) => sum + Number(contract[key] ?? 0), 0);
      const years = Math.max(1, Number(contract.endSeason ?? 0) - Number(contract.startSeason ?? 0) + 1);
      return {
        id: String(contract.contractId),
        playerId: String(contract.personId),
        teamId: String(contract.teamId),
        startSeason: Number(contract.startSeason ?? 2026),
        endSeason: Number(contract.endSeason ?? 2026),
        apy: Math.round(totalSalary / years),
        guaranteed: Number(contract.guaranteed ?? 0),
      };
    });
}
