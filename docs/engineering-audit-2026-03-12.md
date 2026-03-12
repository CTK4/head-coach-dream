# Engineering Audit — Head Coach Dream
**Date:** 2026-03-12 (updated after follow-up pass) | **Branch:** `claude/engineering-audit-fnuoM`

---

## 0. What This Document Is

A living engineering audit. Findings are cumulative — each pass marks prior items as resolved, updates metrics,
and adds newly discovered items. The goal is a single authoritative reference for the next engineer or AI session
to pick up from with no ambiguity about what is done, what is in progress, and what the concrete next steps are.

---

## 1. Repository Snapshot

| Item | Detail |
|------|--------|
| **Language** | TypeScript 5.8.3 (strict mode OFF — see §4.1) |
| **Framework** | React 18.3.1 + React Router 6.30.1 |
| **Build** | Vite 5.4.19 + SWC (`@vitejs/plugin-react-swc` 3.11.0) |
| **UI** | shadcn/ui (Radix UI v1) + Tailwind CSS 3.4.17 |
| **State** | Single `GameContext` (useReducer, 9,867 lines) |
| **Testing** | Vitest 4.0.18 (unit) + Playwright (E2E, Chromium only) |
| **Source files** | ~518 TypeScript/TSX (excluding tests), 172 test files |
| **Total lines** | ~67,628 (engine ~21k, context ~9.9k, pages ~15k) |
| **Deployment** | Vercel SPA (web) + Capacitor (iOS/Android) |
| **Save persistence** | `localStorage` with backup/restore + schema migration |
| **leagueDB** | `src/data/leagueDB.json` (11MB, bundled at build time) |

---

## 2. Architecture

```
index.html → src/main.tsx → src/App.tsx
  QueryClientProvider (@tanstack/react-query)
  ┗ GameProvider (GameContext.tsx, 9,867 lines)
      ┗ BrowserRouter → 99+ route definitions (App.tsx)
          Pages: Hub, Draft, Scouting, Playcall, League…

GameContext ──dispatches──▶ 233-case reducer
    │
    ├──▶ src/engine/  (168 source files, ~21k lines, 107 test files)
    │     Core: gameSim.ts (1,938), draftSim.ts (835),
    │           leagueSim.ts (438), tradeEngine.ts (330)
    │     Sub-systems: physics/, scouting/, telemetry/,
    │                  transactions/, badges/, unicorns/,
    │                  determinism/, config/, game/,
    │                  defense/, contracts/, jerseyNumbers/,
    │                  playbooks/, qb/, weather/, interviewHiring/
    │
    ├──▶ src/data/  (leagueDB.json 11MB + leagueDb.ts 586 lines)
    │
    └──▶ src/lib/   (saveManager.ts 624, stateMachine.ts, migrations/,
                     logger.ts, debugBundle.ts, saveSchema.ts…)

localStorage ◀──▶ src/lib/saveManager.ts
  Primary slot + backup slot + metadata
  Schema: LATEST_SAVE_SCHEMA_VERSION = 2 (migrations chain in saveSchema.ts)

/public/leagueDB.migrated.clean.json  ← 11MB duplicate for runtime fetch (not yet used)
```

---

## 3. Audit Pass Summary

### Pass 1 — 2026-03-12 (commit `f65b331`)

| ID | Item | Outcome |
|----|------|---------|
| C1 | Duplicate `gameSim` import in `GameContext.tsx` | ✅ Fixed |
| C2 | `GameContext` provider value not memoized | ✅ Fixed (`useMemo`) |
| H2 | `no-unused-vars` ESLint rule was `"off"` | ✅ Fixed (`"warn"` + underscore exceptions) |
| H4 | No `npm audit` in CI | ✅ Fixed (`--audit-level=high` step added) |
| L4 | `stateMachine.ts` `getPhaseKey()` used substring matching for all phases | ✅ Fixed (exact enum switch first) |
| M3 | `vitest` in `dependencies` instead of `devDependencies` | ✅ Fixed |
| M5 | GitHub Actions pinned to tag names, not commit SHAs | ✅ Fixed (SHA-pinned) |
| L3 | No vendor chunk splitting in Vite config | ✅ Fixed (5 manual chunk groups added) |

### Pass 2 — 2026-03-12 (commit `508706c`)

