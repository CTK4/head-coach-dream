export type InterviewAxis =
  | "stability"
  | "aggression"
  | "media_sensitivity"
  | "accountability"
  | "timeline_urgency"
  | "ego_compatibility"
  | "autonomy_desire"
  | "loyalty_continuity"
  | "player_empowerment"
  | "risk_appetite";

export type OwnerProfile = {
  ownerId: string;
  displayName: string;
  teamId: string;
  axisWeights: Record<InterviewAxis, number>;
};

export const ownerProfilesByTeam: Record<string, OwnerProfile> = {
  MILWAUKEE_NORTHSHORE: {
    ownerId: "CON_OWN_0027",
    displayName: "Elaine",
    teamId: "MILWAUKEE_NORTHSHORE",
    axisWeights: {
      stability: 1.3,
      aggression: -0.3,
      media_sensitivity: 0.7,
      accountability: 1.6,
      timeline_urgency: 0.6,
      ego_compatibility: 1.4,
      autonomy_desire: -0.8,
      loyalty_continuity: 1.1,
      player_empowerment: 0.4,
      risk_appetite: -0.5,
    },
  },
  ATLANTA_APEX: {
    ownerId: "CON_OWN_0019",
    displayName: "Marcus",
    teamId: "ATLANTA_APEX",
    axisWeights: {
      stability: 0.5,
      aggression: 1.2,
      media_sensitivity: 1.4,
      accountability: 0.7,
      timeline_urgency: 1.3,
      ego_compatibility: 1.0,
      autonomy_desire: 0.2,
      loyalty_continuity: -0.4,
      player_empowerment: 0.6,
      risk_appetite: 1.1,
    },
  },
  BIRMINGHAM_VULCANS: {
    ownerId: "CON_OWN_0001",
    displayName: "Owner",
    teamId: "BIRMINGHAM_VULCANS",
    axisWeights: {
      stability: 0.9,
      aggression: 0.4,
      media_sensitivity: 0.5,
      accountability: 1.0,
      timeline_urgency: 0.9,
      ego_compatibility: 0.8,
      autonomy_desire: -0.2,
      loyalty_continuity: 0.6,
      player_empowerment: 0.3,
      risk_appetite: 0.2,
    },
  },
};
