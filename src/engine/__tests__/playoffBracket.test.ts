import { describe, expect, it } from "vitest";
import { buildPlayoffBracket } from "@/engine/playoffsSim";
import type { LeagueState } from "@/engine/leagueSim";
import { getTeams } from "@/data/leagueDb";

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

const sevenPerConferenceStandings: LeagueState["standings"] = (() => {
  const teamsByConference = getTeams().reduce<Record<string, string[]>>((acc, team) => {
    const confId = String(team.conferenceId ?? "");
    if (!confId) return acc;
    (acc[confId] ??= []).push(String(team.teamId));
    return acc;
  }, {});

  return Object.values(teamsByConference)
    .slice(0, 2)
    .flatMap((teamIds) => teamIds.slice(0, 7))
    .reduce<LeagueState["standings"]>((acc, teamId, index) => {
      acc[teamId] = { w: 14 - index % 7, l: 3 + index % 7, pf: 450 - index * 10, pa: 280 + index * 8 };
      return acc;
    }, {});
})();

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
