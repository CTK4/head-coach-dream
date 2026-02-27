import { describe, expect, it } from "vitest";
import { getTeamConfig } from "@/engine/interviewHiring/bankLoader";
import { selectInterviewQuestions } from "@/engine/interviews/interviewSelector";

const STORY_TEAM_IDS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"] as const;

describe("selectInterviewQuestions", () => {
  it("is deterministic for same inputs", () => {
    const a = selectInterviewQuestions({ leagueSeed: 12345, teamId: "MILWAUKEE_NORTHSHORE", saveSlotId: 2, weekIndex: 1, interviewIndex: 0 });
    const b = selectInterviewQuestions({ leagueSeed: 12345, teamId: "MILWAUKEE_NORTHSHORE", saveSlotId: 2, weekIndex: 1, interviewIndex: 0 });
    expect(a.questions.map((q) => q.question_id)).toEqual(b.questions.map((q) => q.question_id));
  });

  it("returns 6 questions for each story team with contextual then team/fallback questions", () => {
    for (const teamId of STORY_TEAM_IDS) {
      const selected = selectInterviewQuestions({ leagueSeed: 9, teamId, saveSlotId: 1, weekIndex: 3, interviewIndex: 0 });
      expect(selected.questions).toHaveLength(6);

      const firstThree = selected.questions.slice(0, 3);
      const lastThree = selected.questions.slice(3, 6);

      expect(firstThree.every((q) => q.sourceBucket === "contextual")).toBe(true);
      expect(lastThree.every((q) => q.sourceBucket === "team_pool" || q.sourceBucket === "fallback_pool")).toBe(true);
    }
  });

  it("satisfies owner/gm minimums on final three when the team pool supports constraints", () => {
    for (const teamId of STORY_TEAM_IDS) {
      const config = getTeamConfig(teamId);
      const constraints = config.interview_flow.mix_rules.team_pool_questions.constraints;
      const teamPool = config.team_pool.questions ?? [];
      const ownerAvailable = teamPool.some((q) => q.asker === "OWNER");
      const gmAvailable = teamPool.some((q) => q.asker === "GM");
      if ((constraints?.min_owner_questions ?? 0) > 0 && !ownerAvailable) continue;
      if ((constraints?.min_gm_questions ?? 0) > 0 && !gmAvailable) continue;

      const selected = selectInterviewQuestions({ leagueSeed: 77, teamId, saveSlotId: 4, weekIndex: 2, interviewIndex: 1 });
      const teamQuestions = selected.questions.slice(3, 6).filter((q) => q.sourceBucket === "team_pool");
      const ownerCount = teamQuestions.filter((q) => q.asker === "OWNER").length;
      const gmCount = teamQuestions.filter((q) => q.asker === "GM").length;

      expect(ownerCount).toBeGreaterThanOrEqual(constraints?.min_owner_questions ?? 0);
      expect(gmCount).toBeGreaterThanOrEqual(constraints?.min_gm_questions ?? 0);
    }
  });
});
