export type TxKind =
  | "RESIGN"
  | "FRANCHISE_TAG"
  | "FRANCHISE_TAG_REMOVE"
  | "CUT"
  | "RELEASE"
  | "SIGN_FA"
  | "TRADE"
  | "DRAFT_PICK"
  | "ROOKIE_SIGN"
  | "MIGRATION";

export type TransactionEvent = {
  txId: string;
  season: number;
  weekIndex: number;
  ts: number;
  kind: TxKind;
  teamId: string;
  otherTeamId?: string;
  playerIds: string[];
  details: Record<string, any>;
};

export type TransactionLedger = {
  events: TransactionEvent[];
  counter: number;
  migrationComplete?: boolean;
};
