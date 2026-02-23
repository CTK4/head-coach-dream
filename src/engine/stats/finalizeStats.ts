import type { GameState } from '../../context/GameContext';
import type { GameBoxScore, PlayerBoxScore } from '@/engine/gameSim';

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function normalizePlayerLine(line: PlayerBoxScore): PlayerBoxScore {
  return {
    ...line,
    snaps: clampNonNegative(line.snaps),
    passing: {
      attempts: clampNonNegative(line.passing.attempts),
      completions: clampNonNegative(Math.min(line.passing.attempts, line.passing.completions)),
      yards: clampNonNegative(line.passing.yards),
      tds: clampNonNegative(line.passing.tds),
      ints: clampNonNegative(line.passing.ints),
      sacksTaken: clampNonNegative(line.passing.sacksTaken),
    },
    rushing: {
      attempts: clampNonNegative(line.rushing.attempts),
      yards: clampNonNegative(line.rushing.yards),
      tds: clampNonNegative(line.rushing.tds),
    },
    receiving: {
      targets: clampNonNegative(line.receiving.targets),
      receptions: clampNonNegative(Math.min(line.receiving.targets, line.receiving.receptions)),
      yards: clampNonNegative(line.receiving.yards),
      tds: clampNonNegative(line.receiving.tds),
    },
  };
}

export function finalizeStats(state: GameState): GameState {
  const source = state.game.boxScore;
  if (!source) return state;

  const boxScore: GameBoxScore = {
    ...source,
    home: {
      ...source.home,
      score: clampNonNegative(source.home.score),
      passAttempts: clampNonNegative(source.home.passAttempts),
      completions: clampNonNegative(Math.min(source.home.passAttempts, source.home.completions)),
      passYards: clampNonNegative(source.home.passYards),
      rushAttempts: clampNonNegative(source.home.rushAttempts),
      rushYards: clampNonNegative(source.home.rushYards),
      turnovers: clampNonNegative(source.home.turnovers),
      sacks: clampNonNegative(source.home.sacks),
      tds: clampNonNegative(source.home.tds),
    },
    away: {
      ...source.away,
      score: clampNonNegative(source.away.score),
      passAttempts: clampNonNegative(source.away.passAttempts),
      completions: clampNonNegative(Math.min(source.away.passAttempts, source.away.completions)),
      passYards: clampNonNegative(source.away.passYards),
      rushAttempts: clampNonNegative(source.away.rushAttempts),
      rushYards: clampNonNegative(source.away.rushYards),
      turnovers: clampNonNegative(source.away.turnovers),
      sacks: clampNonNegative(source.away.sacks),
      tds: clampNonNegative(source.away.tds),
    },
    players: source.players.map(normalizePlayerLine),
    finalized: true,
  };

  return { ...state, game: { ...state.game, boxScore } };
}
