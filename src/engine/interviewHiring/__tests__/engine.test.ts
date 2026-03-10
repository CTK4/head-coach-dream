import { describe, expect, it } from "vitest";
import { getTeamConfig, loadInterviewBank } from "@/engine/interviewHiring/bankLoader";
import { createInterviewSeed, generateInterview, scoreInterview } from "@/engine/interviewHiring/engine";
import type { TeamConfig } from "@/engine/interviewHiring/types";

function teamWithQuestions(): TeamConfig {
  const systems = loadInterviewBank().systems;
  const found = systems.find((s) => s.team_pool.questions?.length);
  if (!found) {
    throw new Error("No team with embedded team_pool questions found.");
  }
  return getTeamConfig(found.team.team_id);
}

describe("interview hiring engine", () => {
  it("loads bank and resolves a known team id", () => {
    const systems = loadInterviewBank().systems;
    expect(systems.length).toBeGreaterThan(0);
    const knownTeamId = systems[0].team.team_id;
    const config = getTeamConfig(knownTeamId);
    expect(config.team.team_id).toBe(knownTeamId);
  });

  it("is deterministic for same seed inputs", () => {
    const config = teamWithQuestions();
    const seed = createInterviewSeed(101, 202, 1, 4, 0);
    const first = generateInterview(config, seed);
    const second = generateInterview(config, seed);
    expect(first.questions.map((q) => q.question.question_id)).toEqual(second.questions.map((q) => q.question.question_id));
  });

  it("does not produce duplicate questions", () => {
    const config = teamWithQuestions();
    const seed = createInterviewSeed(9, 8, 1, 2, 0);
    const session = generateInterview(config, seed);
    const ids = session.questions.map((q) => q.question.question_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(6);
  });

  it("satisfies team pool owner/gm constraints when configured", () => {
    const config = teamWithQuestions();
    const constraints = config.interview_flow.mix_rules.team_pool_questions.constraints;
    if (!constraints) return;
    const session = generateInterview(config, createInterviewSeed(11, 22, 1, 1, 1));
    const teamPool = session.questions.filter((q) => q.source === "team_pool");
    const owners = teamPool.filter((q) => q.question.asker?.toLowerCase() === "owner").length;
    const gms = teamPool.filter((q) => q.question.asker?.toLowerCase() === "gm").length;
    expect(owners).toBeGreaterThanOrEqual(constraints.min_owner_questions ?? 0);
    expect(gms).toBeGreaterThanOrEqual(constraints.min_gm_questions ?? 0);
  });

  it("applies per-answer and global clamps", () => {
    const config = getTeamConfig("BIRMINGHAM_VULCANS");
    const selectedQuestions = [
      { source: "contextual" as const, question: config.contextual_pool.questions[0] },
      { source: "team_pool" as const, question: config.team_pool.questions![0] },
    ];
    const answers = {
      [selectedQuestions[0].question.question_id]: selectedQuestions[0].question.options[0].choice_id,
      [selectedQuestions[1].question.question_id]: selectedQuestions[1].question.options[0].choice_id,
    };
    const result = scoreInterview(config, selectedQuestions, answers, 42);
    for (const [key, [min, max]] of Object.entries(config.scoring.clamps)) {
      if (key in result.metrics) {
        expect(result.metrics[key]).toBeGreaterThanOrEqual(min);
        expect(result.metrics[key]).toBeLessThanOrEqual(max);
      }
    }
  });

  it("rejects when critical flag gate is violated", () => {
    const config = getTeamConfig("BIRMINGHAM_VULCANS");
    const flagged = config.team_pool.questions!.find((q) =>
      q.options.some((o) => (o.tags ?? []).some((tag) => config.tag_deltas[tag]?.riskFlag)),
    );
    expect(flagged).toBeTruthy();
    const option = flagged!.options.find((o) => (o.tags ?? []).some((tag) => config.tag_deltas[tag]?.riskFlag))!;

    const selectedQuestions = new Array(3).fill(0).map(() => ({ source: "team_pool" as const, question: flagged! }));
    const answers = Object.fromEntries(
      selectedQuestions.map((q, idx) => [`${q.question.question_id}_${idx}`, option.choice_id]),
    );
    selectedQuestions.forEach((q, idx) => {
      q.question = { ...q.question, question_id: `${q.question.question_id}_${idx}` };
    });

    const result = scoreInterview(config, selectedQuestions, answers, 77);
    expect(result.gatePass).toBe(false);
    expect(result.band).toBe("REJECTED");
  });



  it("scores Atlanta interview with option deltas, rebuild clarity mapping, and risk flags", () => {
    const config = getTeamConfig("ATLANTA_APEX");
    const session = generateInterview(config, createInterviewSeed(303, 404, 1, 2, 0));
    const answers = Object.fromEntries(session.questions.map((q) => [q.question.question_id, q.question.options[0].choice_id]));
    const initial = config.scoring.init as Record<string, number | string[]>;

    const result = scoreInterview(config, session.questions, answers, 2024);

    expect(Number.isFinite(result.metrics.owner_approval)).toBe(true);
    expect(Number.isFinite(result.metrics.gm_approval)).toBe(true);
    expect(result.metrics.owner_approval).not.toBe(initial.owner_approval);
    expect(result.metrics.gm_approval).not.toBe(initial.gm_approval);

    const beforeRebuild = Number(initial.rebuild_clarity);
    expect(Number.isFinite(result.metrics.rebuild_clarity)).toBe(true);
    expect(result.metrics.rebuild_clarity).not.toBe(beforeRebuild);

    const riskQuestion = {
      question_id: "ATL_RISK",
      asker: "OWNER",
      prompt: "Risk control",
      options: [
        {
          choice_id: "A",
          text: "No structure",
          tags: [],
          delta: { owner: -3, gm: -2, riskFlag: "NO_STRUCTURE" } as unknown as Record<string, number>,
        },
      ],
    };

    const riskResult = scoreInterview(
      config,
      [
        { source: "team_pool" as const, question: { ...riskQuestion, question_id: "ATL_RISK_1" } },
        { source: "team_pool" as const, question: { ...riskQuestion, question_id: "ATL_RISK_2" } },
      ],
      { ATL_RISK_1: "A", ATL_RISK_2: "A" },
      88,
    );

    expect(riskResult.flags.some((flag) => flag === "NO_STRUCTURE" || flag === "CHAOTIC_DIRECTION")).toBe(true);
    expect(Number.isFinite(result.hireScore)).toBe(true);
    expect(["HIRED", "BORDERLINE", "REJECTED"]).toContain(result.band);
  });

  it("borderline weighted coinflip is deterministic", () => {
    const config = getTeamConfig("BIRMINGHAM_VULCANS");
    const session = generateInterview(config, createInterviewSeed(500, 900, 1, 1, 0));
    const answers = Object.fromEntries(session.questions.map((q) => [q.question.question_id, q.question.options[0].choice_id]));

    const patched: TeamConfig = JSON.parse(JSON.stringify(config));
    patched.scoring.hire_score.bands = {
      HIRED: { min: 999 },
      BORDERLINE: { min: -999, max: 999 },
      REJECTED: { max: -1000 },
    };

    const first = scoreInterview(patched, session.questions, answers, 123456);
    const second = scoreInterview(patched, session.questions, answers, 123456);
    expect(first.borderlineCoinflip?.used).toBe(true);
    expect(first.borderlineCoinflip).toEqual(second.borderlineCoinflip);
    expect(first.band).toBe(second.band);
  });
});