| ID | Item | Outcome |
|----|------|---------|
| M6 | `bun.lockb` dual lock file | ✅ Removed |
| H3a | Unit tests for `buyout.ts` | ✅ 14 cases added |
| H3b | Unit tests for `capProjection.ts` (`projectLeagueCap`) | ✅ 9 cases added |
| H3c | Unit tests for `contractMath.ts` (5 functions) | ✅ 21 cases added |
| H3d | Unit tests for `standings.ts` | ✅ 16 cases added |
| H3e | Unit tests for `tiebreaks.ts` (3 functions) | ✅ 14 cases added |
| M2 | Route-level code splitting | ✅ 35+ pages converted to `React.lazy()`, route tree wrapped in `<Suspense>` |

---

## 4. Open Findings

### 4.1 TypeScript Strictness (High — Architectural Risk)

**Status:** Open — no changes in either pass.

**Current flags** (all disabled in `tsconfig.app.json`):
```json
"strict": false,
"noImplicitAny": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noFallthroughCasesInSwitch": false
```
`strictNullChecks` is also disabled (it defaults off when `strict: false`).

**Impact:** TypeScript provides effectively no null-safety guarantees. The engine can access `undefined.field`
at runtime and never surface it at compile time. Given 9,867 lines of GameContext reducer and 168 engine
files this is the single highest-ROI incremental improvement.

**Also present:** `@typescript-eslint/no-explicit-any` is globally `"off"` for `GameContext.tsx`
(`eslint.config.js` line 40). This masks **179 `any`-casts** in the most critical file. 38 engine files
also contain `any` casts, with the highest concentrations in:
- `gameSim.ts` — physics integration, player stat lookups
- `draftSim.ts` — player generation, BPA evaluation
- `rosterOverlay.ts` — all roster/contract read paths

**Target: ES2020** in `tsconfig.app.json` means top-level `await` is unavailable — this blocks the
cleanest async `leagueDB.json` initialization path (see §4.3).

**Migration path for the next pass:**
1. Enable `strictNullChecks: true` in `tsconfig.app.json`. Run `tsc --noEmit` and fix engine layer first
   (most isolated, best coverage). Expected error count: 200–500. Worst files: `gameSim.ts`, `draftSim.ts`,
   `rosterOverlay.ts`.
2. Remove the `no-explicit-any: "off"` override in `eslint.config.js` line 40 for `GameContext.tsx`.
   Fix casts incrementally; prioritize the 233-case reducer's state-mutation paths.
3. Enable `noImplicitAny: true` scoped to `src/engine/` using a path-scoped tsconfig override.
4. Enable `noUnusedLocals: true` after dead code is addressed.

---

### 4.2 GameContext Monolith (High — Maintainability + Performance)

**Status:** Partially mitigated — provider value memoized (pass 1). Core problem open.

**Current state:**
- `GameContext.tsx` is **9,867 lines** with a **233-case reducer**.
- Mixes React concerns (context, effects) with all business logic (cap calculations, offseason orchestration,
  simulation dispatch, FA logic, playoff logic, staff logic).
- 179 explicit `any` casts throughout.
- Only 17 `try/catch` blocks for 233 reducer cases — most dispatches have no error handling.

**Concrete next step — the extraction pattern already exists:**
`src/context/reducers/staffingReducer.ts` demonstrates the correct slice pattern.
Use it as a template to extract in this order:
1. `rosterReducer` — DEPTH_CHART_*, ROSTER_*, player-update cases (~30 cases)
2. `financeReducer` — CAP_*, CONTRACT_*, RESTRUCTURE_* cases (~15 cases)
3. `offseasonReducer` — OFFSEASON_*, DRAFT_*, FA_*, RESIGN_*, TRADE_* cases (~50 cases)
4. `simReducer` — ADVANCE_WEEK, ADVANCE_PLAY, GAME_* cases (~20 cases)

Each slice file: `src/context/reducers/<name>Reducer.ts`, target `< 500 lines`, paired with a
`<name>Reducer.test.ts` covering the golden-path mutation.

---

### 4.3 leagueDB.json Bundle Size (Medium — Startup Performance)

**Status:** Open — blocked by module-level initialization pattern.

**Root cause — two module-level synchronous calls:**
```ts
// src/engine/capLedger.ts, line 5
const LEAGUE_CAP_DEFAULT = getLeague().salaryCap;

// src/engine/capProjection.ts, line 9
export const DEFAULT_BASE_CAP = getLeague().salaryCap;
```
Both call `getLeague()` at module import time. Any async initialization of `leagueDb.ts` cascades through
all importers of these two modules, which is effectively the entire engine layer.

