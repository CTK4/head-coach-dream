import type { GameState, Transaction } from "@/context/GameContext";
import { mulberry32, hashSeed } from "@/engine/rng";
import { getTeams } from "@/data/leagueDb";

const LEAGUE_CAP_DEFAULT = 250_000_000;
const round50k = (v: number) => Math.round(v / 50_000) * 50_000;

export type DeadMoneyEntry = {
  transactionId: string;
  playerId: string;
  playerName: string;
  playerPos: string;
  fromTeamId: string;
  transactionType: Transaction["type"];
  accelerationType: Transaction["june1Designation"];
  deadCapThisYear: number;
  deadCapNextYear: number;
  remainingProration: number;
  season: number;
  notes?: string;
  contractSnapshot?: Transaction["contractSnapshot"];
};

export type DeadMoneyLedger = {
  teamId: string;
  year: number;
  totalDeadCapThisYear: number;
  totalDeadCapNextYear: number;
  capPct: number;
  playerCount: number;
  entries: DeadMoneyEntry[];
};

export type LeagueDeadMoneyRow = {
  teamId: string;
  teamName: string;
  teamAbbrev: string;
  deadCapThisYear: number;
  deadCapNextYear: number;
  capPct: number;
  playerCount: number;
  isUserTeam: boolean;
};

/**
 * Aggregate dead-cap ledger for a single team in a given year.
 * Derived purely from the transactions log (deterministic, save-state only).
 */
export function computeDeadMoneyLedger(
  state: GameState,
  teamId: string,
  year: number,
): DeadMoneyLedger {
  const transactions = state.transactions ?? [];
  const cap = round50k(Number(state.finances?.cap ?? LEAGUE_CAP_DEFAULT));

  const entries: DeadMoneyEntry[] = transactions
    .filter((t) => t.fromTeamId === teamId && t.season === year)
    .map((t) => ({
      transactionId: t.id,
      playerId: t.playerId,
      playerName: t.playerName,
      playerPos: t.playerPos,
      fromTeamId: t.fromTeamId,
      transactionType: t.type,
      accelerationType: t.june1Designation,
      deadCapThisYear: t.deadCapThisYear,
      deadCapNextYear: t.deadCapNextYear,
      remainingProration: t.remainingProration,
      season: t.season,
      notes: t.notes,
      contractSnapshot: t.contractSnapshot,
    }))
    .sort((a, b) => b.deadCapThisYear - a.deadCapThisYear);

  const totalDeadCapThisYear = round50k(entries.reduce((a, e) => a + e.deadCapThisYear, 0));
  const totalDeadCapNextYear = round50k(entries.reduce((a, e) => a + e.deadCapNextYear, 0));
  const capPct = cap > 0 ? totalDeadCapThisYear / cap : 0;

  return {
    teamId,
    year,
    totalDeadCapThisYear,
    totalDeadCapNextYear,
    capPct,
    playerCount: entries.length,
    entries,
  };
}

/**
 * Generate a league-wide dead money summary.
 * For the user's team: uses actual transaction data.
 * For CPU teams: uses a seeded RNG estimate based on saveSeed + teamId + year.
 */
export function computeLeagueDeadMoneySummary(
  state: GameState,
  year: number,
): LeagueDeadMoneyRow[] {
  const userTeamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "";
  const teams = getTeams().filter((t) => t.isActive);
  const cap = round50k(Number(state.finances?.cap ?? LEAGUE_CAP_DEFAULT));

  return teams.map((team) => {
    const isUserTeam = team.teamId === userTeamId;
    if (isUserTeam) {
      const ledger = computeDeadMoneyLedger(state, userTeamId, year);
      // Also account for aggregate dead cap tracked in finances (includes non-CUT_APPLY paths)
      const rawDeadThis = Number(state.finances?.deadCapThisYear ?? 0);
      const rawDeadNext = Number(state.finances?.deadCapNextYear ?? 0);
      const thisYear = Math.max(ledger.totalDeadCapThisYear, rawDeadThis);
      const nextYear = Math.max(ledger.totalDeadCapNextYear, rawDeadNext);
      return {
        teamId: team.teamId,
        teamName: team.name,
        teamAbbrev: team.abbrev ?? team.name.slice(0, 3).toUpperCase(),
        deadCapThisYear: thisYear,
        deadCapNextYear: nextYear,
        capPct: cap > 0 ? thisYear / cap : 0,
        playerCount: ledger.playerCount,
        isUserTeam: true,
      };
    }

    // CPU team: deterministic estimate via seeded RNG
    const seed = hashSeed(state.saveSeed, team.teamId, year);
    const rng = mulberry32(seed);
    // Typical range: 0–18M dead cap, weighted toward lower values
    const base = rng() * rng() * 18_000_000;
    const deadCapThisYear = round50k(base);
    const deadCapNextYear = round50k(rng() * deadCapThisYear * 0.5);
    const playerCount = Math.round(rng() * 4);
    return {
      teamId: team.teamId,
      teamName: team.name,
      teamAbbrev: team.abbrev ?? team.name.slice(0, 3).toUpperCase(),
      deadCapThisYear,
      deadCapNextYear,
      capPct: cap > 0 ? deadCapThisYear / cap : 0,
      playerCount,
      isUserTeam: false,
    };
  }).sort((a, b) => b.deadCapThisYear - a.deadCapThisYear);
}
