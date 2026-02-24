import type { DriveLogEntry, PlayType } from "@/engine/gameSim";
import type { GameLogEntry, LogEntryType } from "@/components/GameLog/types";

function inferType(entry: DriveLogEntry): LogEntryType {
  const playType = entry.playType;
  const result = entry.result.toLowerCase();

  if (result.includes("penalty")) return "penalty";
  if (result.includes("touchdown") || playType === "FG") return "scoring";
  if (result.includes("intercept") || result.includes("fumble") || result.includes("turnover")) return "turnover";
  if (playType === "SPIKE" || playType === "KNEEL") return "timeout";

  if (isRun(playType)) return "run";
  return "pass";
}

function isRun(playType: PlayType): boolean {
  return playType === "INSIDE_ZONE" || playType === "OUTSIDE_ZONE" || playType === "POWER" || playType === "RUN";
}

function extractYardage(result: string): number | undefined {
  const match = result.match(/(-?\d+)\s*yd/i);
  if (!match) return undefined;
  return Number(match[1]);
}

export function adaptDriveLog(driveLog: DriveLogEntry[]): GameLogEntry[] {
  if (!Array.isArray(driveLog) || driveLog.length === 0) return [];

  return driveLog.map((entry, index) => {
    const inferredType = inferType(entry);
    const stableId = `${entry.drive}-${entry.play}-${entry.playType}-${entry.clockSec}-${index}`;
    const fatiguePeak = typeof entry.result === "string" ? undefined : undefined;

    return {
      id: stableId,
      quarter: entry.quarter,
      timestamp: entry.clockSec,
      type: inferredType,
      description: entry.result,
      yardage: extractYardage(entry.result),
      isFirstDown: /1st down/i.test(entry.result),
      isTouchdown: /touchdown/i.test(entry.result),
      personnelPackage: entry.personnelPackage,
      fatiguePeak,
    };
  });
}