**Also blocking:** `tsconfig.app.json` targets ES2020, which does not support top-level `await`.

**Concrete migration steps (single session estimate: 2–3 hours):**
1. Bump `"target"` to `"ES2022"` and add `"ES2022"` to `"lib"` in `tsconfig.app.json`. Verify CI passes.
2. In `capLedger.ts`: change `const LEAGUE_CAP_DEFAULT = getLeague().salaryCap` to a lazy accessor
   `function getLeagueCapDefault() { return getLeague().salaryCap; }`. Update the 3 internal call-sites.
3. Same pattern in `capProjection.ts`. Audit callers of `DEFAULT_BASE_CAP`:
   `grep -rn "DEFAULT_BASE_CAP" src/` — there are ~4 call-sites.
4. In `leagueDb.ts`: add `export async function initLeagueDb(): Promise<void>` that calls
   `fetch("/leagueDB.migrated.clean.json")`, parses JSON, assigns to the module-level `let root` variable.
   Keep all existing accessor functions synchronous.
5. In `src/main.tsx`: `await initLeagueDb()` before `ReactDOM.createRoot(...).render(...)`.
6. Keep a loading skeleton visible until the promise resolves (app shell is already present).

**Impact:** ~11MB off the JS bundle. V8 parse time reduced ~300–800ms on mid-range mobile.
The JSON is already in `/public/leagueDB.migrated.clean.json` — no new file needed.

---

### 4.4 Test Coverage Gaps (High — Regression Risk)

**Status:** Improved in pass 2. Significant gaps remain.

**Coverage snapshot (post pass 2):**

| Area | Source files | Test files | Status |
|------|-------------|-----------|--------|
| Engine transactions/ | 11 | 12 | ✅ Good — spine invariants covered |
| Engine physics/ | 12 | 7 | ✅ Good — core resolvers covered |
| Engine config/ | 3 | 2 | ✅ Good |
| Engine determinism/ | 1 | 4 | ✅ Excellent |
| Engine buyout.ts | 1 | 1 | ✅ New (pass 2) |
| Engine capProjection.ts | 1 | 1 | ✅ New (pass 2, pure functions only) |
| Engine contractMath.ts | 1 | 1 | ✅ New (pass 2) |
| Engine standings.ts | 1 | 1 | ✅ New (pass 2) |
| Engine tiebreaks.ts | 1 | 1 | ✅ New (pass 2) |
| Engine capLedger.ts | 1 | 0 | ❌ Zero — P1 |
| Engine rosterOverlay.ts | 1 | 0 | ❌ Zero — P1 |
| Engine draftSim.ts | 1 | 0 | ❌ Zero — P1 (835 lines) |
| Engine tradeEngine.ts | 1 | 1 (thin) | ⚠️ Needs expansion — P2 |
| Engine scouting/ | 16 | 0 | ❌ Zero — P2 |
| Engine badges/ | 3 | 0 | ❌ Zero — P3 |
| Engine unicorns/ | 3 | 0 | ❌ Zero — P3 |
| Engine telemetry/ | 6 | 1 (diag) | ⚠️ Thin — P3 |
| Engine schedule.ts | 1 | 0 | ❌ Zero — P2 |
| Engine seasonEnd.ts | 1 | 0 | ❌ Zero — P2 |
| Context | 1 | 42 | ✅ Good integration coverage |
| Lib | ~10 | 10 | ✅ Moderate |
| E2E (Playwright) | — | 11 specs / 376 lines | ⚠️ Smoke-level only |

**Priority order for next test-writing pass:**

