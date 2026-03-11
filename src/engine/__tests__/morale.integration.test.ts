import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialStateForTests, gameReducer, migrateSave, type GameState } from '@/context/GameContext';
import { getPlayers, getTeams } from '@/data/leagueDb';
import { updateChemistry } from '@/engine/chemistry';
import { DEFAULT_WEEKLY_GAMEPLAN } from '@/engine/gameplan';

const captured: Array<{ player: any; ctx: any; stats: any }> = [];

vi.mock('@/engine/moraleEngine', async () => {
  const actual = await vi.importActual<typeof import('@/engine/moraleEngine')>('@/engine/moraleEngine');
  return {
    ...actual,
    updateMorale: (player: any, ctx: any, stats: any) => {
      captured.push({ player, ctx, stats });
      return { morale: player.morale, playingTimeSatisfaction: player.playingTimeSatisfaction ?? 0, tradeRequest: false, topModifiers: [] };
    },
  };
});

import { updateMorale } from '@/engine/morale';

function findTeamPlayersByPos(state: GameState, pos: string): string[] {
  const teamId = String(state.acceptedOffer?.teamId ?? '');
  return getPlayers()
    .filter((p) => String(p.teamId) === teamId && String(p.pos) === pos)
    .slice(0, 3)
    .map((p) => String(p.playerId));
}

describe('morale integration inputs', () => {
  beforeEach(() => {
    captured.length = 0;
  });

  it('derives role expectations and contract-year flags from repo-backed state', () => {
    const base = createInitialStateForTests();
    const [wr1, wr2, wr3] = findTeamPlayersByPos(base, 'WR');
    expect(wr1).toBeDefined();
    expect(wr2).toBeDefined();
    expect(wr3).toBeDefined();

    const seeded: GameState = {
      ...base,
      depthChart: {
        ...base.depthChart,
        startersByPos: {
          ...base.depthChart.startersByPos,
          WR1: wr1,
          WR3: wr3,
        },
      },
      playerContractOverrides: {
        ...base.playerContractOverrides,
        [wr1]: {
          ...base.playerContractOverrides[wr1],
          endSeason: base.season,
        } as any,
      },
    };

    updateMorale(seeded);

    const starter = captured.find((c) => c.player?.roleExpectation === 'STARTER' && c.ctx?.isContractYear === true);
    const depthAssigned = captured.find((c) => c.player?.roleExpectation === 'DEPTH' && c.ctx?.isContractYear === false);
    const unassignedQb = captured.find((c) => c.player?.roleExpectation === 'DEPTH' && c.stats?.snapsPlayed === 50 && c.stats?.snapsExpected === 50);

    expect(starter).toBeDefined();
    expect(depthAssigned).toBeDefined();
    expect(unassignedQb).toBeDefined();
  });
});

describe('chemistry integration', () => {
  it('stores chemistry bonus at top-level and carries it into START_GAME execution bonus', () => {
    const base = createInitialStateForTests();
    const teamId = String(base.acceptedOffer?.teamId ?? '');
    const opponent = getTeams().find((t) => t.teamId !== teamId)?.teamId ?? 'ATLANTA_APEX';
    const withChem = updateChemistry({
      ...base,
      league: { ...base.league, phase: 'REGULAR_SEASON_GAME' },
      teamGameplans: { [teamId]: { ...DEFAULT_WEEKLY_GAMEPLAN, locked: true } },
      weeklyFamiliarityBonus: 1.5,
      game: { ...base.game, homeScore: 24, awayScore: 20 },
      playerMorale: { p1: 90, p2: 85, p3: 80 },
    });

    expect(typeof withChem.chemistryExecutionBonus).toBe('number');

    const started = gameReducer(withChem, {
      type: 'START_GAME',
      payload: { opponentTeamId: opponent, weekType: 'REGULAR_SEASON', weekNumber: 3 },
    });

    expect(started.game.practiceExecutionBonus).toBeCloseTo((withChem.weeklyFamiliarityBonus ?? 0) + (withChem.chemistryExecutionBonus ?? 0), 5);
  });
  it('save migration remains compatible with optional chemistryExecutionBonus', () => {
    const migrated = migrateSave({ saveVersion: 1, saveSeed: 11, season: 2026 }) as GameState;
    expect(migrated).toBeDefined();
    expect(migrated.chemistryExecutionBonus).toBeUndefined();
  });

});
