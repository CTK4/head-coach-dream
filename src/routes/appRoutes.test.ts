import { describe, expect, it } from "vitest";
import { ROUTES } from "@/routes/appRoutes";

describe("app routes contract", () => {
  it("keeps save mode targets distinct", () => {
    expect(ROUTES.storyInterview).toBe("/story/interview");
    expect(ROUTES.freePlaySetup).toBe("/free-play/setup");
    expect(ROUTES.storyInterview).not.toBe(ROUTES.freePlaySetup);
  });

  it("keeps scouting route tree stable", () => {
    expect(ROUTES.scouting.root).toBe("/scouting");
    expect(ROUTES.scouting.wildcard).toBe("/scouting/*");
    expect(ROUTES.scouting.bigBoard).toBe("/scouting/big-board");
    expect(ROUTES.scouting.combine).toBe("/scouting/combine");
    expect(ROUTES.scouting.prospect).toBe("/scouting/prospect/:prospectId");
    expect(ROUTES.scouting.privateWorkouts).toBe("/scouting/private-workouts");
    expect(ROUTES.scouting.workoutsLegacy).toBe("/scouting/workouts");
    expect(ROUTES.scouting.interviews).toBe("/scouting/interviews");
    expect(ROUTES.scouting.medical).toBe("/scouting/medical");
    expect(ROUTES.scouting.allocation).toBe("/scouting/allocation");
    expect(ROUTES.scouting.inSeason).toBe("/scouting/in-season");
  });

  it("keeps offseason route tree stable", () => {
    expect(ROUTES.offseason.root).toBe("/offseason");
    expect(ROUTES.offseason.wildcard).toBe("/offseason/*");
    expect(ROUTES.offseason.draft).toBe("/offseason/draft");
    expect(ROUTES.offseason.trainingCamp).toBe("/offseason/training-camp");
    expect(ROUTES.offseason.cutdowns).toBe("/offseason/cutdowns");
    expect(ROUTES.offseason.combine).toBe("/offseason/combine");
    expect(ROUTES.offseason.preDraft).toBe("/offseason/pre-draft");
  });

  it("keeps legacy redirect targets stable", () => {
    expect(ROUTES.hubPages.scoutingLegacy).toBe("/hub/scouting/*");
    expect(ROUTES.hubPages.offseasonLegacy).toBe("/hub/offseason/*");
    expect(ROUTES.redirects.hubToPrimary.freeAgency).toBe("/free-agency");
    expect(ROUTES.redirects.hubToPrimary.draft).toBe("/offseason/draft");
    expect(ROUTES.redirects.hubToPrimary.trainingCamp).toBe("/offseason/training-camp");
    expect(ROUTES.redirects.hubToPrimary.cutdowns).toBe("/offseason/cutdowns");
    expect(ROUTES.redirects.hubToPrimary.combine).toBe("/offseason/combine");
    expect(ROUTES.redirects.hubToPrimary.preDraft).toBe("/offseason/pre-draft");
    expect(ROUTES.redirects.hubToContracts.capProjection).toBe("/contracts/cap-projection");
    expect(ROUTES.redirects.hubToRoster.playerFallback).toBe("/roster/players");
    expect(ROUTES.redirects.hubToStaff.assistantHiring).toBe("/staff/hire");
    expect(ROUTES.redirects.rosterDefault).toBe("/roster/depth-chart");
    expect(ROUTES.redirects.scoutingWorkoutsLegacy).toBe("/scouting/private-workouts");
  });

  it("builds dynamic helper paths", () => {
    expect(ROUTES.helpers.hubPlayoffGame(7)).toBe("/hub/playoffs/game/7");
    expect(ROUTES.helpers.hubScheduleWeek(3)).toBe("/hub/schedule/week/3");
    expect(ROUTES.helpers.hubScheduleTeam("TEAM_A")).toBe("/hub/schedule/team/TEAM_A");
    expect(ROUTES.helpers.hubScheduleGame("wk1_mia_buf")).toBe("/hub/schedule/game/wk1_mia_buf");
    expect(ROUTES.helpers.hubPlayer("p1")).toBe("/hub/player/p1");
    expect(ROUTES.helpers.rosterPlayer("p2")).toBe("/roster/player/p2");
    expect(ROUTES.helpers.scoutingProspect("pros-1")).toBe("/scouting/prospect/pros-1");
    expect(ROUTES.helpers.scoutingWildcard("combine")).toBe("/scouting/combine");
    expect(ROUTES.helpers.scoutingWildcard()).toBe("/scouting");
    expect(ROUTES.helpers.offseasonWildcard("draft")).toBe("/offseason/draft");
    expect(ROUTES.helpers.offseasonWildcard()).toBe("/offseason");
  });
});
