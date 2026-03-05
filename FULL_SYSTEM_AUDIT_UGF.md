# 0) META
- Audit date: 2026-03-05
- Repo/zip root: `/workspace/head-coach-dream`
- Commit/version (if known): working tree audit on current branch (hash captured at commit time)
- How I searched:
  - Router/phase wiring: `rg -n "Route|Routes|path=|careerStage|phase|ADVANCE_" src/App.tsx src/pages src/context`
  - Domain engines: `rg --files src/engine | rg "draft|trade|free|cap|injur|scouting|physics|morale|chemistry|news|awards"`
  - Determinism scan: `rg -n "Math.random|Date.now|new Date\(" src`
  - Stubs/dead UI: `rg -n "Coming soon|placeholder|disabled|STUB" src/pages src/components`
  - Truth ownership: inspection of `GameContext`, `rosterOverlay`, `transactionLedger`, `schedule`, `leagueSim`, `saveManager`
- Confidence: **Medium** (broad source coverage completed, but runtime/manual click-through was not performed in-browser for every route)

# 1) EXECUTIVE SUMMARY
- Routing is extensive and mostly wired, but there are explicit placeholder screens in scouting (Private Workouts / Interviews / Medical) with disabled actions.
- Two phase systems coexist (`careerStage` and `league.phase`), which are both advanced in reducer logic; this works but increases risk of drift.
- Core season progression is implemented and tested with deterministic golden tests.
- Determinism is partially enforced in sim code (seeded RNG heavily used), but `Date.now` and one `Math.random` remain in app code paths.
- Schedule generation defaults to `Date.now()` seed if caller omits seed (nondeterministic default).
- Onboarding interview system is robust and deterministic (seeded question selection + seeded scoring).
- Cap/contracts have meaningful ledger/index and tag flows, but advanced structures (post–June 1 mechanics/options/void years) are not fully evidenced as complete.
- Trade and draft flows are present, but some user-facing affordances still show "coming soon" or simplified behavior (e.g., draft trade offers messaging).
- Physics/contact model is materially implemented (contact, pass-rush, ballistics, catch, fumble, kick resolvers with tests).
- Weather appears as modifiers in physics contexts, but no end-to-end venue/climate weather-generation subsystem was found.
- Save system includes schema migration, critical validation, and backup fallback restore.
- Stats/history exist for season/team/news/awards, but dedicated standings/stat pages are mixed between functional and partial.

# 2) CANONICAL FEATURE GOALS (TARGET SPEC) — CHECKLIST
- [x] A. Onboarding & interviews (hiring matrix, deterministic scoring) — **Implemented/partial**
- [x] B. Franchise hub + menu IA — **Implemented with some dead links/redirect-only entries**
- [x] C. Phase machine (offseason → season → playoffs → rollover) — **Implemented (dual machine)**
- [x] D. Roster management + depth chart legality — **Implemented/partial legality**
- [x] E. Contract & cap (ledger, dead cap, post–June 1, tags) — **Partial**
- [x] F. Free agency (market, negotiation, counters, cap/cash constraints) — **Implemented/partial depth**
- [x] G. Trades (valuation, need weighting, friction, future-pick discount) — **Partial**
- [x] H. Draft (boards, scouting uncertainty, visits, trade market, pick assets) — **Partial**
- [x] I. Scouting capacity (GM-trait driven; FA + prospects; fog-of-war) — **Implemented with UI gaps**
- [x] J. Player systems (morale, chemistry, roles, dev traits, injury recurrence) — **Partial/implemented by subsystem**
- [x] K. Coaching/staff systems (hiring, churn, firing hazard, interim logic) — **Partial**
- [x] L. Game sim engine (situational baselines, playcalling, schemes/core-40) — **Implemented/partial**
- [x] M. Stats & history (boxscores, season stats, awards, HOF) — **Partial**
- [x] N. Save system (deterministic, corruption-resistant, validation/recovery) — **Implemented**
- [ ] O. Weather system (venue/climate/weather generation + gameplay modifiers) — **Mostly missing end-to-end**
- [x] P. Physics/contact model (contact severity, tackle/YAC, injury/concussion) — **Implemented/partial linkage**

# 3) TRUTH MAP (AUTHORITATIVE DATA OWNERSHIP)
- **Roster truth**
  - Authoritative derived view: `getEffectivePlayers`/`getEffectivePlayersByTeam` in `src/engine/rosterOverlay.ts`.
  - Derivation: base DB (`getPlayers`) + transaction roster index (`buildRosterIndex`) + overrides + rookie list + progression deltas.
  - Mutations: reducer actions in `GameContext` update transaction ledger/overrides, then derived at read-time.
