import { describe, expect, it } from "vitest";
import { advanceLeaguePhase, type RootState } from "@/state/advanceLeaguePhase";

function baseState(): RootState {
  return {
    league: { phase: "REGULAR_SEASON", weekIndex: 0, seasonYear: 2026 },
    standings: {
      A: { w: 12, l: 5, pf: 320, pa: 240 },
      B: { w: 11, l: 6, pf: 300, pa: 250 },
      C: { w: 10, l: 7, pf: 290, pa: 260 },
      D: { w: 9, l: 8, pf: 280, pa: 270 },
      E: { w: 8, l: 9, pf: 270, pa: 280 },
      F: { w: 7, l: 10, pf: 260, pa: 290 },
      G: { w: 6, l: 11, pf: 250, pa: 300 },
    },
  };
}

describe("advanceLeaguePhase", () => {
  it("cannot skip gameplan phase", () => {
    const next = advanceLeaguePhase(baseState());
    expect(next.league.phase).toBe("REGULAR_SEASON_GAMEPLAN");
  });

  it("cannot advance without resolving game", () => {
    const state = { ...baseState(), league: { phase: "REGULAR_SEASON_GAMEPLAN", weekIndex: 1, seasonYear: 2026 } as const };
    const next = advanceLeaguePhase(state);
    expect(next.league.phase).toBe("REGULAR_SEASON_GAME");
  });

  it("triggers playoffs after final week", () => {
    const state: RootState = { ...baseState(), league: { phase: "REGULAR_SEASON_GAME", weekIndex: 16, seasonYear: 2026 } };
    const next = advanceLeaguePhase(state);
    expect(next.league.phase).toBe("WILD_CARD");
    expect(next.playoffs?.bracket.wildCard).toHaveLength(3);
  });


  it("winners advance through playoff rounds and championship completes season", () => {
    let state: RootState = { ...baseState(), league: { phase: "REGULAR_SEASON_GAME", weekIndex: 16, seasonYear: 2026 } };
    state = advanceLeaguePhase(state);
    const wc = state.playoffs!.bracket.wildCard;
    state = {
      ...state,
      playoffs: {
        ...state.playoffs!,
        results: {
          [wc[0].id]: { winner: wc[0].home },
          [wc[1].id]: { winner: wc[1].home },
          [wc[2].id]: { winner: wc[2].home },
        },
      },
    };
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("DIVISIONAL");

    const div = state.playoffs!.bracket.divisional;
    state = { ...state, playoffs: { ...state.playoffs!, results: { ...state.playoffs!.results, [div[0].id]: { winner: div[0].home }, [div[1].id]: { winner: div[1].home } } } };
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("CONFERENCE");

    const conf = state.playoffs!.bracket.conference;
    state = { ...state, playoffs: { ...state.playoffs!, results: { ...state.playoffs!.results, [conf[0].id]: { winner: conf[0].home } } } };
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("CHAMPIONSHIP");

    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("SEASON_COMPLETE");
  });

  it("offseason phases transition and season increments once", () => {
    let state: RootState = { ...baseState(), league: { phase: "SEASON_COMPLETE", weekIndex: 16, seasonYear: 2026 } };
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("STAFF_EVAL");
    state = { ...state, league: { ...state.league, phase: "RE_SIGN" } };
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("FRANCHISE_TAG");
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("FREE_AGENCY");
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("DRAFT");
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("POST_DRAFT");
    state = advanceLeaguePhase(state);
    expect(state.league.phase).toBe("PRESEASON");
    expect(state.league.seasonYear).toBe(2027);
  });
});
