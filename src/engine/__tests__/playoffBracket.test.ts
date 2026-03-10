import { describe, expect, it } from "vitest";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
import type { LeagueState } from "@/engine/leagueSim";

const league: LeagueState = {
  standings: {
    MILWAUKEE_NORTHSHORE: { w: 14, l: 3, pf: 450, pa: 280 },
    ATLANTA_APEX: { w: 13, l: 4, pf: 430, pa: 300 },
    BIRMINGHAM_VULCANS: { w: 12, l: 5, pf: 410, pa: 320 },
    CLEVELAND_BULLDOGS: { w: 11, l: 6, pf: 390, pa: 340 },
  },
  results: [],
  gmByTeamId: {},
  postseason: { season: 2026, resultsByTeamId: {} },
  week: 18,
  tradeDeadlineWeek: 10,
};

const sevenPerConferenceStandings: LeagueState["standings"] = {
  MILWAUKEE_NORTHSHORE: { w: 14, l: 3, pf: 450, pa: 280 },
  ATLANTA_APEX: { w: 13, l: 4, pf: 430, pa: 300 },
  BIRMINGHAM_VULCANS: { w: 12, l: 5, pf: 410, pa: 320 },
  CHARLOTTE_CROWN: { w: 11, l: 6, pf: 390, pa: 340 },
  WASHINGTON_SENTINELS: { w: 10, l: 7, pf: 380, pa: 350 },
  CHICAGO_UNION: { w: 9, l: 8, pf: 370, pa: 360 },
  INDIANAPOLIS_IGNITION: { w: 8, l: 9, pf: 360, pa: 365 },
  BALTIMORE_ADMIRALS: { w: 14, l: 3, pf: 445, pa: 285 },
  BOSTON_HARBORMEN: { w: 13, l: 4, pf: 425, pa: 305 },
  BUFFALO_NORTHWIND: { w: 12, l: 5, pf: 405, pa: 325 },
  CLEVELAND_FORGE: { w: 11, l: 6, pf: 385, pa: 345 },
  DALLAS_IMPERIALS: { w: 10, l: 7, pf: 375, pa: 355 },
  DENVER_SUMMIT: { w: 9, l: 8, pf: 365, pa: 362 },
  DETROIT_ASSEMBLY: { w: 8, l: 9, pf: 355, pa: 368 },
};

describe("playoff bracket", () => {
  it("builds deterministic matchups from fixed standings", () => {
    const a = buildPlayoffBracket({ league, season: 2026 });
    const b = buildPlayoffBracket({ league, season: 2026 });
    expect(a.round).toBe(b.round);
    expect(a.bracket).toEqual(b.bracket);
  });

  it("sevenTeamWildcard.doesNotDropAnySeed", () => {
    const sevenPerConference: LeagueState = {
      ...league,
      standings: sevenPerConferenceStandings,
    };
    const playoffs = buildPlayoffBracket({ league: sevenPerConference, season: 2026 });

    for (const conf of Object.values(playoffs.bracket.conferences)) {
      expect(conf.seeds).toHaveLength(7);
      const wildCardParticipants = new Set(
        (conf.gamesByRound.WILD_CARD ?? []).flatMap((game) => [game.homeTeamId, game.awayTeamId]),
      );
      const byeTeam = conf.seeds[0];

      expect(wildCardParticipants.has(byeTeam)).toBe(false);
      for (const teamId of conf.seeds) {
        expect(teamId === byeTeam || wildCardParticipants.has(teamId)).toBe(true);
      }

      const wildCards = conf.gamesByRound.WILD_CARD ?? [];
      expect(wildCards).toHaveLength(3);
      expect(wildCards[0]).toMatchObject({ homeTeamId: conf.seeds[1], awayTeamId: conf.seeds[6] });
      expect(wildCards[1]).toMatchObject({ homeTeamId: conf.seeds[2], awayTeamId: conf.seeds[5] });
      expect(wildCards[2]).toMatchObject({ homeTeamId: conf.seeds[3], awayTeamId: conf.seeds[4] });
    }
  });

  it("wildCardGameCount.matchesFormat", () => {
    const sevenPerConference: LeagueState = {
      ...league,
      standings: sevenPerConferenceStandings,
    };
    const playoffs = buildPlayoffBracket({ league: sevenPerConference, season: 2026 });

    for (const conf of Object.values(playoffs.bracket.conferences)) {
      expect(conf.gamesByRound.WILD_CARD).toHaveLength(3);
    }
  });
});
