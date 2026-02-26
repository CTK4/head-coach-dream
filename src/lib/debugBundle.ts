import type { GameState } from "@/context/GameContext";
import { getRecentLogs } from "@/lib/logger";
import type { SaveMetadata } from "@/lib/saveManager";

type DebugBundleParams = {
  state: GameState;
  saveMeta?: SaveMetadata | null;
};

function redactedState(state: GameState) {
  return {
    phase: state.phase,
    careerStage: state.careerStage,
    season: state.season,
    week: state.week,
    saveSeed: state.saveSeed,
    careerSeed: state.careerSeed,
    teamId: state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId,
    hub: {
      preseasonWeek: state.hub?.preseasonWeek,
      regularSeasonWeek: state.hub?.regularSeasonWeek,
    },
    league: {
      week: state.league?.week,
      tradeDeadlineWeek: state.league?.tradeDeadlineWeek,
      standingsCount: Object.keys(state.league?.standings ?? {}).length,
      resultsCount: state.league?.results?.length ?? 0,
    },
  };
}

export function buildDebugBundle({ state, saveMeta }: DebugBundleParams) {
  return {
    createdAt: new Date().toISOString(),
    app: {
      version: import.meta.env.VITE_APP_VERSION ?? "0.0.0",
      commit: import.meta.env.VITE_COMMIT_HASH ?? "unknown",
      mode: import.meta.env.MODE,
    },
    saveMeta: saveMeta ?? null,
    schemaVersion: (state as any).saveVersion ?? null,
    careerSeed: state.careerSeed ?? null,
    stateSnapshot: redactedState(state),
    recentLogs: getRecentLogs(200),
  };
}

export function exportDebugBundle({ state, saveMeta }: DebugBundleParams) {
  const payload = JSON.stringify(buildDebugBundle({ state, saveMeta }), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const dateLabel = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `hc-debug-bundle-${dateLabel}.json`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { fileName, blob };
}
