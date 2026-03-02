export type FeedbackCategory =
  | "CAP_CHANGE"
  | "ROSTER_CHANGE"
  | "DRAFT_SELECTION"
  | "INJURY_ALERT"
  | "HOT_SEAT"
  | "MILESTONE"
  | "TRADE_COMPLETE"
  | "FA_SIGNED";

export interface FeedbackEvent {
  id: string;
  category: FeedbackCategory;
  title: string;
  body: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  teamIds?: string[];
  playerIds?: string[];
  capDelta?: number;
  timestamp: number;
}

type BasePayload = Partial<Pick<FeedbackEvent, "severity" | "teamIds" | "playerIds" | "capDelta">>;

export type FeedbackPayloadByCategory = {
  CAP_CHANGE: BasePayload & { playerName: string; capDelta: number; remainingCap: number };
  ROSTER_CHANGE: BasePayload & { playerName: string; position: string; action: "added to roster" | "waived" | "placed on IR" | "activated" };
  DRAFT_SELECTION: BasePayload & { pickNumber: number; playerName: string; position: string; college: string; scoutingGrade: string; tierLabel: string };
  INJURY_ALERT: BasePayload & { playerName: string; injuryType: string; estimatedWeeks?: number; seasonEnding?: boolean };
  HOT_SEAT: BasePayload & { message: string };
  MILESTONE: BasePayload & { title: string; body: string };
  TRADE_COMPLETE: BasePayload & { sentSummary: string; receivedSummary: string };
  FA_SIGNED: BasePayload & { playerName: string; position: string; years: number; totalValue: string; capHit: string };
};

function formatCap(capDelta: number): string {
  const abs = Math.abs(Number(capDelta || 0));
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}M`;
  return `$${abs.toFixed(0)}K`;
}

export function createFeedbackEvent<C extends FeedbackCategory>(category: C, payload: FeedbackPayloadByCategory[C]): FeedbackEvent {
  const id = `${category}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = Date.now();

  switch (category) {
    case "CAP_CHANGE": {
      const p = payload as FeedbackPayloadByCategory["CAP_CHANGE"];
      return {
        id,
        category,
        title: "Cap Space Updated",
        body: `${p.playerName} signed. ${p.capDelta > 0 ? "+" : ""}${formatCap(p.capDelta)} against cap. ${formatCap(p.remainingCap)} remaining.`,
        severity: p.severity ?? "INFO",
        capDelta: p.capDelta,
        teamIds: p.teamIds,
        playerIds: p.playerIds,
        timestamp,
      };
    }
    case "ROSTER_CHANGE": {
      const p = payload as FeedbackPayloadByCategory["ROSTER_CHANGE"];
      return { id, category, title: "Roster Move", body: `${p.playerName} (${p.position}) ${p.action}.`, severity: p.severity ?? "INFO", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
    case "DRAFT_SELECTION": {
      const p = payload as FeedbackPayloadByCategory["DRAFT_SELECTION"];
      return { id, category, title: `Pick ${p.pickNumber} — ${p.playerName}`, body: `${p.position}, ${p.college}. ${p.scoutingGrade} grade. ${p.tierLabel}.`, severity: p.severity ?? "INFO", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
    case "INJURY_ALERT": {
      const p = payload as FeedbackPayloadByCategory["INJURY_ALERT"];
      const critical = p.seasonEnding || (p.estimatedWeeks ?? 0) >= 4;
      const severity = p.severity ?? (critical ? "CRITICAL" : (p.estimatedWeeks ?? 0) >= 1 ? "WARNING" : "INFO");
      return {
        id,
        category,
        title: "Injury Alert",
        body: severity === "CRITICAL"
          ? `${p.playerName} OUT for season — ${p.injuryType}`
          : `${p.playerName} questionable — ${p.injuryType}, ${Math.max(1, Number(p.estimatedWeeks ?? 1))} week(s)`,
        severity,
        teamIds: p.teamIds,
        playerIds: p.playerIds,
        timestamp,
      };
    }
    case "HOT_SEAT": {
      const p = payload as FeedbackPayloadByCategory["HOT_SEAT"];
      return { id, category, title: "Owner Concern", body: p.message, severity: p.severity ?? "WARNING", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
    case "TRADE_COMPLETE": {
      const p = payload as FeedbackPayloadByCategory["TRADE_COMPLETE"];
      return { id, category, title: "Trade Completed", body: `You sent: ${p.sentSummary}. You received: ${p.receivedSummary}.`, severity: p.severity ?? "INFO", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
    case "FA_SIGNED": {
      const p = payload as FeedbackPayloadByCategory["FA_SIGNED"];
      return { id, category, title: "Free Agent Signed", body: `${p.playerName}, ${p.position} — ${p.years} yr / ${p.totalValue}. ${p.capHit} cap hit this season.`, severity: p.severity ?? "INFO", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
    case "MILESTONE": {
      const p = payload as FeedbackPayloadByCategory["MILESTONE"];
      return { id, category, title: p.title, body: p.body, severity: p.severity ?? "INFO", teamIds: p.teamIds, playerIds: p.playerIds, timestamp };
    }
  }
}
