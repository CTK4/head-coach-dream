import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { capHitForOverride } from "@/engine/rosterOverlay";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

const CAP_OVERAGE_RE = /^cap overage ([^:]+): used=(\d+) cap=(\d+) delta=(\d+)$/;

export type CapOverageIssue = {
  raw: string;
  teamId: string;
  used: number;
  cap: number;
  delta: number;
};

export function parseCapOverageIssue(error: string): CapOverageIssue | null {
  const match = String(error).match(CAP_OVERAGE_RE);
  if (!match) return null;
  return {
    raw: error,
    teamId: String(match[1]),
    used: Number(match[2]),
    cap: Number(match[3]),
    delta: Number(match[4]),
  };
}

export function partitionValidationErrors(errors: string[]): {
  capOverages: CapOverageIssue[];
  integrityErrors: string[];
} {
  const capOverages: CapOverageIssue[] = [];
  const integrityErrors: string[] = [];
  for (const error of errors) {
    const overage = parseCapOverageIssue(error);
    if (overage) capOverages.push(overage);
    else integrityErrors.push(error);
  }
  return { capOverages, integrityErrors };
}

export function findSmallestEligibleCapRelease(state: GameState, teamId: string): { playerId: string; capHit: number } | null {
  const roster = buildRosterIndex(state);
  const contracts = buildContractIndex(state);
  const currentSeason = Number(state.season);
  const teamPlayers = roster.teamToPlayers[String(teamId)] ?? [];

  let best: { playerId: string; capHit: number } | null = null;
  for (const playerId of teamPlayers) {
    const contract = contracts[playerId] as PlayerContractOverride | undefined;
    if (!contract) continue;
    const capHit = Math.round(capHitForOverride(contract, currentSeason));
    if (!(capHit > 0)) continue;
    if (!best || capHit < best.capHit || (capHit === best.capHit && playerId < best.playerId)) {
      best = { playerId, capHit };
    }
  }
  return best;
}

export function isMinorCapOverage(issue: CapOverageIssue): boolean {
  return Number(issue.delta) < Number(issue.cap) * 0.01;
}

export function markRecoverableCapFailure(state: GameState, issues: CapOverageIssue[]): GameState {
  const nextErrors = [...(state.recoveryErrors ?? [])];
  const issueDetails = issues
    .sort((a, b) => a.teamId.localeCompare(b.teamId))
    .map((issue) => `${issue.teamId} over by ${issue.delta} against cap ${issue.cap}`);
  const message = `Recovery Mode: Salary cap overage requires manual remediation (${issueDetails.join("; ")}).`;
  nextErrors.push(message);
  return {
    ...state,
    recoveryNeeded: true,
    recoveryErrors: Array.from(new Set(nextErrors)),
    uiToast: message,
  };
}
