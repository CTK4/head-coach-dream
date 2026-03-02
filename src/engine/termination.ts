export type OwnerAxes = Partial<Record<
  | "stability"
  | "aggression"
  | "media_sensitivity"
  | "accountability"
  | "timeline_urgency"
  | "ego_compatibility"
  | "autonomy_desire"
  | "loyalty_continuity"
  | "player_empowerment"
  | "risk_appetite",
  number
>>;

export type TerminationInputs = {
  saveSeed: number;
  seasonYear: number;
  seasonNumber: number;
  week: number;
  checkpoint: "WEEKLY" | "SEASON_END";
  jobSecurity: number;
  ownerApproval: number;
  financialRating: number;
  cash: number;
  deadMoneyThisSeason: number;
  budgetBreaches: number;
  ownerAxes?: OwnerAxes;
  goalsDelta?: number;
  winPct?: number;
  lastSeasonWinPct?: number;
};

export type TerminationRisk = {
  p: number;
  drivers: Array<{ label: string; value: number }>;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function deterministicRoll(saveSeed: number, key: string): number {
  return mulberry32(saveSeed ^ hashStr(key))();
}

function axis01(v?: number) {
  if (v == null || !Number.isFinite(v)) return 0.5;
  return clamp01((v + 10) / 20);
}

function ownerVolatility01(axes?: OwnerAxes) {
  const stability = axis01(axes?.stability);
  const aggression = axis01(axes?.aggression);
  const urgency = axis01(axes?.timeline_urgency);
  const accountability = axis01(axes?.accountability);
  const media = axis01(axes?.media_sensitivity);
  const risk = axis01(axes?.risk_appetite);

  return clamp01(
    0.38 * (1 - stability) +
      0.18 * aggression +
      0.18 * urgency +
      0.12 * accountability +
      0.08 * media +
      0.06 * risk
  );
}

export function computeTerminationRisk(i: TerminationInputs): TerminationRisk {
  const js = clamp100(i.jobSecurity);
  const appr = clamp100(i.ownerApproval);
  const fin = clamp100(i.financialRating);

  const baseUnsafe = clamp01((65 - js) / 65);
  const approvalUnsafe = clamp01((60 - appr) / 60);
  const finUnsafe = clamp01((60 - fin) / 60);

  const dmHit = clamp01((i.deadMoneyThisSeason || 0) / 20_000_000);
  const cashNeg = i.cash < 0 ? clamp01(-i.cash / 15_000_000) : 0;
  const breach = clamp01(Math.max(0, (i.budgetBreaches || 0) - 1) / 4);

  const goals = clamp01(Math.max(0, -(i.goalsDelta ?? 0)) / 100);
  const winBad = clamp01(Math.max(0, 0.55 - (i.winPct ?? 0.55)) / 0.55);

  const ov = ownerVolatility01(i.ownerAxes);
  const ownerMult =
    0.85 + 0.65 * ov + 0.25 * axis01(i.ownerAxes?.timeline_urgency) + 0.15 * axis01(i.ownerAxes?.accountability);

  const checkpointBase = i.checkpoint === "WEEKLY" ? 0.002 + 0.02 * baseUnsafe : 0.06 + 0.58 * baseUnsafe;

  let p =
    checkpointBase +
    0.06 * approvalUnsafe +
    0.07 * finUnsafe +
    0.06 * goals +
    0.05 * winBad +
    0.05 * dmHit +
    0.07 * cashNeg +
    0.04 * breach;

  p *= ownerMult;
  p = clamp01(p);

  const drivers = [
    { label: "Job Security", value: clamp100(baseUnsafe * 100) },
    { label: "Owner Approval", value: clamp100(approvalUnsafe * 100) },
    { label: "Financial Stress", value: clamp100((0.5 * finUnsafe + 0.3 * dmHit + 0.2 * cashNeg) * 100) },
    { label: "Goals Missed", value: clamp100(goals * 100) },
    { label: "Win Pressure", value: clamp100(winBad * 100) },
    { label: "Owner Volatility", value: clamp100(ov * 100) },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return { p, drivers };
}

export function shouldFireDeterministic(args: { saveSeed: number; key: string; p: number }): boolean {
  const r = deterministicRoll(args.saveSeed, args.key);
  return r < clamp01(args.p);
}
