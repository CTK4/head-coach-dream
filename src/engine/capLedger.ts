import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";

const LEAGUE_CAP_DEFAULT = 250_000_000;
const moneyRound = (n: number) => Math.round(n / 50_000) * 50_000;

export type CapLedgerOptions = {
  useTop51?: boolean;
  capOverride?: number;
};

export type LedgerLineId =
  | "LEAGUE_CAP"
  | "CARRYOVER"
  | "INCENTIVE_TRUE_UPS"
  | "DEAD_CAP_CHARGES"
  | "ADJUSTED_CAP"
  | "TOP_51"
  | "AVAILABLE_CAP";

export type LedgerDetailRow = {
  id: string;
  label: string;
  value: number;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

export type CapLedgerLine = {
  id: LedgerLineId;
  label: string;
  value: number;
  details?: LedgerDetailRow[];
};

export type CapLedgerSnapshotV2 = {
  teamId: string;
  season: number;
  capMode: "STANDARD" | "POST_JUNE_1";
  lines: CapLedgerLine[];
  dead: {
    thisYear: number;
    nextYear: number;
    voidYearAccelPending: number;
  };
  top51: {
    total: number;
    items: Array<{ playerId: string; name: string; pos: string; capHit: number; yearsLeft: number }>;
  };
  alerts: {
    overCap: boolean;
    june1ReliefAvailable: boolean;
    highDeadCapRisk: boolean;
  };
};

export function computeCapLedger(state: GameState, teamId: string, opts: CapLedgerOptions = {}) {
  const cap =
    Number.isFinite(opts.capOverride)
      ? (opts.capOverride as number)
      : Number.isFinite((state as any).finances?.cap)
        ? (state as any).finances.cap
        : LEAGUE_CAP_DEFAULT;

  const roster = getEffectivePlayersByTeam(state, teamId).map((p: any) => {
    const s = getContractSummaryForPlayer(state, String(p.playerId));
    const capHit = moneyRound(Number(s?.capHit ?? 0) || 0);

    return {
      playerId: String(p.playerId),
      name: String(p.fullName ?? p.name ?? "Unknown"),
      pos: String(p.pos ?? "UNK"),
      capHit,
      yearsLeft: Number(s?.yearsRemaining ?? 0) || 0,
    };
  });

  const committedAll = moneyRound(roster.reduce((sum, r) => sum + (Number(r.capHit) || 0), 0));
  const committedTop51 = moneyRound(
    roster
      .slice()
      .sort((a, b) => (b.capHit || 0) - (a.capHit || 0))
      .slice(0, 51)
      .reduce((sum, r) => sum + (Number(r.capHit) || 0), 0),
  );

  const useTop51 = Boolean(opts.useTop51);
  const committed = useTop51 ? committedTop51 : committedAll;
  const capSpace = moneyRound(cap - committed);

  return {
    cap,
    committed,
    capSpace,
    mode: useTop51 ? "TOP_51" : "ALL_PLAYERS",
    roster,
  };
}

export function computeCapLedgerV2(state: GameState, teamId: string): CapLedgerSnapshotV2 {
  const cap = moneyRound(Number(state.finances.cap ?? 0));
  const carryover = moneyRound(Number(state.finances.carryover ?? 0));
  const incentiveTrueUps = moneyRound(Number(state.finances.incentiveTrueUps ?? 0));
  const deadThisYear = moneyRound(Number(state.finances.deadCapThisYear ?? 0));
  const deadNextYear = moneyRound(Number(state.finances.deadCapNextYear ?? 0));

  const roster = getEffectivePlayersByTeam(state, teamId)
    .map((p: any) => {
      const s = getContractSummaryForPlayer(state, String(p.playerId));
      const capHit = moneyRound(Number(s?.capHitBySeason?.[state.season] ?? s?.capHit ?? 0));
      return {
        playerId: String(p.playerId),
        name: String(p.fullName ?? "Unknown"),
        pos: String(p.pos ?? "UNK"),
        capHit,
        yearsLeft: Math.max(0, Number(s?.yearsRemaining ?? 0)),
      };
    })
    .filter((r) => r.capHit > 0)
    .sort((a, b) => b.capHit - a.capHit);

  const top51Items = roster.slice(0, 51);
  const top51Total = moneyRound(top51Items.reduce((a, b) => a + b.capHit, 0));

  const adjustedCap = moneyRound(cap + carryover + incentiveTrueUps - deadThisYear);
  const availableCap = moneyRound(adjustedCap - top51Total);

  const cutDes = state.offseasonData?.rosterAudit?.cutDesignations ?? {};
  const june1ReliefAvailable = Object.values(cutDes).some((v) => v === "POST_JUNE_1");

  const highDeadCapRisk = deadThisYear >= cap * 0.12;

  const lines: CapLedgerLine[] = [
    {
      id: "LEAGUE_CAP",
      label: "League Salary Cap",
      value: cap,
      details: [{ id: "cap", label: "League cap", value: cap }],
    },
    {
      id: "CARRYOVER",
      label: "Prior-Year Carryover",
      value: carryover,
      details: [{ id: "carryover", label: "Carryover (user/team)", value: carryover }],
    },
    {
      id: "INCENTIVE_TRUE_UPS",
      label: "Incentive True-Ups",
      value: incentiveTrueUps,
      details: [{ id: "trueups", label: "Incentive true-ups", value: incentiveTrueUps }],
    },
    {
      id: "DEAD_CAP_CHARGES",
      label: "Dead Cap Charges",
      value: -deadThisYear,
      details: [{ id: "dead_this", label: "Dead cap (this year)", value: -deadThisYear }],
    },
    {
      id: "ADJUSTED_CAP",
      label: "Adjusted Cap",
      value: adjustedCap,
    },
    {
      id: "TOP_51",
      label: "Top 51 Charges",
      value: -top51Total,
      details: top51Items.map((p) => ({
        id: p.playerId,
        label: `${p.name} (${p.pos})`,
        value: -p.capHit,
        meta: { yearsLeft: p.yearsLeft },
      })),
    },
    {
      id: "AVAILABLE_CAP",
      label: "Current Available Cap",
      value: availableCap,
    },
  ];

  return {
    teamId: String(teamId),
    season: Number(state.season),
    capMode: state.finances.postJune1Sim ? "POST_JUNE_1" : "STANDARD",
    lines,
    dead: { thisYear: deadThisYear, nextYear: deadNextYear, voidYearAccelPending: 0 },
    top51: { total: top51Total, items: top51Items },
    alerts: {
      overCap: availableCap < 0,
      june1ReliefAvailable,
      highDeadCapRisk,
    },
  };
}
