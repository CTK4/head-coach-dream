import type { GameState } from '../../context/GameContext';
import type { GameBoxScore, PlayerBoxScore, TeamBoxScore } from '@/engine/gameSim';
import { resolvePerkModifiers } from '@/engine/perkWiring';

const SNAP_WEIGHTS = [0.6, 0.3, 0.1] as const;

function safeNum(v: unknown): number {
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

function mkPlayer(side: "HOME" | "AWAY", idx: number, playerId: string, share: number, teamStats: TeamBoxScore): PlayerBoxScore {
  const passShare = idx === 0 ? 1 : 0;
  const rushShare = idx === 0 ? 0.65 : idx === 1 ? 0.25 : 0.1;
  const receiveShare = idx === 0 ? 0.2 : idx === 1 ? 0.55 : 0.25;
  const passAttempts = Math.round(teamStats.passAttempts * passShare);
  const completions = Math.min(passAttempts, Math.round(teamStats.completions * passShare));
  return {
    playerId: playerId || `${side}_GEN_${idx + 1}`,
    side,
    snaps: Math.round(share * 100),
    passing: {
      attempts: passAttempts,
      completions,
      yards: Math.round(teamStats.passYards * passShare),
      tds: Math.max(0, Math.round(teamStats.tds * (passShare * 0.55))),
      ints: Math.max(0, Math.round(teamStats.turnovers * (passShare * 0.5))),
      sacksTaken: Math.max(0, Math.round(teamStats.sacks * passShare)),
    },
    rushing: {
      attempts: Math.max(0, Math.round(teamStats.rushAttempts * rushShare)),
      yards: Math.max(0, Math.round(teamStats.rushYards * rushShare)),
      tds: Math.max(0, Math.round(teamStats.tds * (rushShare * 0.35))),
    },
    receiving: {
      targets: Math.max(0, Math.round(teamStats.completions * receiveShare * 1.35)),
      receptions: Math.max(0, Math.round(teamStats.completions * receiveShare)),
      yards: Math.max(0, Math.round(teamStats.passYards * receiveShare)),
      tds: Math.max(0, Math.round(teamStats.tds * (receiveShare * 0.45))),
    },
  };
}

function teamBox(teamId: string, score: number, stats: GameState["game"]["stats"]["home"]): TeamBoxScore {
  return {
    teamId,
    score: safeNum(score),
    passAttempts: safeNum(stats.passAttempts),
    completions: safeNum(stats.completions),
    passYards: safeNum(stats.passYards),
    rushAttempts: safeNum(stats.rushAttempts),
    rushYards: safeNum(stats.rushYards),
    turnovers: safeNum(stats.turnovers),
    sacks: safeNum(stats.sacks),
    tds: safeNum(stats.tds),
  };
}

export function resolveGame(state: GameState): GameState {
  resolvePerkModifiers(state.coach, {
    quarter: Number(state.game?.clock?.quarter ?? 1),
    timeRemainingSec: Number(state.game?.clock?.timeRemainingSec ?? 900),
  });

  const home = teamBox(state.game.homeTeamId, state.game.homeScore, state.game.stats.home);
  const away = teamBox(state.game.awayTeamId, state.game.awayScore, state.game.stats.away);

  const homeTracked = [
    state.game.trackedPlayers?.HOME?.QB,
    state.game.trackedPlayers?.HOME?.RB,
    state.game.trackedPlayers?.HOME?.WR,
  ].map((x) => String(x ?? "")).filter(Boolean);
  const awayTracked = [
    state.game.trackedPlayers?.AWAY?.QB,
    state.game.trackedPlayers?.AWAY?.RB,
    state.game.trackedPlayers?.AWAY?.WR,
  ].map((x) => String(x ?? "")).filter(Boolean);

  const homePlayers = SNAP_WEIGHTS.map((share, idx) => mkPlayer("HOME", idx, homeTracked[idx] ?? "", share, home));
  const awayPlayers = SNAP_WEIGHTS.map((share, idx) => mkPlayer("AWAY", idx, awayTracked[idx] ?? "", share, away));

  const boxScore: GameBoxScore = {
    season: Number(state.season ?? 0),
    week: Number(state.week ?? 0),
    home,
    away,
    players: [...homePlayers, ...awayPlayers],
    finalized: false,
  };

  return {
    ...state,
    game: {
      ...state.game,
      boxScore,
    },
  };
}
