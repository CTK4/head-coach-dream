import type { GameState } from '../../context/GameContext';
import type { GameBoxScore, PlayerBoxScore } from '@/engine/gameSim';

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function normalizePlayerLine(line: PlayerBoxScore): PlayerBoxScore {
  const passAttempts = clampNonNegative(line.passing.attempts);
  const completions = clampNonNegative(Math.min(passAttempts, line.passing.completions));
  const passYards = clampNonNegative(line.passing.yards);
  const rushAttempts = clampNonNegative(line.rushing.attempts);
  const rushYards = clampNonNegative(line.rushing.yards);
  const recTargets = clampNonNegative(line.receiving.targets);
  const recs = clampNonNegative(Math.min(recTargets, line.receiving.receptions));
  const recYards = clampNonNegative(line.receiving.yards);

  return {
    ...line,
    snaps: clampNonNegative(line.snaps),
    passing: {
      attempts: passAttempts,
      completions,
      yards: passYards,
      tds: clampNonNegative(line.passing.tds),
      ints: clampNonNegative(line.passing.ints),
      sacksTaken: clampNonNegative(line.passing.sacksTaken),
    },
    rushing: {
      attempts: rushAttempts,
      yards: rushYards,
      tds: clampNonNegative(line.rushing.tds),
    },
    receiving: {
      targets: recTargets,
      receptions: recs,
      yards: recYards,
      tds: clampNonNegative(line.receiving.tds),
    },
    defense: {
      tackles: clampNonNegative((line as any).defense?.tackles ?? Math.round(line.snaps * 0.08)),
      sacks: clampNonNegative((line as any).defense?.sacks ?? 0),
      tfl: clampNonNegative((line as any).defense?.tfl ?? Math.round(line.snaps * 0.03)),
      hurries: clampNonNegative((line as any).defense?.hurries ?? Math.round(line.snaps * 0.04)),
      interceptionsDef: clampNonNegative((line as any).defense?.interceptionsDef ?? 0),
      passDeflections: clampNonNegative((line as any).defense?.passDeflections ?? Math.round(line.snaps * 0.02)),
      coverageGrade: Math.max(40, Math.min(99, clampNonNegative((line as any).defense?.coverageGrade ?? 65))),
    },
    specialTeams: {
      fieldGoalsMade: clampNonNegative((line as any).specialTeams?.fieldGoalsMade ?? 0),
      fieldGoalAttempts: clampNonNegative((line as any).specialTeams?.fieldGoalAttempts ?? 0),
      fgMadeShort: clampNonNegative((line as any).specialTeams?.fgMadeShort ?? 0),
      fgMadeMid: clampNonNegative((line as any).specialTeams?.fgMadeMid ?? 0),
      fgMadeLong: clampNonNegative((line as any).specialTeams?.fgMadeLong ?? 0),
      extraPointsMade: clampNonNegative((line as any).specialTeams?.extraPointsMade ?? 0),
      punts: clampNonNegative((line as any).specialTeams?.punts ?? 0),
      puntYards: clampNonNegative((line as any).specialTeams?.puntYards ?? 0),
      puntsInside20: clampNonNegative((line as any).specialTeams?.puntsInside20 ?? 0),
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
