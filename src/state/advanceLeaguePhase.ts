import { REGULAR_SEASON_WEEKS } from "@/engine/schedule";
import type { LeaguePhase, LeagueState } from "@/state/leaguePhase";

export type TeamRecord = { w: number; l: number; pf: number; pa: number; conference?: string; seed?: number };
export type Matchup = { id: string; home: string; away: string; homeSeed: number; awaySeed: number };

export interface PlayoffBracket {
  wildCard: Matchup[];
  divisional: Matchup[];
  conference: Matchup[];
  championship: Matchup | null;
}

export interface RootState {
  league: LeagueState;
  standings: Record<string, TeamRecord>;
  playoffs?: {
    bracket: PlayoffBracket;
    results: Record<string, { winner: string }>;
  };
}

function rankTeamsByRecord(state: RootState): Array<{ teamId: string; record: TeamRecord; seed: number }> {
  return Object.entries(state.standings)
    .sort(([idA, a], [idB, b]) => {
      if (b.w !== a.w) return b.w - a.w;
      const diffA = a.pf - a.pa;
      const diffB = b.pf - b.pa;
      if (diffB !== diffA) return diffB - diffA;
      if (b.pf !== a.pf) return b.pf - a.pf;
      return idA.localeCompare(idB);
    })
    .map(([teamId, record], idx) => ({ teamId, record, seed: idx + 1 }));
}

function buildInitialBracket(seeds: Array<{ teamId: string; seed: number }>): PlayoffBracket {
  return {
    wildCard: [
      { id: "WC1", home: seeds[1].teamId, away: seeds[6].teamId, homeSeed: seeds[1].seed, awaySeed: seeds[6].seed },
      { id: "WC2", home: seeds[2].teamId, away: seeds[5].teamId, homeSeed: seeds[2].seed, awaySeed: seeds[5].seed },
      { id: "WC3", home: seeds[3].teamId, away: seeds[4].teamId, homeSeed: seeds[3].seed, awaySeed: seeds[4].seed },
    ],
    divisional: [],
    conference: [],
    championship: null,
  };
}

function seedPlayoffs(state: RootState): RootState {
  const ranked = rankTeamsByRecord(state);
  const seeds = ranked.slice(0, 7);
  if (seeds.length < 7) return state;

  return {
    ...state,
    league: {
      ...state.league,
      phase: "WILD_CARD",
      playoffRound: 1,
    },
    playoffs: {
      bracket: buildInitialBracket(seeds),
      results: {},
    },
  };
}

function moveToPhase(state: RootState, phase: LeaguePhase): RootState {
  return { ...state, league: { ...state.league, phase } };
}

function handleRegularSeasonGameResolution(state: RootState): RootState {
  const isLastWeek = state.league.weekIndex >= REGULAR_SEASON_WEEKS - 1;

  if (!isLastWeek) {
    return {
      ...state,
      league: {
        ...state.league,
        weekIndex: state.league.weekIndex + 1,
        phase: "REGULAR_SEASON",
      },
    };
  }

  return seedPlayoffs(state);
}

function winnersFrom(results: Record<string, { winner: string }>, roundGames: Matchup[]): Array<{ teamId: string; seed: number }> {
  return roundGames
    .map((game) => {
      const winner = results[game.id]?.winner;
      if (!winner) return null;
      return winner === game.home ? { teamId: winner, seed: game.homeSeed } : { teamId: winner, seed: game.awaySeed };
    })
    .filter(Boolean) as Array<{ teamId: string; seed: number }>;
}

function reseed(winners: Array<{ teamId: string; seed: number }>): Array<{ teamId: string; seed: number }> {
  return winners.slice().sort((a, b) => a.seed - b.seed);
}

