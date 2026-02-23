export type RoleExpectation = "STARTER" | "ROTATIONAL" | "DEPTH";

export type PlayerMorale = {
  morale: number;
  roleExpectation: RoleExpectation;
  playingTimeSatisfaction: number;
  tradeRequest?: boolean;
};

export type MoraleContext = {
  teamWins: number;
  teamLosses: number;
  isContractYear: boolean;
  roleChanged?: boolean;
  strategyModeFit?: number;
  seed?: number;
  playerRespect?: number;
  lockerRoomCred?: number;
};

export type WeekStats = {
  snapsPlayed: number;
  snapsExpected: number;
};

export type MoraleModifier = {
  label: string;
  value: number;
};

export type MoraleResult = {
  morale: number;
  playingTimeSatisfaction: number;
  tradeRequest: boolean;
  topModifiers: MoraleModifier[];
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicRand(seed: number, key: string): number {
  return (fnv1a32(`${seed}|${key}`) & 0xffffff) / 0x1000000;
}

function snapDelta(actual: number, expected: number): number {
  if (expected <= 0) return 0;
  return (actual - expected) / expected;
}

export function updateMorale(
  player: PlayerMorale,
  ctx: MoraleContext,
  weekStats: WeekStats,
): MoraleResult {
  const modifiers: MoraleModifier[] = [];

  // Playing time delta vs expectation
  const delta = snapDelta(weekStats.snapsPlayed, weekStats.snapsExpected);
  const ptImpact = clamp(delta * 15, -20, 20);
  modifiers.push({ label: "Playing time", value: ptImpact });

  // Win/loss impact
  const totalGames = ctx.teamWins + ctx.teamLosses;
  const winPct = totalGames > 0 ? ctx.teamWins / totalGames : 0.5;
  const winImpact = clamp((winPct - 0.5) * 20, -8, 8);
  modifiers.push({ label: "Team record", value: winImpact });

  // Role change penalty
  if (ctx.roleChanged) {
    modifiers.push({ label: "Role change", value: -8 });
  }

  // Contract year boost
  if (ctx.isContractYear) {
    modifiers.push({ label: "Contract year motivation", value: 5 });
  }

  const respectImpact = clamp(((ctx.playerRespect ?? 50) - 50) * 0.08, -4, 4);
  if (Math.abs(respectImpact) >= 1) modifiers.push({ label: "Coach respect", value: respectImpact });

  const lockerImpact = clamp(((ctx.lockerRoomCred ?? 50) - 50) * 0.1, -5, 5);
  if (Math.abs(lockerImpact) >= 1) modifiers.push({ label: "Locker room leadership", value: lockerImpact });

  // Strategy mode fit
  if (ctx.strategyModeFit != null) {
    const fitImpact = clamp((ctx.strategyModeFit - 50) * 0.1, -5, 5);
    if (Math.abs(fitImpact) >= 1) {
      modifiers.push({ label: "Scheme fit", value: fitImpact });
    }
  }

  const totalDelta = modifiers.reduce((s, m) => s + m.value, 0);
  const newMorale = clamp(Math.round(player.morale + totalDelta * 0.5), 0, 100);
  const newPtSatisfaction = clamp(Math.round(delta * 100), -100, 100);

  // Sort by magnitude for top 3
  const topModifiers = modifiers
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 3);

  // Trade request logic
  const tradeRequestRoll = deterministicRand(ctx.seed ?? 0, `TR|${player.morale}|${newMorale}`);
  const tradeRequest =
    newMorale < 30
      ? true
      : newMorale < 40
      ? player.tradeRequest ?? tradeRequestRoll < 0.15
      : player.tradeRequest ?? false;

  return {
    morale: newMorale,
    playingTimeSatisfaction: newPtSatisfaction,
    tradeRequest,
    topModifiers,
  };
}

export function moraleChipColor(morale: number): string {
  if (morale >= 70) return "bg-emerald-500/20 border-emerald-400/40 text-emerald-200";
  if (morale >= 50) return "bg-yellow-500/20 border-yellow-400/40 text-yellow-200";
  if (morale >= 30) return "bg-orange-500/20 border-orange-400/40 text-orange-200";
  return "bg-red-500/20 border-red-400/40 text-red-200";
}