- **Contract/cap truth**
  - Contract truth: transaction contract index + overrides (`buildContractIndex`, `getContractSummaryForPlayer`, `computeCapLedger`).
  - Mutations: transaction API (`Tx.*`), tag actions (`TAG_APPLY`/`TAG_REMOVE`), sign/release/restructure actions in `GameContext`.
- **Schedule truth**
  - `LeagueSchedule` from `generateLeagueSchedule` in `src/engine/schedule.ts`.
  - Mutations: regenerated at init / season transitions; week reads through `getTeamMatchup` and schedule routes.
- **Game results truth**
  - `state.league.results` + `state.game.boxScore`/`state.boxScoresByGameKey`; generated in `leagueSim`/game reducer flows.
- **Player ratings truth vs scouting known ratings**
  - True/base ratings: roster overlay effective players.
  - Known/estimated scouting truth: scouting profiles (`src/engine/scouting/core.ts`, `src/engine/scouting/types.ts`) with confidence bands/reveals.
- **Injury status truth**
  - Injury sources: engine injury resolution + reducer fields (`pendingInjuryAlert`, `injuryRecoveries`, report lists).
- **Coach/staff truth**
  - User staff IDs + assistantStaff + coaching markets in `GameState` (`GameContext` types and reducers).

# 4) ROUTES & UI WIRING MAP (APP NAVIGATION)
- Primary router is in `src/App.tsx`.
- Key route tree:
  - Onboarding: `/onboarding`, `/onboarding/background`, `/story/interview`, `/onboarding/offers`, `/onboarding/coordinators`
  - Hub shell: `/hub`, `/staff/*`, `/roster/*`, `/contracts/*`, `/strategy/*`, `/scouting/*`, `/offseason/*`
  - Seasonal pages: `/hub/regular-season`, `/hub/gameplan`, `/hub/playoffs`, `/hub/schedule/*`, `/hub/playcall`
  - Subsystems: `/free-agency/*`, `/re-sign/*`, `/trades/*`
- Hub tiles (`src/pages/Hub.tsx`) map to `/staff`, `/roster`, `/strategy`, `/hub/front-office`, `/contracts`, `/scouting`, `/news`, `/hub/schedule`, `/coachs-office`, `/hub/injury-report`, `/hub/league-history`.
- Dead/partial wiring examples:
  - `ProspectProfileScreen` in phase subsystem routes returns `PhaseLocked` (present but not full feature).
  - Scouting subpages private workouts/interviews/medical render and initialize state, but action buttons are disabled stubs.

# 5) PHASE MACHINE AUDIT (END-TO-END REACHABILITY)
## A. Phase enums/constants
- App phase: `GamePhase` (`CREATE`, `BACKGROUND`, `INTERVIEWS`, `OFFERS`, `COORD_HIRING`, `HUB`).
- Career stage: `CareerStage` (offseason through playoffs).
- League phase: `LeaguePhase` (`REGULAR_SEASON*`, playoff rounds, offseason markers).
- Offseason step machine: `OffseasonStepEnum` + `StateMachine.getOffseasonSequence`.

## B. Entry/exit + transitions
- Onboarding route guards in `App.tsx` + `PhaseGate` enforce app-phase entry.
- Hub "advance" dispatches `ADVANCE_CAREER_STAGE` then navigates to route from `stageToRoute`.
- Regular-season loop uses `ADVANCE_WEEK`, `START_GAME`, `RESOLVE_PLAY`, `ADVANCE_LEAGUE_PHASE`.
- Playoffs use `PLAYOFFS_*` actions for bracket init/sim/advance/complete.
- Save/load persistence includes `phase`, `careerStage`, offseason step, season/week (`saveManager` + `saveSchema`).

## C. Reachability (new save mental sim)
- New save → create/background/interviews/offers/coordinator hiring → hub is wired.
- Offseason stages have routes and next-stage plumbing.
- Regular season reaches gameplan/game/play and week advancement.
- Playoffs have bracket/game pages and reducer transitions.
- Season completion and rollover logic exists (`seasonRollover`, `PLAYOFFS_COMPLETE_SEASON`, offseason reducers).

## D. Flags
- Dual phase systems (career vs league) are both authoritative in different UI paths; potential drift risk.
- No obvious infinite loop found; terminal/offseason transitions guarded.
- Transaction vs direct DB mutation: architecture uses overlays/transactions heavily, but some legacy direct override patterns still exist.

# 6) SYSTEM-BY-SYSTEM AUDIT (CORE)

