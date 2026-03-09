# GameContext.tsx decomposition map (pre-extraction audit)

Source audited: `src/context/GameContext.tsx`.

This map is intentionally factual and tied to the current code shape so extraction can happen in small, verifiable steps.

## 1) Initial state construction

### What exists now
- Default/state-construction helpers are co-located with runtime reducer logic (`DEFAULT_DETERMINISTIC_COUNTERS`, `DEFAULT_SIDELINE`, `defaultOwnerGoals`, `defaultOwnerState`, `defaultMedicalStaffByTeamId`, `defaultDynastyProfile`).
- `createInitialState()` constructs a very large `GameState` object, including nested subsystem defaults for offseason, free agency, scouting, league, telemetry, transactions, and UI.
- `createInitialState()` also runs post-build reducer actions (`COACHING_BOOTSTRAP`, `DYNASTY_INIT`, and conditionally `OWNER_INIT_SEASON_GOALS`), which means initialization and reducer orchestration are coupled.

### Keep in `GameContext` long-term
- A thin composition entrypoint (e.g., `createInitialState()` as coordinator only).
- The minimal cross-subsystem wiring that requires current top-level context knowledge (e.g., user team lookup before owner-goal bootstrap).

### Extract
- Raw default factories and seed derivation helpers.
- Subtree initializers by domain (offseason data, scouting/free agency, owner/coaching/media/medical/wire, telemetry/transactions).
- Post-initialization bootstrap sequence currently embedded in `createInitialState()`.

### Likely target module(s)
- `src/context/state/createInitialState.ts` (composition-only entrypoint)
- `src/context/state/defaults/*.ts` (domain defaults)
- `src/context/state/bootstrap.ts` (post-construction bootstrap dispatch pipeline)

## 2) Boot/load/hydration

### What exists now
- `loadState()` is the boot pipeline used as `useReducer` initializer.
- It performs config registry load/validation, save lookup, save parse, save migration decision, deep merge hydration with many nested merge rules, migration-event backfill for transaction ledger, personnel override replay, accolades bootstrap, draft ID migration, GM map normalization, cap-mode URL query override, optional mid-game checkpoint overlay, config pin validation, and critical save validation.
- `migrateSave()` is also embedded in this file and includes schema fallback/defaulting, league normalization, schedule/game fallback generation, and type/version normalization.

### Keep in `GameContext` long-term
- A single boot orchestrator call site passed into `useReducer`.
- `loadStateForTests()` wrapper if tests depend on context-level import surface.

### Extract
- Migration function (`migrateSave`) and migration helpers.
- Hydration/deep-merge policy block from `loadState()`.
- Checkpoint overlay logic (`GAME_CHECKPOINT_KEY` read + overlay conditions).
- Boot validation chain (config pins + critical save state checks).

### Likely target module(s)
- `src/context/boot/loadState.ts`
- `src/context/boot/migrateSave.ts`
- `src/context/boot/hydrateState.ts`
- `src/context/boot/checkpointRestore.ts`
- `src/context/boot/validators.ts`

## 3) Persistence/autosave

### What exists now
- Provider-level `useEffect` autosave controller with debounce (`AUTOSAVE_DEBOUNCE_MS = 600`) and suppression while game is in progress.
- Visibility-change flush effect persists immediately when tab hides.
- Drive-boundary checkpoint effect writes `GAME_CHECKPOINT_KEY` snapshots on drive increments and clears checkpoint when game is idle.
- Persistence operations call `syncCurrentSave` and directly access `localStorage`.

### Keep in `GameContext` long-term
- Subscription to `state` changes (React lifecycle ownership).
- Dispatch-independent derivation of `isGameInProgress` from current state.

### Extract
- Debounced save scheduler internals.
- Visibility handler and checkpoint read/write helpers.
- Checkpoint key constants and payload schema.

### Likely target module(s)
- `src/context/persistence/useAutosaveController.ts`
- `src/context/persistence/gameCheckpoint.ts`
- `src/context/persistence/savePolicies.ts`

## 4) Recovery flows

### What exists now
- Recovery flags are part of state (`recoveryNeeded`, `recoveryErrors`).
- Boot-time recovery entrypoints are in `loadState()` (config load failure, save load failure, pin validation failure, critical-state validation failure, catch-all boot exception).
- Runtime recovery action cases are in reducer:
  - `RECOVERY_RETURN_TO_HUB`
  - `RECOVERY_REBUILD_INDICES`
  - `RECOVERY_SKIP_STEP`
  - `RECOVERY_RESTORE_BACKUP`
  - `RECOVERY_HYDRATE_STATE`
  - `RECOVERY_SET_ERRORS`
