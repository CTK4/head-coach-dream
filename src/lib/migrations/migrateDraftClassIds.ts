import remapFile from "@/data/migrations/draftClassIdRemap_v1.json";
import { getDraftClassProspectIds } from "@/data/draftClass";
import type { GameState } from "@/context/GameContext";

type UnknownRecord = Record<string, unknown>;

type MigrationStats = {
  unknownListIds: number;
  unknownMapIds: number;
};

const REMAP: Record<string, string> = Object.fromEntries(Object.entries((remapFile as { remap?: Record<string, string> }).remap ?? {}).map(([from, to]) => [String(from), String(to)]));

function normalizeId(id: unknown): string {
  return String(id ?? "");
}

function remapId(id: unknown): string {
  const normalized = normalizeId(id);
  return REMAP[normalized] ?? normalized;
}

function migrateIdArray(ids: unknown[], validIds: Set<string>, stats: MigrationStats): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const rawId of ids) {
    const id = remapId(rawId);
    if (!validIds.has(id)) {
      stats.unknownListIds += 1;
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function migrateIdKeyedMap<T>(map: Record<string, T> | undefined, validIds: Set<string>, stats: MigrationStats): Record<string, T> {
  if (!map) return {};
  const out: Record<string, T> = {};
  for (const [rawId, value] of Object.entries(map)) {
    const id = remapId(rawId);
    if (!validIds.has(id)) {
      stats.unknownMapIds += 1;
      continue;
    }
    out[id] = value;
  }
  return out;
}

export function migrateDraftClassIdsInSave(state: Partial<GameState>): Partial<GameState> {
  const validIds = getDraftClassProspectIds();
  const stats: MigrationStats = { unknownListIds: 0, unknownMapIds: 0 };

  const scoutingState = state.scoutingState as UnknownRecord | undefined;
  const offseasonData = state.offseasonData as UnknownRecord | undefined;
  const draft = state.draft as UnknownRecord | undefined;

  const nextScoutingState = scoutingState
    ? {
        ...scoutingState,
        myBoardOrder: migrateIdArray((scoutingState.myBoardOrder as unknown[]) ?? [], validIds, stats),
        trueProfiles: migrateIdKeyedMap((scoutingState.trueProfiles as Record<string, unknown>) ?? {}, validIds, stats),
        scoutProfiles: migrateIdKeyedMap((scoutingState.scoutProfiles as Record<string, unknown>) ?? {}, validIds, stats),
        bigBoard: {
          ...(scoutingState.bigBoard as UnknownRecord),
          tierByProspectId: migrateIdKeyedMap(
            ((scoutingState.bigBoard as UnknownRecord | undefined)?.tierByProspectId as Record<string, unknown>) ?? {},
            validIds,
            stats,
          ),
          tiers: Object.fromEntries(
            Object.entries((((scoutingState.bigBoard as UnknownRecord | undefined)?.tiers as UnknownRecord) ?? {})).map(([tier, ids]) => [
              tier,
              migrateIdArray(Array.isArray(ids) ? ids : [], validIds, stats),
            ]),
          ),
        },
        combine: {
          ...(scoutingState.combine as UnknownRecord),
          prospects: migrateIdKeyedMap(((scoutingState.combine as UnknownRecord | undefined)?.prospects as Record<string, unknown>) ?? {}, validIds, stats),
          resultsByProspectId: migrateIdKeyedMap(
            ((scoutingState.combine as UnknownRecord | undefined)?.resultsByProspectId as Record<string, unknown>) ?? {},
            validIds,
            stats,
          ),
        },
        interviews: {
          ...(scoutingState.interviews as UnknownRecord),
          history: migrateIdKeyedMap(((scoutingState.interviews as UnknownRecord | undefined)?.history as Record<string, unknown>) ?? {}, validIds, stats),
          modelARevealByProspectId: migrateIdKeyedMap(
            ((scoutingState.interviews as UnknownRecord | undefined)?.modelARevealByProspectId as Record<string, unknown>) ?? {},
            validIds,
            stats,
          ),
        },
      }
    : undefined;

  const nextOffseasonData = offseasonData
    ? {
        ...offseasonData,
        scouting: {
          ...(offseasonData.scouting as UnknownRecord),
          intelByProspectId: migrateIdKeyedMap(
            ((offseasonData.scouting as UnknownRecord | undefined)?.intelByProspectId as Record<string, unknown>) ?? {},
            validIds,
            stats,
          ),
        },
        preDraft: {
          ...(offseasonData.preDraft as UnknownRecord),
          visits: migrateIdKeyedMap(((offseasonData.preDraft as UnknownRecord | undefined)?.visits as Record<string, unknown>) ?? {}, validIds, stats),
          workouts: migrateIdKeyedMap(((offseasonData.preDraft as UnknownRecord | undefined)?.workouts as Record<string, unknown>) ?? {}, validIds, stats),
          board: ((offseasonData.preDraft as UnknownRecord | undefined)?.board as UnknownRecord[] | undefined)?.filter((p) =>
            validIds.has(normalizeId((p as UnknownRecord).id)),
          ) ?? [],
        },
        draft: {
          ...(offseasonData.draft as UnknownRecord),
          board: ((offseasonData.draft as UnknownRecord | undefined)?.board as UnknownRecord[] | undefined)?.filter((p) =>
            validIds.has(normalizeId((p as UnknownRecord).id)),
          ) ?? [],
          picks: ((offseasonData.draft as UnknownRecord | undefined)?.picks as UnknownRecord[] | undefined)?.filter((p) =>
            validIds.has(normalizeId((p as UnknownRecord).id)),
          ) ?? [],
        },
        combine: {
          ...(offseasonData.combine as UnknownRecord),
          prospects: ((offseasonData.combine as UnknownRecord | undefined)?.prospects as UnknownRecord[] | undefined)?.filter((p) =>
            validIds.has(normalizeId((p as UnknownRecord).id)),
          ) ?? [],
          results: migrateIdKeyedMap(((offseasonData.combine as UnknownRecord | undefined)?.results as Record<string, unknown>) ?? {}, validIds, stats),
        },
      }
    : undefined;

  const nextDraft = draft
    ? {
        ...draft,
        takenProspectIds: migrateIdKeyedMap((draft.takenProspectIds as Record<string, unknown>) ?? {}, validIds, stats),
        withdrawnBoardIds: migrateIdKeyedMap((draft.withdrawnBoardIds as Record<string, unknown>) ?? {}, validIds, stats),
        selections: ((draft.selections as UnknownRecord[] | undefined) ?? [])
          .map((selection) => {
            const mapped = remapId(selection.prospectId);
            if (!validIds.has(mapped)) {
              stats.unknownListIds += 1;
              return null;
            }
            return { ...selection, prospectId: mapped };
          })
          .filter(Boolean),
      }
    : undefined;

  if (import.meta.env.DEV && (stats.unknownListIds > 0 || stats.unknownMapIds > 0)) {
    console.warn(
      "draftClassIdMigration unresolved prospect IDs",
      JSON.stringify({ unknownListIds: stats.unknownListIds, unknownMapIds: stats.unknownMapIds }),
    );
  }

  return {
    ...state,
    scoutingState: nextScoutingState as GameState["scoutingState"],
    offseasonData: nextOffseasonData as GameState["offseasonData"],
    draft: nextDraft as GameState["draft"],
  };
}
