import { useCallback, useMemo, useRef, useState } from "react";
import { ProspectProfileModal } from "@/components/ProspectProfileModal";
import { getDraftClass, type GameState } from "@/context/GameContext";

type ProspectRecord = Record<string, unknown>;

const prospectIdFrom = (item: ProspectRecord, index?: number) => String(item.id ?? item.prospectId ?? item["Player ID"] ?? item.playerId ?? `prospect-${index ?? 0}`);

function indexByProspectId(rows: ProspectRecord[]) {
  const map: Record<string, ProspectRecord> = {};
  rows.forEach((row, index) => {
    map[prospectIdFrom(row, index)] = row;
  });
  return map;
}

export function useProspectProfileModal(state: GameState) {
  const [activeProspectId, setActiveProspectId] = useState<string | null>(null);
  const scrollYRef = useRef<number | null>(null);
  const focusRef = useRef<HTMLElement | null>(null);

  const prospectsById = useMemo(() => {
    const draftClassRows = getDraftClass() as ProspectRecord[];
    const allRows = [
      ...draftClassRows,
      ...((state.offseasonData.preDraft.board as unknown as ProspectRecord[]) ?? []),
      ...((state.offseasonData.draft.board as unknown as ProspectRecord[]) ?? []),
      ...((state.offseasonData.combine.results ? Object.values(state.offseasonData.combine.results) : []) as ProspectRecord[]),
    ];
    return indexByProspectId(allRows);
  }, [state.offseasonData.combine.results, state.offseasonData.draft.board, state.offseasonData.preDraft.board]);

  const openProspectProfile = useCallback((prospectId: string) => {
    if (!activeProspectId) {
      scrollYRef.current = window.scrollY;
      focusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setActiveProspectId(String(prospectId));
  }, [activeProspectId]);

  const closeProspectProfile = useCallback(() => {
    setActiveProspectId(null);
    if (typeof scrollYRef.current === "number") window.scrollTo({ top: scrollYRef.current, behavior: "auto" });
    if (focusRef.current) focusRef.current.focus();
    scrollYRef.current = null;
    focusRef.current = null;
  }, []);

  const modalProspect = activeProspectId ? prospectsById[activeProspectId] ?? null : null;
  const scoutingProfile = activeProspectId ? state.scoutingState?.scoutProfiles?.[activeProspectId] : undefined;
  const playerIntel = activeProspectId ? state.offseasonData.scouting.intelByProspectId?.[activeProspectId] : undefined;
  const combineStateResult = activeProspectId ? state.scoutingState?.combine.resultsByProspectId?.[activeProspectId] : undefined;
  const offseasonCombineResult = activeProspectId ? state.offseasonData.combine.results?.[activeProspectId] : undefined;

  const modal = (
    <ProspectProfileModal
      open={Boolean(activeProspectId && modalProspect)}
      onClose={closeProspectProfile}
      prospect={modalProspect}
      intel={playerIntel}
      scoutingProfile={scoutingProfile}
      combine={{ ...(combineStateResult ?? {}), ...(offseasonCombineResult ?? {}), ...(modalProspect ?? {}) }}
    />
  );

  return { openProspectProfile, closeProspectProfile, modal, activeProspectId };
}
