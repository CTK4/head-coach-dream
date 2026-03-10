type BootstrapReducerAction =
  | { type: "COACHING_BOOTSTRAP"; payload: { seed: number } }
  | { type: "DYNASTY_INIT"; payload: { seed: number } }
  | { type: "OWNER_INIT_SEASON_GOALS"; payload: { year: number; teamId: string } };

type BootstrapDeps<TState extends { saveSeed: number; season: number }> = {
  ensureAccolades: (state: TState) => TState;
  bootstrapAccolades: (state: TState) => TState;
  gameReducer: (state: TState, action: BootstrapReducerAction) => TState;
  resolveUserTeamId: (state: TState) => string | null | undefined;
};

export function bootstrapInitialGameState<TState extends { saveSeed: number; season: number }>(
  base: TState,
  deps: BootstrapDeps<TState>,
): TState {
  let initialized = deps.ensureAccolades(deps.bootstrapAccolades(base));
  initialized = deps.gameReducer(initialized, { type: "COACHING_BOOTSTRAP", payload: { seed: initialized.saveSeed } });
  initialized = deps.gameReducer(initialized, { type: "DYNASTY_INIT", payload: { seed: initialized.saveSeed } });

  const userTeamId = deps.resolveUserTeamId(initialized);
  if (userTeamId) {
    initialized = deps.gameReducer(initialized, {
      type: "OWNER_INIT_SEASON_GOALS",
      payload: { year: initialized.season, teamId: userTeamId },
    });
  }

  return initialized;
}