function handlePlayoffRound(state: RootState): RootState {
  const playoffs = state.playoffs;
  if (!playoffs) return state;

  if (state.league.phase === "WILD_CARD") {
    const winners = reseed(winnersFrom(playoffs.results, playoffs.bracket.wildCard));
    if (winners.length < 3) return state;
    const topSeed = rankTeamsByRecord(state)[0];
    const divisional = [
      { id: "DIV1", home: topSeed.teamId, away: winners[2].teamId, homeSeed: 1, awaySeed: winners[2].seed },
      { id: "DIV2", home: winners[0].teamId, away: winners[1].teamId, homeSeed: winners[0].seed, awaySeed: winners[1].seed },
    ];
    return { ...state, playoffs: { ...playoffs, bracket: { ...playoffs.bracket, divisional } }, league: { ...state.league, phase: "DIVISIONAL", playoffRound: 2 } };
  }

  if (state.league.phase === "DIVISIONAL") {
    const winners = reseed(winnersFrom(playoffs.results, playoffs.bracket.divisional));
    if (winners.length < 2) return state;
    const conference = [{ id: "CONF", home: winners[0].teamId, away: winners[1].teamId, homeSeed: winners[0].seed, awaySeed: winners[1].seed }];
    return { ...state, playoffs: { ...playoffs, bracket: { ...playoffs.bracket, conference } }, league: { ...state.league, phase: "CONFERENCE", playoffRound: 3 } };
  }

  if (state.league.phase === "CONFERENCE") {
    const winners = reseed(winnersFrom(playoffs.results, playoffs.bracket.conference));
    if (winners.length === 0) return state;
    if (winners.length < 2) {
      return { ...state, league: { ...state.league, phase: "SEASON_COMPLETE" } };
    }
    const championship = { id: "SB", home: winners[0].teamId, away: winners[1].teamId, homeSeed: winners[0].seed, awaySeed: winners[1].seed };
    return { ...state, playoffs: { ...playoffs, bracket: { ...playoffs.bracket, championship } }, league: { ...state.league, phase: "CHAMPIONSHIP", playoffRound: 4 } };
  }

  if (state.league.phase === "CHAMPIONSHIP") {
    const championship = playoffs.bracket.championship;
    if (!championship) {
      return state;
    }
    const championshipResult = playoffs.results[championship.id];
    if (!championshipResult?.winner) {
      return state;
    }
  }

  return { ...state, league: { ...state.league, phase: "SEASON_COMPLETE" } };
}

function beginOffseason(state: RootState): RootState {
  return moveToPhase(state, "STAFF_EVAL");
}

function moveToFranchiseTag(state: RootState): RootState {
  return moveToPhase(state, "FRANCHISE_TAG");
}

function moveToFreeAgency(state: RootState): RootState {
  return moveToPhase(state, "FREE_AGENCY");
}

function moveToDraft(state: RootState): RootState {
  return moveToPhase(state, "DRAFT");
}

function finalizePostDraft(state: RootState): RootState {
  return moveToPhase(state, "POST_DRAFT");
}

function moveToPreseason(state: RootState): RootState {
  return {
    ...state,
    league: {
      ...state.league,
      phase: "PRESEASON",
      weekIndex: 0,
      playoffRound: undefined,
      seasonYear: state.league.seasonYear + 1,
    },
    playoffs: undefined,
  };
}

export function advanceLeaguePhase(state: RootState): RootState {
  const { league } = state;

  switch (league.phase) {
    case "REGULAR_SEASON":
      return moveToPhase(state, "REGULAR_SEASON_GAMEPLAN");
    case "REGULAR_SEASON_GAMEPLAN":
      return moveToPhase(state, "REGULAR_SEASON_GAME");
    case "REGULAR_SEASON_GAME":
      return handleRegularSeasonGameResolution(state);
    case "WILD_CARD":
    case "DIVISIONAL":
    case "CONFERENCE":
    case "CHAMPIONSHIP":
      return handlePlayoffRound(state);
    case "SEASON_COMPLETE":
      return beginOffseason(state);
    case "STAFF_EVAL":
      return moveToPhase(state, "RE_SIGN");
    case "RE_SIGN":
      return moveToFranchiseTag(state);
    case "FRANCHISE_TAG":
      return moveToFreeAgency(state);
    case "FREE_AGENCY":
      return moveToDraft(state);
    case "DRAFT":
      return finalizePostDraft(state);
    case "POST_DRAFT":
      return moveToPreseason(state);
    case "PRESEASON":
      return moveToPhase(state, "CUTDOWN");
    case "CUTDOWN":
      return moveToPhase(state, "REGULAR_SEASON");
    default:
      return state;
  }
}
