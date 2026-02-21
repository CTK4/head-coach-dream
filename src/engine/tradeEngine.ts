export type TradePlayer = {
  playerId: string;
  name: string;
  teamId: string;
  pos?: string;
  age?: number;
  overall?: number;
};

export type TradePackage = {
  outgoing: TradePlayer[];
  incoming: TradePlayer[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rand01(key: string): number {
  const h = hash32(key);
  return (h & 0xffffff) / 0x1000000;
}

export function playerTradeValue(p: TradePlayer): number {
  const ovr = Number(p.overall ?? 60);
  const age = Number(p.age ?? 26);
  const ageAdj = clamp(1.08 - (age - 24) * 0.02, 0.78, 1.12);
  return Math.round(ovr * 10 * ageAdj);
}

export function packageValue(players: TradePlayer[]): number {
  return players.reduce((s, p) => s + playerTradeValue(p), 0);
}

export type TradeDecision = {
  outgoingValue: number;
  incomingValue: number;
  delta: number;
  acceptProb: number;
  accepted: boolean;
  reason: string;
};

export function decideTrade(opts: {
  season: number;
  userTeamId: string;
  partnerTeamId: string;
  pkg: TradePackage;
  hardRejectDeficitPct?: number;
  autoAcceptSurplusPct?: number;
}): TradeDecision {
  const outgoingValue = packageValue(opts.pkg.outgoing);
  const incomingValue = packageValue(opts.pkg.incoming);

  const hardReject = opts.hardRejectDeficitPct ?? 0.18;
  const autoAccept = opts.autoAcceptSurplusPct ?? 0.12;

  const partnerGives = incomingValue;
  const partnerReceives = outgoingValue;

  if (partnerReceives > 0 && partnerGives < partnerReceives * (1 - hardReject)) {
    return {
      outgoingValue,
      incomingValue,
      delta: incomingValue - outgoingValue,
      acceptProb: 0,
      accepted: false,
      reason: "Offer is too light. Add value to get a deal done.",
    };
  }

  if (partnerReceives > 0 && partnerGives > partnerReceives * (1 + autoAccept)) {
    return {
      outgoingValue,
      incomingValue,
      delta: incomingValue - outgoingValue,
      acceptProb: 1,
      accepted: true,
      reason: "Deal accepted. Value was clearly favorable.",
    };
  }

  const fairness = partnerReceives <= 0 ? 1 : partnerGives / partnerReceives;
  const score = clamp(1.1 - fairness, -0.25, 0.25);
  const acceptProb = clamp(0.5 + score * 1.4, 0.15, 0.85);

  const key = `T|${opts.season}|${opts.userTeamId}|${opts.partnerTeamId}|out=${outgoingValue}|in=${incomingValue}`;
  const roll = rand01(key);
  const accepted = roll < acceptProb;

  return {
    outgoingValue,
    incomingValue,
    delta: incomingValue - outgoingValue,
    acceptProb,
    accepted,
    reason: accepted ? "Deal accepted." : "Deal rejected. Adjust the package and try again.",
  };
}