| Priority | Module | Risk | Lines | Recommended approach |
|----------|--------|------|-------|---------------------|
| P1 | `capLedger.ts` | Cap space bugs corrupt saves silently | 194 | Unit — mock `getLeague()` + `rosterOverlay`; test `buildCapLedger` input/output |
| P1 | `rosterOverlay.ts` | All cap/contract reads flow through this | ~200 | Unit — mock `leagueDb`; test `getEffectivePlayersByTeam` with overrides |
| P1 | `draftSim.ts` | 835 lines, zero tests; BPA + need logic | 835 | Seed-determinism test first: same seed → same pick order |
| P2 | `tradeEngine.ts` | Acceptance has ~10 cases; needs edge cases | 330 | Expand with: rival bonus, rebuild discount, bad-contract friction |
| P2 | `scouting/` suite | 16 files, 0 tests; fog-of-war reveal logic | ~600 | Start with `combineScore.ts` + `percentiles.ts` (pure math) |
| P2 | `schedule.ts` | Schedule generation + tiebreaker ordering | ? | Unit |
| P2 | `seasonEnd.ts` | Season rollover; award persistence | ? | Integration with minimal GameState |
| P3 | `badges/engine.ts` | Badge trigger correctness | 3 files | Data-driven: assert badge IDs given rating inputs |
| P3 | `telemetry/` | Aggregation math correctness | 6 files | Unit — pure aggregation functions |

**E2E gaps — these sequences are completely untested:**
- Full 18-week regular season simulate-through with standings validation
- Draft: CPU AI picks + user pick + trade during draft + post-draft grade output
- Free agency: open FA pool → sign → cap hit validation → roster update round-trip
- Contract restructure + buyout + dead money ledger round-trip
- Playoffs: bracket generation → round advancement → title game
- Season rollover → offseason entry → next season initialization
- Recovery mode: inject corrupt `localStorage` save → verify detection + backup restore

**Unlock suggestion:** Add a Playwright fixture `injectSave(page, stateJson)` that writes a known `GameState`
to `localStorage` before navigation. This eliminates the full onboarding precondition from every E2E test
and would cut spec setup time by ~80%. All the full-loop tests above need this.

---

### 4.5 UI Architecture Issues (Low → Medium)

**A. Banned `getPlayers`/`getPlayersByTeam` still imported in 5 UI files**

ESLint `no-restricted-imports` correctly bans these raw DB accessors from UI/page/component files.
Violations still present in:
- `src/pages/hub/PhaseSubsystemRoutes.tsx`
- `src/pages/hub/ResignPlayers.tsx`
- `src/pages/hub/TagCenter.tsx`
- `src/pages/hub/CapProjection.tsx`
- `src/pages/hub/CapBaseline.tsx`

Fix: replace with `getEffectivePlayersByTeam` from `src/engine/rosterOverlay.ts` or context selectors.

**B. Other raw `leagueDb` imports in UI layer (beyond banned methods)**

15 page/component files import `getTeamById`, `getLeague`, etc. directly:
`FiredScreen.tsx`, `RegularSeason.tsx`, `HallOfFame.tsx`, `TradeHub.tsx`, `FreeAgencyRecap.tsx`,
`Trades.tsx`, `Playoffs.tsx`, `FrontOffice.tsx`, `AssistantHiring.tsx`, `PlayerContracts.tsx`, others.

Fix: extend `no-restricted-imports` to include `getTeamById` and `getLeague`, provide facade
functions in `src/engine/` or `src/lib/` for the common use cases.

**C. `console.log` / `console.warn` in engine production code**

Two engine files emit console output at runtime (confirmed via `grep`):
- `src/engine/personnel.ts`
- `src/engine/phaseUtils.ts`

Fix: replace with `logInfo` / `logWarn` from `src/lib/logger.ts`. Output goes into the structured
debug buffer (capped at 200 entries), not the browser console in production.

---

### 4.6 CI and Build Hardening (Low — open items)

**A. No bundle size tracking**
No `bundlesize`, `size-limit`, or Vite visualizer step in CI. An accidental re-inline of
`leagueDB.json` or a large new dependency could ship without detection.

Fix: add `vite-plugin-visualizer` to the build output (report only, not blocking) or add a
`bundlesize` check for initial load budget. Track: `vendor-react`, `vendor-radix`, main app chunk.

**B. E2E tests run Chromium only**
`playwright.config.ts` has `projects: [{ name: "chromium" }]` only. Mobile Safari (WebKit) is
untested. Given the Capacitor iOS target, Safari-specific rendering bugs are a real risk.

Fix: add `{ name: "webkit", use: { ...devices["Desktop Safari"] } }` to `playwright.config.ts`.

**C. No `--max-old-space-size` guard on CI unit test step**
172 test files with integration-heavy engine tests may OOM on low-memory CI runners.

Fix: add `NODE_OPTIONS="--max-old-space-size=4096"` to the `Unit tests` CI step.

---

### 4.7 Save System (Low — monitoring required)

**Status:** Solid fundamentals; two monitoring items.