- `RECOVERY_RESTORE_BACKUP` explicitly signals that backup restore is controller-managed (not reducer-managed).

### Keep in `GameContext` long-term
- Recovery action dispatch surface (to avoid changing consumers all at once).
- Minimal reducer-owned state flips (flags and errors).

### Extract
- Index rebuild consistency logic in `RECOVERY_REBUILD_INDICES`.
- Backup restore orchestration (currently implied externally).
- Recovery decision/routing policy shared by boot and runtime.

### Likely target module(s)
- `src/context/recovery/recoveryReducerCases.ts`
- `src/context/recovery/recoveryController.ts`
- `src/context/recovery/recoveryPolicies.ts`

## 5) Selectors/helpers embedded in the file

### What exists now
Large numbers of non-trivial helpers are embedded beside reducer code, including:
- Draft/scouting helpers: `buildActiveDraftClassProspects`, `applyDraftPriorities`, `getUserProspectEval`, `getCpuProspectEval`, `computeDraftOrder`, `cpuDraftPickProspectId`, etc.
- Game/telemetry helpers: `gameTelemetryKey`, `persistUserGamePlayLog`, `applyTelemetryAggregatesForGame`, `compactSeasonTelemetry`, `persistSeasonAggToHistorical`.
- Fatigue/practice helpers: `buildTrackedPlayers`, `hydrateGameFatigue`, `applyWeeklyFatigueRecovery`, `applyPracticePlanForWeek`, `applyPracticePlanForWeekAtomic`.
- Contract/offer helpers: `buildResignOffer`, `resolveDeterministicExtensionSubmission`, `createContractOverride`, `offerChance`, `buildCounter`.
- Financial/staff/firing helpers: `computeFinancialRating`, `computeJobSecurity`, `chargeBuyouts`, `computeAndStoreFiringMeter`.

### Keep in `GameContext` long-term
- Only tiny glue helpers that are purely context assembly concerns.

### Extract
- Pure selectors/calculators with deterministic inputs/outputs.
- Domain helpers that already map to existing engine/system namespaces (scouting, contracts, telemetry, finances, fatigue).

### Likely target module(s)
- `src/context/selectors/*.ts` for context-read helpers.
- `src/context/reducer/helpers/*.ts` for reducer-specific pure transforms.
- Or move directly into existing domain modules under `src/engine/*` when ownership already exists.

## 6) Reducer action families grouped by subsystem

`gameReducer()` already routes some families by prefix to dedicated reducers, while many actions remain in `gameReducerMonolith()`.

### Already delegated by prefix
- `OFFSEASON_*` (+ `EXPIRE_EXPIRING_CONTRACTS_TO_FA`, `CUT_TOGGLE`) → `offseasonReducer`
- `DRAFT_*` → `draftReducer`
- `SEASON_*` and `PLAYOFFS_*` → `seasonReducer`
- `FA_*` and `FREE_AGENCY_*` → `freeAgencyReducer`

### Monolith families still in `gameReducerMonolith()`
- Career/setup: `INIT_*`, `SET_PHASE`, `SET_CAREER_STAGE`, `ADVANCE_CAREER_STAGE`, interview/offer acceptance.
- Staffing/coaching: `HIRE_*`, `FIRE_*`, `CREATE_STAFF_OFFER`, `STAFF_COUNTER_OFFER*`, `COORD_*`, `ASSISTANT_*`, `SET_ORG_ROLE`, `COACHING_*`, `COACH_CAREER_APPEND_HISTORY`.
- Team strategy/depth: `SET_SCHEME`, `SET_PLAYBOOK`, `SET_STRATEGY_PRIORITIES`, `SET_TEAM_GAMEPLAN`, `LOCK_TEAM_GAMEPLAN`, depth chart actions (`SET_STARTER`, `DEPTH_BULK_SET`, `TOGGLE_DEPTH_SLOT_LOCK`, `AUTOFILL_DEPTH_CHART`, reset variants).
- Contracts/roster ops: `EXTEND_*`, `RESIGN_*`, `TAG_*`, `APPLY_FRANCHISE_TAG`, `CONTRACT_RESTRUCTURE_APPLY`, `CUT_*`, `TRADE_*`, `EXECUTE_TRADE`.
- Scouting/combine/predraft: `SCOUT_*`, `SCOUTING_*`, `COMBINE_*`, `PREDRAFT_*`.
- Weekly simulation/gameplay: `START_GAME`, `ENSURE_GAME_WEATHER`, `RESOLVE_PLAY`, `SIMULATE_REST_OF_GAME`, `EXIT_GAME`, `ADVANCE_WEEK`.
- Live game/sideline: `LIVEGAME_INIT`, `SIDELINE_*`, defensive call controls.
- Owner/media/medical/wire/dynasty/feedback/dev/recovery: `OWNER_*`, `MEDIA_*`, `MEDICAL_*`, `WIRE_*`, `DYNASTY_*`, `PUSH_FEEDBACK`, `DISMISS_FEEDBACK`, `DEV_*`, `RECOVERY_*`, `RESET`.

