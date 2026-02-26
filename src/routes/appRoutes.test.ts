import { describe, expect, it } from "vitest";
import { ROUTES } from "@/routes/appRoutes";

describe("app routes", () => {
  it("keeps save mode targets distinct", () => {
    expect(ROUTES.storyInterview).toBe("/story/interview");
    expect(ROUTES.freePlaySetup).toBe("/free-play/setup");
    expect(ROUTES.storyInterview).not.toBe(ROUTES.freePlaySetup);
  });
});
