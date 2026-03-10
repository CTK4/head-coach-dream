import type { GameState, PlayerContractOverride } from "@/context/GameContext";
import { getContractById, getPlayers } from "@/data/leagueDb";
import { getTransactionState, sortTransactionEvents } from "./transactionLedger";

export type ContractIndex = Record<string, PlayerContractOverride>;

function normalizeContract(raw: any, seasonFallback: number): PlayerContractOverride {
  if (!raw) {
    return { startSeason: seasonFallback, endSeason: seasonFallback, salaries: [0], signingBonus: 0 };
  }
  if (Array.isArray(raw.salaries)) {
    return {
      startSeason: Number(raw.startSeason ?? seasonFallback),
      endSeason: Number(raw.endSeason ?? seasonFallback),
      salaries: raw.salaries.map((v: unknown) => Number(v ?? 0)),
      signingBonus: Number(raw.signingBonus ?? 0),
      guaranteedAtSigning: raw.guaranteedAtSigning != null ? Number(raw.guaranteedAtSigning) : undefined,
      prorationBySeason: raw.prorationBySeason,
      contractType: raw.contractType,
    };
  }
  const startSeason = Number(raw.startSeason ?? seasonFallback);
  const endSeason = Number(raw.endSeason ?? startSeason);
  const salaries = [Number(raw.salaryY1 ?? 0), Number(raw.salaryY2 ?? 0), Number(raw.salaryY3 ?? 0), Number(raw.salaryY4 ?? 0)].slice(0, Math.max(1, endSeason - startSeason + 1));
  return { startSeason, endSeason, salaries, signingBonus: 0 };
}

export function buildContractIndex(state: GameState): ContractIndex {
  const out: ContractIndex = {};
  // Priority: Overrides take precedence over DB contracts to prevent phantom contracts.
  // First, apply all DB contracts as the base layer.
  for (const player of getPlayers()) {
    const playerId = String(player.playerId);
    const contract = player.contractId ? getContractById(player.contractId) : undefined;
    if (contract) out[playerId] = normalizeContract(contract, Number(state.season ?? 1));
  }
  // Then, explicitly override with game-managed contracts.
  // This ensures that any runtime modifications take precedence.
  for (const [playerId, override] of Object.entries(state.playerContractOverrides ?? {})) {
    out[String(playerId)] = normalizeContract(override, Number(state.season ?? 1));
  }

  // Apply transaction ledger events to build the final contract state.
  // This ensures that all runtime transactions (trades, signings, cuts) are reflected.
  const events = sortTransactionEvents(getTransactionState(state).events ?? []);
  for (const event of events) {
    const contract = event.details?.contract;
    if (event.kind === "MIGRATION" && event.details?.contract) {
      out[String(event.playerIds[0])] = normalizeContract(event.details.contract, Number(state.season ?? 1));
      continue;
    }
    if (["RESIGN", "SIGN_FA", "FRANCHISE_TAG", "ROOKIE_SIGN"].includes(event.kind)) {
      if (!contract) continue;
      for (const playerId of event.playerIds) out[String(playerId)] = normalizeContract(contract, Number(state.season ?? 1));
      continue;
    }
    if (event.kind === "FRANCHISE_TAG_REMOVE") {
      for (const playerId of event.playerIds) {
        if (contract) out[String(playerId)] = normalizeContract(contract, Number(state.season ?? 1));
        else delete out[String(playerId)];
      }
    }
  }
  return out;
}
