import draftClassJson from "@/data/draftClass.json";
import remapData from "@/data/migrations/draftClassIdRemap_v1.json";

export type DraftClassRecord = Record<string, unknown>;

const DRAFT_CLASS_ROWS = draftClassJson as DraftClassRecord[];

const idFrom = (row: DraftClassRecord, index: number): string => {
  const id = row.id ?? row.prospectId ?? row["Player ID"] ?? row.playerId;
  return String(id ?? `DC_${index + 1}`);
};

const PLY_REMAP: Record<string, string> = Object.fromEntries(
  Object.entries((remapData as { remap?: Record<string, string> }).remap ?? {}).map(([k, v]) => [String(k), String(v)]),
);

const draftClassById = new Map<string, DraftClassRecord>();
DRAFT_CLASS_ROWS.forEach((row, index) => {
  const oldId = idFrom(row, index);
  draftClassById.set(oldId, row);
  const newId = PLY_REMAP[oldId];
  if (newId && newId !== oldId) draftClassById.set(newId, row);
});

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
