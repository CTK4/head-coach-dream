export interface DraftPick {
  round: number;
  year: number;
  originalTeamId: string;
  currentTeamId: string;
}

export interface TradeSide {
  teamId: string;
  players: string[];
  draftPicks: DraftPick[];
}

export interface TradeProposal {
  id: string;
  initiatorSide: TradeSide;
  receiverSide: TradeSide;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";
  counterProposal?: TradeProposal;
  valueDelta: number;
  aiWillingnessScore: number;
  // optional UI helpers
  offeredPositions?: string[];
  initiatorPlayerPool?: Array<{ playerId: string; pos?: string }>;
}

export interface TradeResponse {
  decision: "ACCEPT" | "REJECT" | "COUNTER";
  counterProposal?: TradeProposal;
  message: string;
}
