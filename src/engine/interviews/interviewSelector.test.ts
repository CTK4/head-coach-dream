import { describe, expect, it } from "vitest";
import bank from "@/data/ugf_interview_bank_150.json";
import { selectInterviewQuestions } from "@/engine/interviews/interviewSelector";

const TEAM_ID = "MILWAUKEE_NORTHSHORE";

describe("selectInterviewQuestions", () => {
  it("is deterministic for same inputs", () => {
    const a = selectInterviewQuestions({ leagueSeed: 12345, teamId: TEAM_ID, saveSlotId: 2, weekIndex: 1, interviewIndex: 0 });
    const b = selectInterviewQuestions({ leagueSeed: 12345, teamId: TEAM_ID, saveSlotId: 2, weekIndex: 1, interviewIndex: 0 });
    expect(a.questions.map((q) => q.question_id)).toEqual(b.questions.map((q) => q.question_id));
  });

  it("returns 6 total questions with 3 contextual and 3 team pool", () => {
    const selected = selectInterviewQuestions({ leagueSeed: 9, teamId: TEAM_ID, saveSlotId: 1, weekIndex: 3, interviewIndex: 0 });
    expect(selected.questions).toHaveLength(6);

    const teamConfig = (bank as any).systems.find((s: any) => s.team.team_id === TEAM_ID);
    const contextualIds = new Set(teamConfig.contextual_pool.questions.map((q: any) => q.question_id));
    const teamIds = new Set(teamConfig.team_pool.questions.map((q: any) => q.question_id));

    const firstThree = selected.questions.slice(0, 3);
    const lastThree = selected.questions.slice(3, 6);

    expect(new Set(firstThree.map((q) => q.question_id)).size).toBe(3);
    expect(new Set(lastThree.map((q) => q.question_id)).size).toBe(3);
    expect(firstThree.every((q) => contextualIds.has(q.question_id))).toBe(true);
    expect(lastThree.every((q) => teamIds.has(q.question_id))).toBe(true);
  });

  it("includes at least one OWNER and one GM from team pool when available", () => {
    const selected = selectInterviewQuestions({ leagueSeed: 77, teamId: TEAM_ID, saveSlotId: 4, weekIndex: 2, interviewIndex: 1 });
    const teamQuestions = selected.questions.slice(3, 6);
    const ownerCount = teamQuestions.filter((q) => q.asker === "OWNER").length;
    const gmCount = teamQuestions.filter((q) => q.asker === "GM").length;

    expect(ownerCount).toBeGreaterThanOrEqual(1);
    expect(gmCount).toBeGreaterThanOrEqual(1);
  });
});
