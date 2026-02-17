import { describe, expect, it } from "vitest";
import { selectInterviewQuestions } from "@/data/interviewQuestions";

const TEAMS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"] as const;

describe("selectInterviewQuestions()", () => {
  it("returns 5..10 questions (deterministic count per team+seed)", () => {
    const seeds = [1, 2, 3, 42, 1337, 2026, 99999];
    for (const teamId of TEAMS) {
      for (const seed of seeds) {
        const qs = selectInterviewQuestions(teamId, seed);
        expect(qs.length).toBeGreaterThanOrEqual(5);
        expect(qs.length).toBeLessThanOrEqual(10);
      }
    }
  });

  it("is deterministic for the same team+seed", () => {
    for (const teamId of TEAMS) {
      const seed = 20260216;
      const a = selectInterviewQuestions(teamId, seed).map((q) => q.id);
      const b = selectInterviewQuestions(teamId, seed).map((q) => q.id);
      expect(a).toEqual(b);
    }
  });

  it("changes when seed changes (usually)", () => {
    for (const teamId of TEAMS) {
      const a = selectInterviewQuestions(teamId, 100).map((q) => q.id);
      const b = selectInterviewQuestions(teamId, 101).map((q) => q.id);
      expect(a.join("|") === b.join("|")).toBe(false);
    }
  });

  it("respects explicit count override", () => {
    const teamId = "MILWAUKEE_NORTHSHORE";
    const seed = 7;
    expect(selectInterviewQuestions(teamId, seed, 5)).toHaveLength(5);
    expect(selectInterviewQuestions(teamId, seed, 10)).toHaveLength(10);
  });
});