### Keep in `GameContext` long-term
- Top-level reducer router (`gameReducer`) and central phase-guard invocation.

### Extract
- Remaining monolith families into dedicated reducer files aligned to action prefixes/domains.
- Consolidate similarly named families that are split across monolith and delegated reducers.

### Likely target module(s)
- `src/context/reducers/{career,staffing,strategy,contracts,scouting,weekly,livegame,owner,recovery}.ts`
- Keep `src/context/GameContext.tsx` as router + provider composition.

## 7) Side-effect/controller-like logic that should not live in reducer code

### What exists now
- Reducer cases and helper paths invoke DB mutation and cross-system side-effects (e.g., personnel/contract override replay/setters, transaction application + validation paths, checkpoint/local storage interactions in provider effects).
- Boot-time and runtime flows mix orchestration concerns (load/migrate/validate/recover) with pure state transformation.
- `finalizeWeek()` drives multi-action orchestration via nested `gameReducer` dispatches.

### Keep in `GameContext` long-term
- Pure reducer routing and state transitions.
- React effect subscription points (provider lifecycle).

### Extract
- Imperative orchestration into controllers/services:
  - Boot controller (load/migrate/validate/recover)
  - Persistence controller (autosave/checkpoint)
  - Weekly advancement controller (`finalizeWeek` orchestration)
  - Transaction controller (apply/validate/post-check sequencing)

### Likely target module(s)
- `src/context/controllers/{boot,persistence,weekAdvance,transactions}.ts`

## 8) Imported dependencies grouped by subsystem

Current imports are subsystem-dense; grouping below maps current coupling points.

### Runtime/framework/context plumbing
- `react` hooks/context APIs.
- Context-local reducers/guards: `offseasonReducer`, `draftReducer`, `seasonReducer`, `freeAgencyReducer`, `isActionAllowedInCurrentPhase`, `migrateExpiredContractsToFreeAgency`.

### Persistence/config/migration/logging
- Save manager: `getActiveSaveId`, `loadSaveResult`, `syncCurrentSave`.
- Save/config migrations & validation: `migrateDraftClassIdsInSave`, `validateCriticalSaveState`, `loadConfigRegistry`, `validateConfigPins`, config constants.
- Logging: `logError`, `logInfo`.

### Data access and static data
- League DB/data reads and mutation helpers from `@/data/leagueDb`.
- Draft data from `@/data/draftClass` and JSON.

### Simulation/gameplay
- `gameSim`, `leagueSim`, `playoffsSim`, `leaguePhase`, weather, gameplan, fatigue, practice, standings/injuries/milestones/season-end.

### Offseason/personnel/contracts/cap
- Free agency/offers/offseason generation, buyouts, contract math, market model, cap ledger, termination, roster/depth chart systems.

### Scouting/draft/talent pipeline
- Scouting core/capacity/interviews/medical/workouts/combine helpers.
- Draft sim/generation/rookie contracts/player generation/prospect eval/GM traits.

### Franchise meta systems
- Owner, media, morale, chemistry, staff trust, dynasty, hot seat, badges, unicorns, news/feedback.

### Transactions
- Transaction ledger/apply/API/validation/index builders/types.

### Keep in `GameContext` long-term
- Import only composition-level interfaces (reducers/controllers/selectors), not deep engine internals.

### Extract
- Replace broad direct engine imports with domain facades consumed by reducer slices/controllers.

### Likely target module(s)
- `src/context/deps/*.ts` (optional facade layer) or per-domain reducer/controller files that own their specific imports.

## Suggested extraction order (minimal-risk)
1. Move boot/load/migrate/hydration/pin-validation into `context/boot/*` without action changes.
2. Move provider autosave/checkpoint effects into `context/persistence/*` hook(s).
3. Extract recovery reducer cases/controller helpers.
4. Split monolith reducer by the remaining action families (start with high-prefix clusters: `SCOUT_*`, `COACHING_*`, `OWNER_*`).
5. Move pure helpers/selectors by domain and reduce `GameContext.tsx` import surface.
