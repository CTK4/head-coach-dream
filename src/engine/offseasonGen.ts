import { mulberry32, tri } from "@/engine/rand";
import type { FreeAgentOffer, Prospect, ScoutingCombineResult } from "@/engine/offseasonData";

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function id(prefix: string, n: number): string {
  return `${prefix}_${n.toString().padStart(4, "0")}`;
}

const FIRST = ["Jalen", "Marcus", "Eli", "Dante", "Noah", "Caleb", "Trey", "Mason", "Isaiah", "Jordan", "Derrick", "Lamar", "CJ", "Aiden"];
const LAST = ["Reed", "Johnson", "Carter", "Hayes", "Wilson", "Morgan", "Bennett", "Brooks", "Pierce", "Foster", "Coleman", "Sutton", "Hughes", "Sanders"];
const POS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"] as const;

export function genCombine(seed: number, count = 40): ScoutingCombineResult[] {
  const rng = mulberry32(seed ^ 0xabcddcba);
  const out: ScoutingCombineResult[] = [];
  for (let i = 0; i < count; i++) {
    const pos = pick(rng, [...POS]);
    const forty = Number(tri(rng, pos === "OL" ? 4.85 : 4.25, pos === "RB" || pos === "WR" ? 4.45 : 4.65, pos === "OL" ? 5.35 : 5.05).toFixed(2));
    const shuttle = Number(tri(rng, 3.95, 4.22, 4.55).toFixed(2));
    const threeCone = Number(tri(rng, 6.65, 6.95, 7.55).toFixed(2));
    const grade = Math.round(tri(rng, 55, 72, 92));
    out.push({ id: id("COMB", i + 1), name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`, pos, forty, shuttle, threeCone, grade });
  }
  return out.sort((a, b) => b.grade - a.grade);
}

export function genFreeAgents(seed: number, count = 25): FreeAgentOffer[] {
  const rng = mulberry32(seed ^ 0x11c0ffee);
  const out: FreeAgentOffer[] = [];
  for (let i = 0; i < count; i++) {
    const pos = pick(rng, [...POS]);
    const years = 1 + Math.floor(rng() * 4);
    const apy = Math.round(tri(rng, 900_000, pos === "QB" ? 6_500_000 : 3_000_000, pos === "QB" ? 14_000_000 : 8_500_000) / 50_000) * 50_000;
    const interest = Number(tri(rng, 0.2, 0.55, 0.95).toFixed(2));
    const playerId = id("FA", i + 1);
    out.push({ id: id("OFFER", i + 1), playerId, name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`, pos, years, apy, interest });
  }
  return out.sort((a, b) => b.interest - a.interest);
}

export function genProspects(seed: number, count = 120): Prospect[] {
  const rng = mulberry32(seed ^ 0x5bd1e995);
  const out: Prospect[] = [];
  const arch = ["Technician", "Explosive", "Power", "FieldGeneral", "BallHawk", "Mauler", "PassRush", "CoverLB"];
  for (let i = 0; i < count; i++) {
    const pos = pick(rng, [...POS]);
    const grade = Math.round(tri(rng, 50, 72, 95));
    const ras = Math.round(tri(rng, 35, 70, 99));
    const interview = Math.round(tri(rng, 35, 68, 98));
    out.push({ id: id("P", i + 1), name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`, pos, archetype: pick(rng, arch), grade, ras, interview });
  }
  return out.sort((a, b) => b.grade - a.grade);
}