## 6.1 Onboarding & Hiring Interviews
- Status: ✅ Implemented
- User-facing surfaces: `StoryInterview`, `Offers`, onboarding routes.
- Data model: interview bank JSON + team config (`bankLoader`), answer map in component state, offer list in `GameState`.
- Engine logic: deterministic selector (`selectInterviewQuestions` seeds XorShift via league/team/save/week/interview), deterministic scoring (`scoreInterview`).
- State mutations: interview complete + offers set via dispatch in `StoryInterview` and `Offers` acceptance action.
- Persistence: offers + accepted team persisted in GameState save.
- Determinism: seeded RNG used in question selection/scoring.
- Tests: selector/engine implied via unit coverage and onboarding flow tests elsewhere; gaps: no explicit full onboarding golden test file found.
- Gaps: none critical.

## 6.2 Franchise Hub / Menu IA
- Status: 🟡 Partial
- Surfaces: `Hub.tsx`, route shells in `App.tsx`.
- Data model/state: tiles computed from state (`careerStage`, missing coordinators, unread news).
- Engine logic: N/A UI nav.
- Mutations: advance button dispatches `ADVANCE_CAREER_STAGE`.
- Persistence: via GameState autosave.
- Determinism: N/A.
- Tests: limited route tests (`App.test.ts`).
- Gaps: some tiles redirect to legacy/other routes; some destinations are partial or stub pages.

## 6.3 Staff & Coaching System
- Status: 🟡 Partial
- Surfaces: coordinator hiring, assistant hiring, staff management routes.
- Data model: staff IDs, assistant staff slots, offers, contracts in GameState.
- Engine logic: `assistantHiring`, `staffSalary`, acceptance/rejection functions.
- Mutations: hire/offer actions in reducer.
- Persistence: saved in GameState.
- Determinism: seeded/functional logic, but timestamps used for IDs in some offer records.
- Tests: some offseason/staff-related integration tests.
- Gaps: full churn/poaching/interim hazard sophistication appears partial.

## 6.4 Roster Management
- Status: ✅ Implemented (core)
- Surfaces: depth chart, roster audit, player profile, roster routes.
- Data model: effective roster overlay + depth slots + transaction ledger.
- Engine logic: `autoFillDepthChartGaps`, roster overlay helpers.
- Mutations: depth actions, sign/cut/release, auto cut to 53.
- Persistence: state + save manager.
- Determinism: deterministic except UI timestamp IDs.
- Tests: transaction QA and preseason cutdown normalization tests.
- Gaps: explicit PS/IR legality workflow depth unclear.

## 6.5 Contract & Cap Engine
- Status: 🟡 Partial
- Surfaces: contracts routes (`cap-projection`, `dead-money`, `tag`, player contract screen).
- Data model: contract rows, overrides, contract index, cap ledger outputs.
- Engine logic: `computeCapLedger`, `contractMath`, tag values/eligibility.
- Mutations: tag apply/remove, restructure, release via reducer/transactions.
- Persistence: in saved GameState + transaction events.
- Determinism: deterministic calculations.
- Tests: tag and free-agency ledger parity tests.
- Gaps: full post–June 1 and exotic option/void handling not fully evidenced end-to-end.

## 6.6 Free Agency System
- Status: 🟡 Partial
- Surfaces: `/free-agency/*`, offseason FA wrappers, FA page controls.
- Data model: market/offers/signings/rejections plus scouting spend.
- Engine logic: pool gen, offer evaluation, resolve flows.
- Mutations: `INIT_FREE_AGENCY_MARKET`, offer actions, `FA_SIGN`, resolve week.
- Persistence: saved in freeAgency state.
- Determinism: mostly deterministic; UI feedback uses timestamps.
- Tests: freeAgency tests incl. no-freeze and ledger parity.
- Gaps: depth of negotiation/counters and comp-pick cancellation appears limited.

## 6.7 Trade System
- Status: 🟡 Partial
- Surfaces: trades routes and hubs.
- Data model: trade block/proposals/history in state.
- Engine logic: `tradeEngine`, `tradeValuation`, deadline enforcement.
- Mutations: propose/submit/accept actions in reducer/UI.
- Persistence: transaction history + state.
- Determinism: valuation deterministic by inputs; UI IDs may use time.
- Tests: trade engine/deadline tests.
- Gaps: anti-exploit richness and complex negotiation loops are limited.

