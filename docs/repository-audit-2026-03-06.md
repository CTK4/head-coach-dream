# UGF HEAD COACH DREAM — AUDIT REPORT

## System Status Matrix

| Domain | Status | Notes |
|---|---|---|
| Game state / save | 🟡 | Multi-save manager, atomic write strategy (`__tmp` + `__bak`), schema migration, and critical validation are implemented; however save IDs and seed bootstrapping still use wall-clock (`Date.now`) and initial state still boots at schemaVersion 1 while latest is 2 (migration covers it, but drift risk remains). |
| Phase management | 🟡 | Multiple phase systems exist and are partly overlapping (`careerStage`, `engine/leaguePhase`, `lib/stateMachine`, plus unused `state/advanceLeaguePhase`). Transition helpers exist, but enforcement is inconsistent at reducer action boundaries. |
| Roster / transactions | 🟡 | Canonical transaction ledger + replay + post-tx validation exist (`applyCanonicalTx` path via `applyTransaction` / `validatePostTx`), but not all mutation actions are consistently gated or normalized and some legacy paths remain. |
| Contracts / cap | 🟡 | Cap ledger, dead-cap projection, restructure simulation, and offer evaluation exist; models are pragmatic and gameable but not yet a full NFL-grade accounting engine (void years, richer guarantee structures, and deeper year-over-year realism are limited). |
| Trades | 🟡 | Trade UI and engine pathways exist (including draft-pick swap support), plus deadline checks. Still has correctness gaps (legacy `TRADE_PLAYER` path routes to `CUT_APPLY`; deadline default constant is 0 and depends on migration/initialization safety). |
| Free agency | 🟡 | Deterministic offer/resolve flows exist (seeded resolution keys), but action gating is inconsistent (`FA_SIGN` path lacks explicit `careerStage` gate unlike sibling actions). |
| Draft / scouting | 🟡 | Draft sim, trade-up offers, CPU advancement, and combine/predraft modules exist; several scouting subfeatures remain explicit placeholders (“Coming soon” pages for interviews/medical/private workouts). |
| Schedule / standings | 🟡 | League schedule generation, weekly league simulation, and standings table wiring are implemented; still lacks complete league-history/stat-persistence depth and some older docs are stale relative to current implementation. |
| Game day loop | 🟡 | Playcall-to-outcome simulation and game progression are implemented with deterministic seed usage; weather is passed into sim, but several physics calls still hardcode dry-surface context in branches, limiting environmental fidelity. |
| Playoffs / rollover | 🟡 | Playoffs and season rollover exist with progression and offseason transition; rollover aggressively compacts telemetry and game history, which is good for size but currently trims analytical continuity. |
| Telemetry layer | 🟡 | Play-log capture, per-game aggregates, season aggregates, and percentile computation exist. However telemetry retention is partial across rollover, and initial telemetry initialization has duplicate object assignment in initial state declaration. |
| Badges / traits | ⬜ | No dedicated competitive badge engine (thresholding + eligibility + sample gating + lifecycle) found; UI “badges” are mostly cosmetic chips. |
| Unicorn archetypes | ⬜ | No standalone unicorn subsystem (trait-driven rarity model + AI usage enforcement + telemetry dependency chain) found. |
| Weather system | 🟡 | Venue climate dataset validation + deterministic generation + save persistence are implemented; gameplay modifiers are integrated in parts of sim, but not uniformly threaded through all situational resolvers. |
| UI / screen families | 🟡 | Hub and major families are broad and navigable, but several routed modules are placeholders (`HallOfFame`, multiple scouting submodules). |
| Global utilities | 🟡 | Some utility capabilities exist (search in several screens, shortlist mechanics in tampering/combine), but no cohesive global utility layer for universal search/watchlist/as-of headers. |

Legend: ✅ Complete | 🟡 Partial | 🔴 Stubbed | ⬜ Absent

## Integrity Flags

1. **Determinism violation (client timing randomness):** `Math.random()` is used in offseason draft UI CPU-pick delay logic. This does not currently mutate deterministic sim outcomes directly, but it can alter sequencing/timing and replay ergonomics in subtle ways.  
   - `src/pages/hub/offseason/Draft.tsx:37`

2. **Phase invariant gap:** `FA_SIGN` executes without explicit `careerStage === "FREE_AGENCY"` guard, while adjacent FA actions do enforce it. This allows out-of-window writes if action dispatch leaks.  
   - `src/context/GameContext.tsx` (`case "FA_SIGN"` block near reducer action section)
   - Compare with guarded cases: `FA_BOOTSTRAP_FROM_TAMPERING`, `FA_SUBMIT_OFFER`, etc. in same reducer region.

