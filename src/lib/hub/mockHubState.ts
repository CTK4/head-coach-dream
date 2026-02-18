export type HubActionItem = {
  id: string;
  title: string;
  description: string;
  urgency: "Critical" | "High" | "Medium" | "Low";
  blocking: boolean;
  primaryCta: { label: string; route: string };
};

export type HubState = {
  year: number;
  record: string;
  phase: string;
  capRoom: string;
  draftPick: string;
  roster: {
    active: number;
    limit: number;
    rosterHoles: number;
  };
  draft: {
    nextPickOverall: number;
    beginsInLabel: string;
  };
  freeAgencyPreview: {
    classGrade: string;
    top3: [string, string, string];
  };
  actionItems: HubActionItem[];
};

export function mockHubState(): HubState {
  return {
    year: 2026,
    record: "10-7",
    phase: "Offseason",
    capRoom: "$17.6M",
    draftPick: "#23",
    roster: { active: 51, limit: 53, rosterHoles: 2 },
    draft: { nextPickOverall: 23, beginsInLabel: "7 Hours" },
    freeAgencyPreview: {
      classGrade: "A",
      top3: ["C. Wallace • WR", "A. Ramsey • CB", "M. Jordan • HB"],
    },
    actionItems: [
      {
        id: "hire_staff",
        title: "Hire Coordinators",
        description: "Fill OC/DC roles before scheme install planning begins.",
        urgency: "Critical",
        blocking: true,
        primaryCta: { label: "Go to Hiring", route: "/staff/hire" },
      },
      {
        id: "cap_rollover",
        title: "Finalize Cap Rollover",
        description: "Apply carryover and incentive true-ups to lock your adjusted cap baseline.",
        urgency: "High",
        blocking: false,
        primaryCta: { label: "Review Finances", route: "/finances?tab=cap" },
      },
      {
        id: "depth_chart",
        title: "Fix Depth Chart Holes",
        description: "2 position groups have empty slots. Use Reset to Best to auto-fill.",
        urgency: "Medium",
        blocking: false,
        primaryCta: { label: "Open Depth Chart", route: "/team/depth-chart" },
      },
      {
        id: "fa_preview",
        title: "Scout Free Agency Class",
        description: "Top-of-market WR/CB are available. Set targets before negotiations open.",
        urgency: "Low",
        blocking: false,
        primaryCta: { label: "Early Look", route: "/free-agency/preview" },
      },
    ],
  };
}
