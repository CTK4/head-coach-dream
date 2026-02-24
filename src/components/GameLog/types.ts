export type LogEntryType = "run" | "pass" | "penalty" | "scoring" | "turnover" | "timeout";

export type LogFilter = "all" | "run" | "pass" | "penalty";

export interface GameLogEntry {
  id: string;
  quarter: 1 | 2 | 3 | 4 | "OT";
  timestamp: number;
  type: LogEntryType;
  description: string;
  yardage?: number;
  isFirstDown?: boolean;
  isTouchdown?: boolean;
  personnelPackage?: string;
  fatiguePeak?: number;
}

export interface GameLogProps {
  entries: GameLogEntry[];
  isLive?: boolean;
  onJumpToLatest?: () => void;
  defaultFilter?: LogFilter;
}

const VALID_TYPES: LogEntryType[] = ["run", "pass", "penalty", "scoring", "turnover", "timeout"];
const VALID_QUARTERS: Array<GameLogEntry["quarter"]> = [1, 2, 3, 4, "OT"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizeEntries(raw: unknown[]): GameLogEntry[] {
  if (!Array.isArray(raw)) return [];

  const out: GameLogEntry[] = [];
  raw.forEach((item, index) => {
    if (!isRecord(item)) {
      console.warn(JSON.stringify({ level: "warn", event: "gamelog.drop_entry", reason: "not_object", index }));
      return;
    }

    const id = typeof item.id === "string" ? item.id : "";
    const quarter = item.quarter as GameLogEntry["quarter"];
    const type = item.type as LogEntryType;

    if (!id || !VALID_QUARTERS.includes(quarter) || !VALID_TYPES.includes(type)) {
      console.warn(JSON.stringify({ level: "warn", event: "gamelog.drop_entry", reason: "missing_required", index }));
      return;
    }

    out.push({
      id,
      quarter,
      timestamp: Number(item.timestamp ?? 0),
      type,
      description: typeof item.description === "string" ? item.description : "",
      yardage: typeof item.yardage === "number" ? item.yardage : undefined,
      isFirstDown: typeof item.isFirstDown === "boolean" ? item.isFirstDown : undefined,
      isTouchdown: typeof item.isTouchdown === "boolean" ? item.isTouchdown : undefined,
      personnelPackage: typeof item.personnelPackage === "string" ? item.personnelPackage : undefined,
      fatiguePeak: typeof item.fatiguePeak === "number" ? item.fatiguePeak : undefined,
    });
  });

  return out;
}