- Schema migration chain: `LATEST_SAVE_SCHEMA_VERSION = 2`. Two steps in `saveSchema.ts`. No gaps.
  The chain is not tested for its migration path itself — only for the final shape.
- Backup/restore: atomic primary + backup slot. Corrupt primary falls back to backup before surfacing
  `CORRUPT_SAVE`. Recovery mode (`state.recoveryNeeded`) routes to `RecoveryModePage`. Confirmed present.

**Risk A — localStorage quota on mobile (5–10MB):**
A long franchise save (many seasons, full stats, large transaction ledger) may approach limits.
No `navigator.storage.estimate()` check or quota-warning exists in `saveManager.ts`.
Fix: call `navigator.storage.estimate()` before each save write; warn the user at 80% quota usage.

**Risk B — migration chain untested:**
The save migration path is not covered by tests. A regression in a future migration could silently
corrupt all existing saves on load.
Fix: add a test in `src/lib/` that calls `migrateSave({ schemaVersion: 0, ... })` and asserts valid
schema v2 output with expected field shapes.

---

## 5. Complete Fix Inventory

### ✅ Done (Passes 1 + 2)

| ID | Description | Commit |
|----|-------------|--------|
| C1 | Fix duplicate `gameSim` import in `GameContext.tsx` | `f65b331` |
| C2 | Memoize `GameContext` provider value (`useMemo`) | `f65b331` |
| H2 | `no-unused-vars` → `"warn"` + underscore exceptions | `f65b331` |
| H4 | `npm audit --audit-level=high` in CI | `f65b331` |
| L4 | `stateMachine.ts` phase matching — exact enum first | `f65b331` |
| M3 | `vitest` moved to `devDependencies` | `f65b331` |
| M5 | GitHub Actions SHA-pinned | `f65b331` |
| L3 | Vendor `manualChunks` in `vite.config.ts` | `f65b331` |
| M6 | Remove `bun.lockb` | `508706c` |
| H3a | Unit tests: `buyout.ts` (14 cases) | `508706c` |
| H3b | Unit tests: `capProjection.ts` `projectLeagueCap` (9 cases) | `508706c` |
| H3c | Unit tests: `contractMath.ts` (21 cases across 5 functions) | `508706c` |
| H3d | Unit tests: `standings.ts` (16 cases) | `508706c` |
| H3e | Unit tests: `tiebreaks.ts` (14 cases across 3 functions) | `508706c` |
| M2 | Route-level `React.lazy()` code splitting (35+ pages) | `508706c` |

### 🔲 Open (Prioritized for Next Pass)

| ID | Description | Complexity | Severity | Concrete first step |
|----|-------------|-----------|----------|-------------------|
| H1 | Enable `strictNullChecks: true` | High | High | Add to `tsconfig.app.json`; run `tsc --noEmit`; fix engine first |
| H3f | Unit tests: `capLedger.ts` | Medium | High | Mock `getLeague()` + `rosterOverlay`; test `buildCapLedger` |
| H3g | Unit tests: `rosterOverlay.ts` | Medium | High | Mock `leagueDb`; test `getEffectivePlayersByTeam` |
| H3h | Unit tests: `draftSim.ts` — seed determinism | High | High | Same seed → same pick order assertion |
| H3i | Expand `tradeEngine.ts` tests | Medium | Medium | Add rival/rebuild/bad-contract edge cases |
| H3j | Unit tests: `scouting/` suite | High | Medium | Start with `combineScore.ts` + `percentiles.ts` |
| H3k | Unit tests: `badges/engine.ts` | Medium | Medium | Data-driven assertions per badge trigger |
| M1 | Lazy-load `leagueDB.json` via `fetch()` | High | Medium | Step 1: bump tsconfig target to ES2022 |
| M4a | E2E: full 18-week season loop | High | Medium | Add `season-loop.spec.ts` with Playwright `injectSave` fixture |
| M4b | E2E: draft loop (CPU + user + trade during draft) | High | Medium | Requires `injectSave` fixture at pre-draft state |
| M4c | E2E: playoffs through title game | High | Medium | Requires `injectSave` fixture at playoff entry |
| M4d | E2E: season rollover + next season entry | Medium | High | Requires `injectSave` fixture at season end |
| M4e | E2E: corrupt save → recovery mode flow | Medium | High | Write corrupt JSON directly to `localStorage`, verify routing |
| L1 | Remove `no-explicit-any: "off"` for `GameContext.tsx` | High | Medium | Fix 179 casts; reducer input types first |
| L2 | Extract reducer slices from `GameContext.tsx` | High | Medium | Extract `rosterReducer` first; reference `staffingReducer.ts` |
| L5 | Fix banned `getPlayers`/`getPlayersByTeam` in 5 UI files | Low | Low | Replace with `getEffectivePlayersByTeam` |
| L6 | Replace `console.log/warn` in `personnel.ts` + `phaseUtils.ts` | Low | Low | Use `logInfo`/`logWarn` from `src/lib/logger.ts` |
| L7 | Add WebKit project to Playwright config | Low | Medium | Add `{ name: "webkit", use: { ...devices["Desktop Safari"] } }` |
| L8 | Bundle size CI guard | Low | Low | Add `vite-plugin-visualizer` to build output |
| L9 | `localStorage` quota monitoring in `saveManager.ts` | Low | Medium | `navigator.storage.estimate()` before save; warn at 80% |
| L10 | Save schema migration chain test | Low | Medium | Test: v0 input → valid v2 output with expected field shapes |

