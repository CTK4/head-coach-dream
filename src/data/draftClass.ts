import draftClassJson from "@/data/draftClass.json";

export type DraftClassRecord = Record<string, unknown>;

const DRAFT_CLASS_ROWS = draftClassJson as DraftClassRecord[];

const idFrom = (row: DraftClassRecord, index: number): string => {
  const id = row.id ?? row.prospectId ?? row["Player ID"] ?? row.playerId;
  return String(id ?? `DC_${index + 1}`);
};

const draftClassById = new Map<string, DraftClassRecord>(DRAFT_CLASS_ROWS.map((row, index) => [idFrom(row, index), row]));

export function getDraftClassRows(): DraftClassRecord[] {
  return DRAFT_CLASS_ROWS;
}

export function getProspectById(id: string | number): DraftClassRecord | null {
  return draftClassById.get(String(id)) ?? null;
}

export function doesProspectExist(id: string | number): boolean {
  return draftClassById.has(String(id));
}

export function getDraftClassProspectIds(): Set<string> {
  return new Set(draftClassById.keys());
}
