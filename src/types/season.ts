export type SeasonSummary = {
  tenureYear: number;
  wins: number;
  losses: number;
  playoffResult: "missed" | "wildCard" | "divisional" | "conference" | "superbowlLoss" | "champion";
  finalStanding: number;
  divisionWinner: boolean;
  offenseRank: number;
  defenseRank: number;
  specialTeamsRank: number;
  reputationSnapshot: {
    leaguePrestige: number;
    offCred: number;
    defCred: number;
    leadershipTrust: number;
    mediaRep: number;
    playerRespect: number;
  };
  reputationDeltas: {
    leaguePrestige: number;
    offCred: number;
    defCred: number;
    leadershipTrust: number;
    mediaRep: number;
    playerRespect: number;
  };
  ownerConfidence: number;
  gmRelationship: number;
  lockerRoomCred: number;
  volatilityEvents: number;
  archetypeId: string;
};