---

## 6. Verification Commands

```bash
# Type safety
npm run typecheck

# Lint (no-unused-vars warnings should now surface dead code)
npm run lint

# Unit tests (172 test files)
npx vitest run

# Smoke + determinism
npm run smoke
npm run check:determinism

# Full build (prebuild checks + vendor chunk output)
npm run build

# E2E (requires build + Chromium)
npm run test:ui
```

---

## 7. Strategic Recommendations

### S1. TypeScript strictness (most impactful, start now)
Enable `strictNullChecks` first. Fix the engine layer before touching GameContext.
Estimated effort: 2–4 sessions. Unlocks all downstream type-safety improvements.

### S2. GameContext reducer split
Extract `rosterReducer` first — it has the clearest input/output shape and the best adjacent test
coverage. Reference: `src/context/reducers/staffingReducer.ts`. Each extracted slice needs:
- Its own `src/context/reducers/<name>Reducer.ts` (target < 500 lines)
- A co-located `*.test.ts` with golden-path mutation coverage

### S3. leagueDB async init (highest startup performance ROI)
Two 1-line changes in `capLedger.ts` and `capProjection.ts` unblock the entire migration. ES2022
target bump is the prerequisite. Total implementation: ~2–3 hours once unblocked.

### S4. E2E fixture infrastructure before E2E tests
Write the `injectSave(page, stateJson)` Playwright fixture first (~50 lines). Without it, every
full-loop E2E test must run through the full onboarding, which is slow and fragile. With it, tests
start from a known good state at any point in the game loop.

### S5. Next test-writing session priority
If only one area gets new tests in the next pass, make it `capLedger.ts`. Cap bugs corrupt saves
silently. Use `src/engine/__tests__/deadMoney.test.ts` as the reference pattern for mock structure.

---

## 8. Files Changed Across Both Audit Passes

| File | Change | Pass |
|------|--------|------|
| `src/context/GameContext.tsx` | Fixed duplicate import; added `useMemo` to provider value | 1 |
| `src/lib/stateMachine.ts` | `getPhaseKey()` now uses exact enum switch first | 1 |
| `eslint.config.js` | `no-unused-vars` → `"warn"` + underscore exceptions | 1 |
| `.github/workflows/ci.yml` | SHA-pinned actions; added `npm audit` step | 1 |
| `package.json` | Moved `vitest` to `devDependencies` | 1 |
| `vite.config.ts` | Added 5 vendor `manualChunks` groups | 1 |
| `bun.lockb` | Deleted (standardize on `package-lock.json`) | 2 |
| `src/App.tsx` | 35+ pages converted to `React.lazy()`; route tree wrapped in `<Suspense>` | 2 |
| `src/engine/__tests__/buyout.test.ts` | New — 14 test cases | 2 |
| `src/engine/__tests__/capProjection.test.ts` | New — 9 test cases | 2 |
| `src/engine/__tests__/contractMath.test.ts` | New — 21 test cases | 2 |
| `src/engine/__tests__/standings.test.ts` | New — 16 test cases | 2 |
| `src/engine/__tests__/tiebreaks.test.ts` | New — 14 test cases | 2 |
| `docs/engineering-audit-2026-03-12.md` | This document | 1 + 2 |
