export type PlayerId = string;

export type FatigueTrackedPosition = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB";

export type TrackedPlayersLegacy = Partial<Record<FatigueTrackedPosition, PlayerId>>;

export type OffenseTrackedPlayersV1 = Partial<{
  QB1: PlayerId; RB1: PlayerId;
  WR1: PlayerId; WR2: PlayerId; WR3: PlayerId; WR4: PlayerId;
  TE1: PlayerId; TE2: PlayerId;
  FB1: PlayerId;
  LT1: PlayerId; LG1: PlayerId; C1: PlayerId; RG1: PlayerId; RT1: PlayerId;
}>;

export type DefenseTrackedPlayersV1 = Partial<{
  CB1: PlayerId; CB2: PlayerId; NB: PlayerId;
  FS: PlayerId; SS: PlayerId;
  LB1: PlayerId; LB2: PlayerId;
  EDGE_L: PlayerId; EDGE_R: PlayerId;
  DT1: PlayerId; DT2: PlayerId;
  OLB_L: PlayerId; OLB_R: PlayerId;
  DE_L: PlayerId; DE_R: PlayerId;
  NT: PlayerId;
}>;

export type TrackedPlayersBySide = TrackedPlayersLegacy & OffenseTrackedPlayersV1 & DefenseTrackedPlayersV1;

export type TrackedPlayers = Partial<Record<"HOME" | "AWAY", TrackedPlayersBySide>>;
