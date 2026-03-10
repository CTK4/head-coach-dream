import { describe, expect, it } from 'vitest';
import { buildDebugBundle } from '@/lib/debugBundle';
import { logInfo, clearLogsForTests } from '@/lib/logger';
import type { GameState } from '@/context/GameContext';

function mockState(): GameState {
  return {
    phase: 'HUB',
    careerStage: 'REGULAR_SEASON',
    season: 2028,
    week: 4,
    saveSeed: 123,
    careerSeed: 456,
    acceptedOffer: { teamId: 'NE', years: 4, salary: 8, autonomy: 70, patience: 60 },
    userTeamId: 'NE',
    teamId: 'NE',
    hub: { preseasonWeek: 1, regularSeasonWeek: 4, schedule: null, news: [] } as any,
    league: { week: 4, tradeDeadlineWeek: 8, standings: {}, results: [] } as any,
  } as GameState;
}

describe('debug bundle', () => {
  it('builds expected shape with logs', () => {
    clearLogsForTests();
    logInfo('bundle.test.event');
    const bundle = buildDebugBundle({
      state: mockState(),
      saveMeta: { saveId: 'save-1', coachName: 'Coach', teamName: 'Team', season: 2028, week: 4, record: { wins: 2, losses: 2 }, lastPlayed: 1, careerStage: 'REGULAR_SEASON' },
    });

    expect(bundle.app).toBeTruthy();
    expect(bundle.saveMeta?.saveId).toBe('save-1');
    expect(bundle.stateSnapshot.phase).toBe('HUB');
    expect(bundle.recentLogs.length).toBeGreaterThan(0);
  });
});