3. **Silent behavior corruption / orphaned legacy path:** `TRADE_PLAYER` dispatch path maps to `CUT_APPLY` instead of a trade transaction. If still dispatchable anywhere, it can silently produce wrong state transitions.  
   - `src/context/GameContext.tsx` (`case "TRADE_PLAYER"`)

4. **Schema/shape drift signal:** Initial state uses duplicate `telemetry` object assignment; earlier assignment is overwritten by later one in object literal construction. Runtime may still function, but this is a drift smell and easy future regression vector.  
   - `src/context/GameContext.tsx` (two `telemetry:` keys in `createInitialState()` literal)

5. **Orphaned/dead code track:** `src/state/advanceLeaguePhase.ts` holds a full alternate phase pipeline that appears referenced only by its own tests, not by runtime app flow.  
   - Runtime uses `src/engine/leaguePhase.ts` and reducer transitions in `GameContext`.

6. **Trade deadline default risk:** global default is `0`, making trades instantly “past deadline” unless the live league state is correctly initialized/migrated. Guard rails exist, but default itself is risky.  
   - `src/engine/tradeDeadline.ts:1`

## Stability Blockers

1. **Reducer phase-gating inconsistency on mutating actions** (notably `FA_SIGN`, plus legacy action drift) can permit out-of-phase writes and state divergence.
2. **Legacy trade alias path (`TRADE_PLAYER` → `CUT_APPLY`)** can silently create wrong transaction semantics if invoked.
3. **Dual/parallel phase pipelines** (`engine/leaguePhase`, `lib/stateMachine`, `state/advanceLeaguePhase`) increase long-term risk of transition drift and invalid action windows.

## Feature Gaps (non-blocking)

- Dedicated badges progression engine (performance thresholds, sample gating, seasonal lifecycle).
- Unicorn archetype subsystem dependent on mature telemetry contracts.
- Full scouting feature completion (medical/interviews/private workouts).
- Unified global utilities layer (cross-screen search/watchlist/as-of consistency).

---

## Single Highest-Leverage Next Implementation Step

### Recommendation
**Implement a centralized reducer-level phase/invariant guard for all mutating franchise actions, then apply it to Free Agency + Trade + Draft transaction entry points first.**

### Why this is the right next step
1. **Stability-first:** It directly addresses the highest-risk class of issues identified (out-of-phase mutations and silent wrong-action semantics), which can cause save divergence over time.
2. **Core-loop protection:** Weekly/offseason progression depends on strict action windows; enforcing those invariants protects every downstream system.
3. **Completing partial foundation:** The code already has strong transaction/validation infrastructure—this step wires existing architecture consistently rather than adding new net-new features.
4. **Dependency ordering:** It must precede telemetry-dependent feature expansion (badges/unicorns/weather depth), otherwise new systems inherit unstable state transitions.

### Where to start (specific code touchpoints)
1. `src/context/GameContext.tsx`
   - Introduce a `guardActionPhase(...)` helper near reducer utility functions.
   - Enforce on `FA_SIGN`, `TRADE_ACCEPT`, `DRAFT_*`, and any contract-mutating actions.
   - Replace or remove legacy `TRADE_PLAYER` branch to prevent cut-trade semantic drift.
2. `src/engine/tradeDeadline.ts`
   - Replace risky `TRADE_DEADLINE_DEFAULT_WEEK = 0` fallback with an explicit safe default aligned to season rules (or force explicit value via migration).
3. `src/lib/migrations/saveSchema.ts` + reducer boot migration section in `GameContext`
   - Add/confirm migration clamps for phase/careerStage/deadline fields to guarantee valid action windows on load.
4. Tests:
   - Add/expand reducer tests asserting rejected out-of-phase actions (FA sign outside FREE_AGENCY, draft actions outside DRAFT, etc.).

### Definition of Done
- Every mutating roster/cap/transaction action has an explicit phase guard and deterministic failure behavior.
- Legacy ambiguous action aliases (`TRADE_PLAYER`) are removed or hard-failed with migration-safe fallback.
- Existing + new tests verify no state mutation occurs when action is dispatched outside valid phase.
- Save-load migration normalizes phase/deadline fields so guard logic behaves deterministically for old saves.
- `check:determinism` and targeted reducer/phase tests pass.

### What this unblocks
- Safe completion of partial systems (free agency depth, trade negotiations, draft UX) without risking save divergence.
- Confident extension of telemetry consumers (badges/unicorn-style systems) on top of trustworthy lifecycle transitions.
- Easier future refactors toward a single canonical phase pipeline.
