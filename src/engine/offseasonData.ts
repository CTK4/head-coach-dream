export type ResignOffer = {
  years: number;
  apy: number;
  guaranteesPct: number;
  discountPct: number;
  createdFrom?: "AUDIT" | "RESIGN_SCREEN";
  rejectedCount?: number;
};

export type ResignDecision = {
  action: "RESIGN" | "TAG" | "LET_WALK" | "EXTEND_EARLY" | "TRADE" | "TAG_FRANCHISE" | "TAG_TRANSITION";
  years?: number;
  apy?: number;
  offer?: ResignOffer;
};
export type ScoutingCombineResult = { id: string; name: string; pos: string; forty: number; shuttle: number; threeCone: number; grade: number };
export type FreeAgentOffer = { id: string; playerId: string; name: string; pos: string; years: number; apy: number; interest: number };
export type Prospect = {
  id: string;
  name: string;
  pos: string;
  archetype: string;
  grade: number;
  ras: number;
  interview: number;
  trueGrade?: number;
  scoutedGrade?: number;
  sigma?: number;
  tier?: number;
  tierConfidence?: number;
  consensusTier?: number;
};
export type CampSettings = {
  intensity: "LOW" | "NORMAL" | "HIGH";
  installFocus: "BALANCED" | "OFFENSE" | "DEFENSE";
  positionFocus: "NONE" | "QB" | "OL" | "DL" | "DB" | "WR" | "RB" | "LB" | "TE";
};
export type CutDecision = { keep: boolean };
