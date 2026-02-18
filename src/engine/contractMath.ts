import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getContracts, getPlayers } from "@/data/leagueDb";

export type CapYearRow = { season: number; salary: number; bonus: number; capHit: number };
export type CapTable = { rows: CapYearRow[]; total5y: number };

function round50k(v: number) {
  return Math.round(v / 50_000) * 50_000;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function buildOverrideCapRows(state: GameState, o: PlayerContractOverride, seasons: number) {
  const years = Math.max(1, o.endSeason - o.startSeason + 1);
  const prorationPerYear = o.signingBonus > 0 ? round50k(o.signingBonus / years) : 0;
  const rows: CapYearRow[] = [];
  for (let i = 0; i < seasons; i++) {
    const season = state.season + i;
    const idx = clamp(season - o.startSeason, 0, o.salaries.length - 1);
    const salary = round50k(o.salaries[idx] ?? 0);
    const bonus = season >= o.startSeason && season <= o.endSeason ? prorationPerYear : 0;
    rows.push({ season, salary, bonus, capHit: round50k(salary + bonus) });
  }
  return rows;
}

function buildBaseCapRows(state: GameState, playerId: string, seasons: number) {
  const p = getPlayers().find((x: any) => String(x.playerId) === String(playerId));
  if (!p?.contractId) return null;
  const c = getContracts().find((x: any) => x.contractId === p.contractId);
  if (!c) return null;

  const start = Number(c.startSeason ?? state.season);
  const end = Number(c.endSeason ?? start);
  const salByIdx = [Number(c.salaryY1 ?? 0), Number(c.salaryY2 ?? 0), Number(c.salaryY3 ?? 0), Number(c.salaryY4 ?? 0)];

  const rows: CapYearRow[] = [];
  for (let i = 0; i < seasons; i++) {
    const season = state.season + i;
    if (season < start || season > end) rows.push({ season, salary: 0, bonus: 0, capHit: 0 });
    else {
      const idx = clamp(season - start, 0, salByIdx.length - 1);
      const salary = round50k(salByIdx[idx] ?? 0);
      rows.push({ season, salary, bonus: 0, capHit: salary });
    }
  }
  return rows;
}

export function buildCapTable(state: GameState, playerId: string, seasons = 5): CapTable {
  const o = state.playerContractOverrides[playerId];
  const rows = o ? buildOverrideCapRows(state, o, seasons) : buildBaseCapRows(state, playerId, seasons) ?? [];
  const total5y = round50k(rows.reduce((a, r) => a + r.capHit, 0));
  return { rows, total5y };
}

export function simulateRestructure(state: GameState, playerId: string, amount: number, seasons = 5): CapTable {
  const o = state.playerContractOverrides[playerId];
  if (!o) return buildCapTable(state, playerId, seasons);

  const yearsRemaining = Math.max(1, o.endSeason - state.season + 1);
  const idx = clamp(state.season - o.startSeason, 0, o.salaries.length - 1);
  const currentSalary = Number(o.salaries[idx] ?? 0);
  const x = round50k(clamp(amount, 0, currentSalary));

  if (x <= 0) return buildCapTable(state, playerId, seasons);

  const addedProration = round50k(x / yearsRemaining);
  const rows = buildOverrideCapRows(state, o, seasons).map((r) => ({ ...r }));

  rows[0].salary = round50k(rows[0].salary - x);
  for (let i = 0; i < Math.min(seasons, yearsRemaining); i++) {
    rows[i].bonus = round50k(rows[i].bonus + addedProration);
    rows[i].capHit = round50k(rows[i].salary + rows[i].bonus);
  }

  return { rows, total5y: round50k(rows.reduce((a, r) => a + r.capHit, 0)) };
}

export function maxRestructureAmount(state: GameState, playerId: string) {
  const o = state.playerContractOverrides[playerId];
  if (!o) return 0;
  const idx = clamp(state.season - o.startSeason, 0, o.salaries.length - 1);
  return round50k(Number(o.salaries[idx] ?? 0));
}
