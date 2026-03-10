import { describe, expect, it } from "vitest";
import type { Injury } from "@/engine/injuryTypes";
import { pickEventForContext, type EventContext, type GameEvent } from "@/engine/eventEngine";
import { generateInjuryNews } from "@/engine/newsGen";

const context = { week: 7, season: 2027, userTeamId: "TEAM_A" };

function mkCtx(seed: number, archetypeId = "ceo") {
  return {
    seed,
    week: 7,
    tenureYear: 2,
    record: { wins: 4, losses: 2 },
    coach: { name: "Coach Prime", archetypeId } as EventContext["coach"],
  } as EventContext;
}

function mkEvents(): GameEvent[] {
  return [
    {
      id: "all-1",
      archetypes: [],
      triggerCondition: () => true,
      title: "All 1",
      body: "Hello {{coach.name}}",
      choices: [],
      repeatable: true,
    },
    {
      id: "all-2",
      archetypes: [],
      triggerCondition: () => true,
      title: "All 2",
      body: "Week {{week}}",
      choices: [],
      repeatable: true,
    },
    {
      id: "ceo-only",
      archetypes: ["ceo"],
      triggerCondition: () => true,
      title: "CEO only",
      body: "CEO",
      choices: [],
      repeatable: true,
    },
    {
      id: "fired-guard",
      archetypes: [],
      triggerCondition: () => true,
      title: "Should skip",
      body: "Skip",
      choices: [],
      repeatable: false,
      firedThisSeason: true,
    },
  ];
}

describe("deterministic RNG in news/event generation", () => {
  it("generateInjuryNews fallback is deterministic with same seed and stable IDs", () => {
    const one = generateInjuryNews([], context, 123456);
    const two = generateInjuryNews([], context, 123456);

    expect(one.map((n) => n.id)).toEqual(two.map((n) => n.id));
    expect(one.map((n) => n.headline)).toEqual(two.map((n) => n.headline));
    expect(one).toEqual(two);
  });

  it("generateInjuryNews fallback varies with different seeds", () => {
    const one = generateInjuryNews([], context, 1001);
    const two = generateInjuryNews([], context, 1002);
    expect(one.map((n) => n.headline).join("|")).not.toEqual(two.map((n) => n.headline).join("|"));
  });

  it("generateInjuryNews fallback count is in [2,4] and durations in [1,3]", () => {
    const out = generateInjuryNews([], context, 7777);
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out.length).toBeLessThanOrEqual(4);

    for (const item of out) {
      const match = item.headline.match(/—\s*(\d+)\s+week\(s\)/i);
      expect(match).not.toBeNull();
      const duration = Number(match?.[1]);
      expect(duration).toBeGreaterThanOrEqual(1);
      expect(duration).toBeLessThanOrEqual(3);
    }
  });

  it("real injury path is unchanged by seed", () => {
    const injuries: Injury[] = [
      {
        id: "inj-1",
        playerId: "P001",
        teamId: "TEAM_A",
        injuryType: "Hamstring",
        bodyArea: "UPPER_LEG",
        severity: "MODERATE",
        status: "OUT",
        startWeek: 6,
        expectedReturnWeek: 9,
        isSeasonEnding: false,
      },
    ];

    const one = generateInjuryNews(injuries, context, 11);
    const two = generateInjuryNews(injuries, context, 99);
    expect(one).toEqual(two);
  });

  it("pickEventForContext is deterministic for same seed and can vary across seeds", () => {
    const events = mkEvents();
    const one = pickEventForContext(events, mkCtx(9090));
    const two = pickEventForContext(events, mkCtx(9090));
    const three = pickEventForContext(events, mkCtx(9091));

    expect(one?.id).toEqual(two?.id);
    expect(one?.body).toEqual(two?.body);
    expect(one?.id).not.toBe("fired-guard");
    expect(one?.id).not.toBeUndefined();

    const varied = one?.id !== three?.id || one?.body !== three?.body;
    expect(varied).toBe(true);
  });

  it("pickEventForContext respects archetype filter and firedThisSeason guard", () => {
    const events = mkEvents();
    const nonCeoCtx = mkCtx(4444, "builder");

    const seen = new Set<string>();
    for (let i = 0; i < 25; i += 1) {
      const out = pickEventForContext(events, { ...nonCeoCtx, seed: 4444 + i });
      if (out?.id) seen.add(out.id);
    }

    expect(seen.has("ceo-only")).toBe(false);
    expect(seen.has("fired-guard")).toBe(false);
  });
});
