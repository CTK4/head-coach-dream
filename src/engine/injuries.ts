import { getTeamRosterPlayers } from "@/data/leagueDb";
import type { GameState } from "../context/GameContext";
import type { Injury, InjuryBodyArea, InjurySeverity, InjuryStatus } from "./injuryTypes";
import { computeRecurrenceMultiplier, SOFT_TISSUE_TYPES } from "./injuryTypes";

function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

type InjuryDef = {
  injuryType: string;
  bodyArea: InjuryBodyArea;
  baseWeeks: [number, number];
  severeWeeks: [number, number];
};

const INJURY_DEFS: InjuryDef[] = [
  { injuryType: "Concussion", bodyArea: "HEAD", baseWeeks: [1, 2], severeWeeks: [3, 5] },
  { injuryType: "Hamstring", bodyArea: "UPPER_LEG", baseWeeks: [1, 3], severeWeeks: [4, 8] },
  { injuryType: "Ankle Sprain", bodyArea: "ANKLE", baseWeeks: [1, 3], severeWeeks: [4, 7] },
  { injuryType: "Knee Sprain", bodyArea: "KNEE", baseWeeks: [2, 4], severeWeeks: [6, 12] },
  { injuryType: "Shoulder", bodyArea: "SHOULDER", baseWeeks: [1, 3], severeWeeks: [4, 8] },
  { injuryType: "Back", bodyArea: "BACK", baseWeeks: [1, 2], severeWeeks: [4, 7] },
  { injuryType: "Rib", bodyArea: "RIBS", baseWeeks: [1, 2], severeWeeks: [3, 5] },
  { injuryType: "Wrist/Hand", bodyArea: "HAND", baseWeeks: [1, 2], severeWeeks: [3, 6] },
];

function choose<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)];
}

function rollSeverity(rng: () => number): InjurySeverity {
  const r = rng();
  if (r < 0.7) return "MINOR";
  if (r < 0.92) return "MODERATE";
  if (r < 0.985) return "SEVERE";
  return "SEASON_ENDING";
}

function severityToStatus(sev: InjurySeverity): InjuryStatus {
  if (sev === "SEASON_ENDING") return "IR";
  if (sev === "SEVERE") return "OUT";
  if (sev === "MODERATE") return "OUT";
  return "DAY_TO_DAY";
}

function durationWeeks(rng: () => number, def: InjuryDef, sev: InjurySeverity): number {
  if (sev === "SEASON_ENDING") return 99;
  const [a, b] = sev === "SEVERE" ? def.severeWeeks : def.baseWeeks;
  return a + Math.floor(rng() * (b - a + 1));
}

function shouldGenerateInjury(rng: () => number, recurrenceMultiplier = 1.0, riskMod = 0): boolean {
  return rng() < clamp(0.035 * recurrenceMultiplier + riskMod, 0.005, 0.16);
}

function newInjuryId(seed: number, playerId: string, week: number): string {
  return `INJ_${fnv1a32(`${seed}|${playerId}|${week}`)}`;
}

function progressExisting(injuries: Injury[], currentWeek: number): Injury[] {
  const out: Injury[] = [];
  for (const inj of injuries) {
    const gamesMissed = inj.gamesMissed ?? 0;
    const isActive = inj.isSeasonEnding || inj.expectedReturnWeek == null || currentWeek < inj.expectedReturnWeek;

    if (isActive) {
      out.push({
        ...inj,
        gamesMissed: inj.status === "OUT" || inj.status === "IR" ? gamesMissed + 1 : gamesMissed,
      });
      continue;
    }

    const alreadyReturning = (inj.badges ?? []).includes("RETURNING");
    if (!alreadyReturning) {
      out.push({
        ...inj,
        status: "QUESTIONABLE",
        practiceStatus: "LIMITED",
        badges: Array.from(new Set([...(inj.badges ?? []), "RETURNING"])),
      });
    }
  }
  return out;
}

export function resolveInjuries(state: GameState): GameState {
  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
  const currentWeek = Number(state.hub?.regularSeasonWeek ?? state.week ?? 0);
  if (!teamId || !currentWeek) return state;

  const seed = Number(state.saveSeed ?? 1) + currentWeek * 777;
  const rng = mulberry32(seed);

  const existing = progressExisting(state.injuries ?? [], currentWeek);
  const byPlayer = new Set(existing.map((i) => i.playerId));

  const roster = getTeamRosterPlayers(String(teamId));
  const additions: Injury[] = [];

  for (const p of roster as any[]) {
    const playerId = String(p.playerId);
    if (byPlayer.has(playerId)) continue;

    const def = choose(rng, INJURY_DEFS);
    const recMult = computeRecurrenceMultiplier(playerId, def.injuryType, currentWeek, existing);
    const practiceRiskMod = Number(state.nextGameInjuryRiskMod ?? 0) + Number(state.cumulativeNeglectPenalty ?? 0) * 0.25;
    if (!shouldGenerateInjury(rng, recMult, practiceRiskMod)) continue;

    const sev = rollSeverity(rng);
    const weeks = durationWeeks(rng, def, sev);
    const expectedReturnWeek = sev === "SEASON_ENDING" ? undefined : currentWeek + weeks;

    // Track chronic soft tissue injury flag
    const priorSoftTissue = existing.filter(
      (inj) => inj.playerId === playerId && SOFT_TISSUE_TYPES.has(inj.injuryType),
    ).length;
    const chronic = SOFT_TISSUE_TYPES.has(def.injuryType) && priorSoftTissue >= 1;

    additions.push({
      id: newInjuryId(seed, playerId, currentWeek),
      playerId,
      teamId: String(teamId),
      injuryType: def.injuryType,
      bodyArea: def.bodyArea,
      severity: sev,
      status: severityToStatus(sev),
      startWeek: currentWeek,
      expectedReturnWeek,
      practiceStatus: sev === "MINOR" ? "LIMITED" : "DNP",
      isSeasonEnding: sev === "SEASON_ENDING",
      badges: ["NEW"],
      rehabStage: "INITIAL",
      gamesMissed: 0,
      baseRisk: clamp(rng(), 0.05, 0.25),
      occurredWeek: currentWeek,
      recurrenceWindow: 8,
      recurrenceMultiplier: 1.3,
      chronic,
    });
  }

  if (!additions.length && existing === (state.injuries ?? [])) return state;
  return { ...state, injuries: [...additions, ...existing] };
}