## 6.8 Draft System
- Status: 🟡 Partial
- Surfaces: offseason draft route + draft pages, draft results.
- Data model: draft sim state, boards, pick assets.
- Engine logic: `draftSim`, class generation, CPU advance/trade-up helper.
- Mutations: pick submit, trade offers, results assignment.
- Persistence: draft state and rookies in save.
- Determinism: seed-driven generation/sim.
- Tests: draft reducer integration and draft flow sanity tests.
- Gaps: explicit "Trade offers coming soon" UI indicates incomplete market UX.

## 6.9 Scouting Capacity (GM-trait driven)
- Status: ⚠️ Present-but-not-wired (UI portions)
- Surfaces: scouting home/combine/big board/allocation/in-season plus private workouts/interviews/medical.
- Data model: scouting state with budget windows, confidence bands, reveals.
- Engine logic: `scoutingCapacity`, `scouting/core`, GM traits and reveal math.
- Mutations: `SCOUT_INIT`, `SCOUTING_SPEND`, `SCOUT_PRIVATE_WORKOUT`, `SCOUT_INTERVIEW` actions exist.
- Persistence: scouting state saved.
- Determinism: uses deterministic seeds in scouting rng.
- Tests: scouting tests exist.
- Gaps: three major scouting pages are explicit stubs with disabled controls.

## 6.10 Player Morale / Chemistry / Personality
- Status: 🟡 Partial
- Surfaces: indirectly via roster/front office pages.
- Data model: morale/chemistry fields and engines exist.
- Engine logic: `moraleEngine`, `chemistry`, dev/snap progression subsystems.
- Mutations: periodic updates in reducer/season processing.
- Persistence: state save.
- Determinism: deterministic functions.
- Tests: morale engine tests present.
- Gaps: full trade-request/role expectation UI surfacing appears limited.

## 6.11 Injuries & Concussions
- Status: 🟡 Partial
- Surfaces: injury report, injury modal/alerts.
- Data model: injury types/selectors, recurrence metadata, report state.
- Engine logic: `injuries`, `injuryRecurrence` tests, injury resolvers in game loop.
- Mutations: injury events during play/week advance.
- Persistence: injuries in GameState.
- Determinism: seed usage in sim paths; some news/timestamps non-critical.
- Tests: `injuries.test.ts`, `injuryRecurrence.test.ts`.
- Gaps: explicit concussion RTP protocol workflows are not clearly surfaced as full UX.

## 6.12 Game Simulation Engine
- Status: ✅ Implemented (core)
- Surfaces: regular season game, playcall page, game log.
- Data model: `GameSim`, play logs, stats, box score.
- Engine logic: `initGameSim`, `stepPlay`, situational buckets, defensive look/call multipliers, physics resolvers.
- Mutations: `START_GAME`, repeated `RESOLVE_PLAY`, finalize to standings/results.
- Persistence: game outcomes to league/results/box score state.
- Determinism: extensive contextual seeded RNG.
- Tests: physics suite + golden season/playoff determinism tests.
- Gaps: some situational tuning likely heuristic not fully empirical.

## 6.13 Playcalling UI + Playbook/Systems
- Status: 🟡 Partial
- Surfaces: `/hub/playcall`, strategy/playbook routes, gameplan page.
- Data model: team gameplans, installed calls, defensive call stats.
- Engine logic: play evaluation and auto-pick + call selection.
- Mutations: lock gameplan, play dispatch.
- Persistence: team gameplan in state.
- Determinism: seeded where in sim.
- Tests: combine/playbook integration tests exist.
- Gaps: evidence of full “core 40” library governance not definitive; some pages are schematic.

## 6.14 Stats, Standings, Awards, HOF, News
- Status: 🟡 Partial
- Surfaces: stats page, schedule details, season awards, hall of fame, league history, news page.
- Data model: season summaries, records, news items, awards state.
- Engine logic: `awardsEngine`, `newsGen`, standings compute in league sim.
- Mutations: season end and weekly updates.
- Persistence: history arrays in state.
- Determinism: mostly deterministic except timestamp-based IDs.
- Tests: awards/season loops/golden tests.
- Gaps: depth of tiebreakers/HOF voting process may be simplified.

## 6.15 Save System, Validation, Recovery
- Status: ✅ Implemented
- Surfaces: load save page + save mode.
- Data model: per-save keys, index metadata, backup and temp keys.
- Engine logic: schema migration chain, validation, atomic writes, backup restore.
- Mutations: `syncCurrentSave`, import/export, active save switching.
- Persistence: localStorage with index + backups.
- Determinism: deterministic save content for deterministic state; metadata uses current time.
- Tests: save manager and roundtrip tests.
- Gaps: no full quarantine/recovery UX beyond error states and backup fallback.

## 6.16 Weather System
- Status: ❌ Missing (end-to-end)
- Surfaces: no dedicated weather UI route found.
- Data model: no venue/climate weather schema located.
- Engine logic: physics/kicking accepts weather context parameters, but no league weather generation pipeline found.
- State mutations/persistence: no per-game generated weather persistence found.
- Determinism: N/A.
- Tests: physics weather input tests only.
- Gaps: missing generation, storage, and gameplay bridge at season scheduler level.

## 6.17 Physics / Contact Modeling
- Status: ✅ Implemented (subsystem)
- Surfaces: integrated via game sim outcomes.
- Data model: contact/catch/pile/pass-rush inputs and tunable constants.
- Engine logic: `contactResolver`, `pileResolver`, `passRushResolver`, `catchPointResolver`, `qbBallistics`, `kickResolver`.
- Mutations: consumed in `stepPlay` to produce yards, pressure, fumbles, outcomes.
- Persistence: downstream through play logs/stats/injury events.
- Determinism: resolver RNG input is seeded function.
- Tests: dedicated physics test suite.
- Gaps: explicit injury/concussion coupling from contact severity exists partially, but full medical storyline pipeline is limited.

# 7) BUTTON & DEAD-END INVENTORY
- Scouting > Private Workouts → “Schedule Workout (Coming Soon)” → should schedule workout/intel spend → button is disabled hardcoded → **Dead** → `src/pages/hub/scouting/PrivateWorkouts.tsx`.
- Scouting > Interviews → “Start Interview (Coming Soon)” → should spend interview slot/reveal traits → disabled hardcoded → **Dead** → `src/pages/hub/scouting/ScoutingInterviews.tsx`.
- Scouting > Medical → “Request Evaluation (Coming Soon)” → should create medical eval request → disabled hardcoded → **Dead** → `src/pages/hub/scouting/MedicalBoard.tsx`.
- Draft (offseason) trade area → user expects offers list/actionable negotiations → text says “Trade offers coming soon.” → **Partial** → `src/pages/hub/offseason/Draft.tsx`.
- Prospect profile route via phase subsystem → expected profile detail page → returns phase-locked shell → **Partial** → `src/pages/hub/PhaseSubsystemRoutes.tsx`.

# 8) DETERMINISM & NONDETERMINISM SCAN (SIM-CRITICAL)
- `Math.random`
  - `src/pages/hub/offseason/Draft.tsx` UI delay calc — **UI-only**.
  - `src/engine/feedbackEvents.ts` ID generation — **non-sim UI/events**.
- `Date.now` / `new Date`
  - `src/engine/schedule.ts` default seed in `generateLeagueSchedule(..., seed = Date.now())` — **sim-critical if caller omits seed**.
  - `src/context/GameContext.tsx` save seed initialization and many UI feedback timestamps/IDs — mixed; save-seed creation is **sim-critical at new career init**, modal/news IDs are **UI-only**.
  - `src/lib/saveManager.ts` metadata/IDs — **persistence metadata (non-sim)**.
  - `src/lib/logger.ts`, `src/lib/debugBundle.ts` — **diagnostic-only**.
- Seeded RNG tracing end-to-end
  - Onboarding interview selector and scoring use seeded XorShift.
  - Game sim heavily uses contextual seeded RNG from career/game seeds.
  - Golden determinism tests validate repeatable season/playoff results for same seed.

# 9) PRIORITY FIX QUEUE (TOP 10 BLOCKERS)
1. **Scouting Private Workouts dead button** — blocks scouting depth and draft intel loop.
2. **Scouting Interviews dead button** — blocks trait/IQ discovery workflow.
3. **Scouting Medical dead button** — blocks medical risk surfaced scouting loop.
4. **Schedule default `Date.now` seed** — can break strict deterministic replay if unseeded call path is used.
5. **Dual phase-machine drift risk (`careerStage` + `league.phase`)** — can desync route/UI progression.
6. **Draft trade market "coming soon" gap** — weakens draft-day decision loop.
7. **Weather generation/storage missing** — no environmental gameplay consistency across schedule.
8. **Cap feature depth gaps (post–June 1/options/void details)** — realism fidelity issue for multi-year cap planning.
9. **Trade negotiation anti-exploit depth limited** — enables simplified exploitation vs realistic market.
10. **Some profile/phase pages remain locked shells** — creates user-visible dead-end paths in feature navigation.

## Research-note handling
- Injury/recurrence and physics priors are implemented as parameterized constants/functions in engine modules.
- Coverage/defensive/playcalling rates are mostly code constants/heuristics, not externalized datasets.
- Contract market/scouting calculations are parameterized in engine functions and constants; no external live data source integration found.
