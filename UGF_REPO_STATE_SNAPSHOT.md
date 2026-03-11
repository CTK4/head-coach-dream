# UGF Repo State Snapshot
**Audit date:** 2026-03-10
**Auditor:** Claude claude-sonnet-4-6

---

## 1. Repository Layout

### 1.1 First-level subdirectories under `src/`

```
components  config  context  controllers  data  design  dev  engine
hooks  lib  models  pages  routes  state  styles  systems  test
testHarness  types
```

### 1.2 Presence of expected directories

All six confirmed present:
- `src/engine/` — YES
- `src/context/` — YES
- `src/pages/` — YES
- `src/components/` — YES
- `src/data/` — YES
- `src/lib/` — YES

### 1.3 Directories NOT in the expected set

- `src/config/`
- `src/controllers/`
- `src/design/`
- `src/dev/`
- `src/hooks/`
- `src/models/`
- `src/routes/`
- `src/state/`
- `src/styles/`
- `src/systems/`
- `src/test/`
- `src/testHarness/`
- `src/types/`

### 1.4 Dual RNG file presence

Both confirmed:
- `src/engine/rng.ts` — YES
- `src/engine/rand.ts` — YES

---

## 2. RNG / Determinism

### Per-file findings

| File | Mulberry32 present? | `Math.random()` | `Date.now()` seed |
|---|---|---|---|
| `src/engine/rng.ts` | YES — exported, `1 \| t` / `61 \| x` variant | None | None |
| `src/engine/rand.ts` | YES — exported, bitwise-identical to `rng.ts` | None | None |
| `src/engine/scouting/rng.ts` | YES — **different variant**: mutates `seed` parameter directly in closure, uses `t \| 1` / `t \| 61` operand order | None | None |
| `src/engine/interviewHiring/rng.ts` | **NO** — exports `class XorShift32` (completely different algorithm) | None | None |
| `src/engine/leagueSim.ts` | YES — private at line 146, uses `t \| 1` / `x \| 61` (different operand order from `rng.ts`) | None | None |
| `src/engine/contracts/offerDecision.ts` | YES — private at line 50, matches `rng.ts` operand order | None | None |
| `src/engine/feedbackEvents.ts` | NO — pure factory/format module | None | None |
| `src/engine/schedule.ts` | YES — inlined body inside `shuffle` at line 22; uses `1 \| localSeed` (matches `rng.ts` order) | None | None |

### Additional mulberry32 copies discovered beyond the eight target files

| File | Line | Scope | Variant notes |
|---|---|---|---|
| `src/engine/injuries.ts` | 16 | private | Uses `a \|= 0` and `(a + 0x6d2b79f5) \| 0` signed-int clamping — distinct output sequence |
| `src/engine/termination.ts` | 52 | private | `1 \| t`, `61 \| x` — matches `rng.ts` |
| `src/engine/assistantHiring.ts` | 22 | private | `1 \| t`, `61 \| x` — matches `rng.ts` |
| `src/engine/playerAging.ts` | 63 | private | `t \| 1`, `x \| 61` — different operand order |
| `src/context/GameContext.tsx` | 1934 | private | `1 \| t`, `61 \| x` — matches `rng.ts` |

### Summary

**10 total mulberry32 declarations** across the source. At least **4 functionally distinct variants** that produce different output for the same input seed:
1. `rng.ts` / `rand.ts` / `termination.ts` / `assistantHiring.ts` / `offerDecision.ts` / `GameContext.tsx` — canonical, `1 | t` order
2. `scouting/rng.ts` — mutates closed-over `seed` parameter directly; different operand order
3. `leagueSim.ts` / `playerAging.ts` — different `Math.imul` operand order (`t | 1` vs `1 | t`)
4. `injuries.ts` — signed int clamping with `|0`
5. `interviewHiring/rng.ts` — not mulberry32 at all; is XorShift32

The previously documented `Math.random()` in `feedbackEvents.ts` and `Date.now()` seed in `schedule.ts` are **both fixed**.

---

## 3. Save System

### 3.1 `loadState()` and `CURRENT_SAVE_VERSION`

- **`CURRENT_SAVE_VERSION = 6`** (`GameContext.tsx`, line 555)
- `loadState()` is at `GameContext.tsx` line 9597. It calls `loadStateFromStorage()` from `src/context/boot/loadState.ts`, passing `currentSaveVersion: CURRENT_SAVE_VERSION`.
- `loadStateFromStorage` (`boot/loadState.ts`, line 65) conditionally runs `migrateSave` when `parsed.saveVersion < deps.currentSaveVersion`.
- `migrateSaveSchema()` (from `src/lib/migrations/saveSchema.ts`) is called inside `saveManager.ts`'s `readAndValidateState()` at line 105 — **before** `loadStateFromStorage` processes the data.

### 3.2 Dual save paths — asymmetric validation

Two independent migration/validation passes run in sequence on load:

**Pass 1 — `saveManager.ts` / `readAndValidateState`:**
- `parseSave → migrateSaveSchema → validateCriticalSaveState`
- `schemaVersion` axis (max: 2)
- Runs `validateCriticalSaveState` (checks phase, career, team, coach fields)

**Pass 2 — `src/context/boot/loadState.ts`:**
- `migrateSave` conditional on `saveVersion` axis (max: 6)
- Runs `applyBootValidators` (from `src/context/boot/validators.ts`)
- Does **not** re-run `validateCriticalSaveState`

Two independent versioning counters (`schemaVersion` and `saveVersion`) are in use. The validation sets applied by each pass are not identical.

### 3.3 `getUserTeamId()` definition count

**Exactly one definition.** Located at `src/lib/userTeam.ts`, line 14:
```typescript
export function getUserTeamId(state: GameState): string | null
```
No duplicate definitions exist.

### 3.4 No-op reducer action handlers

- **`TRADE_PLAYER`** (`GameContext.tsx`, lines 7824–7826): Returns `state` unchanged. Comment confirms: "Deprecated ambiguous alias: intentionally no-op to avoid accidental mutations."
- **`DYNASTY_INIT`**: Conditional no-op — returns `state` unchanged only when `state.dynasty` already exists; writes state when absent. Not a blanket pass-through.

The following delegated action types **throw** rather than return state: `FA_WITHDRAW`, `FA_WITHDRAW_OFFER`, `FA_ACCEPT_OFFER`, `FA_REJECT_OFFER`, `DRAFT_SIM_NEXT`, `DRAFT_SIM_TO_USER`, `DRAFT_SIM_ALL`, `NAV_TO_DRAFT_RESULTS`, `STAFF_COUNTER_OFFER`, `STAFF_COUNTER_OFFER_RESPONSE`, `RECOVERY_*` variants — all throw `Error("Unhandled delegated action")` at `GameContext.tsx` lines 9509–9527.

---

## 4. Ledger Integrity (Resigning.tsx / CutDowns.tsx)

### `src/pages/hub/offseason/Resigning.tsx`

**State data or hardcoded?**

HARDCODED. Lines 8–13:
```typescript
const EXPIRING = [
  { id: "PLY_1001", name: "D. Reed", pos: "WR", ovr: 84, askApy: 8_500_000 },
  { id: "PLY_1002", name: "M. Carter", pos: "CB", ovr: 81, askApy: 7_000_000 },
  { id: "PLY_1003", name: "N. Hayes", pos: "OL", ovr: 78, askApy: 5_250_000 },
  { id: "PLY_1004", name: "T. Brooks", pos: "DL", ovr: 76, askApy: 4_500_000 },
];
```
The component reads `state.offseasonData.resigning.decisions` (line 17) for existing decision state, but the player list itself is not derived from `state.roster`, `state.players`, or any real contract data.

**`CONTRACT_SIGNED` dispatch on accept?**

No. The accept dispatch (line 24):
```typescript
dispatch({ type: "RESIGN_SET_DECISION", payload: { playerId, decision: { action, years, apy } } });
```
`RESIGN_SET_DECISION` (handler at `GameContext.tsx`:5954) only writes the decision into `state.offseasonData.resigning.decisions`. No `CONTRACT_SIGNED` event is emitted, no ledger append occurs, and no cap or roster mutation results from this path.

**Player IDs real or hardcoded?**

Hardcoded. `PLY_1001`–`PLY_1004` do not exist in `leagueDB.json`'s Players table (which uses `PLY_11xxx`-range IDs for prospects and different ranges for rostered players).

---

### `src/pages/hub/offseason/CutDowns.tsx`

**State data or hardcoded?**

HARDCODED. Line 8:
```typescript
const ROSTER = Array.from({ length: 60 }, (_, i) => ({
  id: `R_${(i + 1).toString().padStart(3, "0")}`,
  name: `Player ${(i + 1).toString().padStart(2, "0")}`,
  pos: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"][i % 8],
  ovr: 55 + ((i * 7) % 35)
}));
```
60 synthetic players with IDs `R_001`–`R_060` and names `Player 01`–`Player 60`. No connection to `state.roster`, `state.players`, or `leagueDB.json`.

**`CUT_APPLY` or `CUT` ledger event on cut?**

No. The toggle dispatch:
```typescript
dispatch({ type: "CUT_TOGGLE", payload: { playerId: id } })
```
The `CUT_TOGGLE` handler (`GameContext.tsx`:8190) only mutates `state.offseasonData.cutDowns.decisions[playerId]`. It emits no ledger event, does not call `CUT_APPLY`, and does not remove any player from any roster index. The `CUT_APPLY` action (`GameContext.tsx`:7731) — which does write to the transaction ledger — is never dispatched from this component.

---

## 5. Data Layer Bugs

### 5.1 Salary cap mismatch

- **`leagueDB.json` League table**: `"salaryCap": 210000000` ($210M)
- **`src/pages/hub/RosterAudit.tsx` line 24**: `const SALARY_CAP = 224_800_000` ($224.8M, hardcoded)
- Engine reads `getLeague().salaryCap` → $210M (canonical)
- `RosterAudit.tsx` uses $224.8M for display — **$14.8M discrepancy**
- `TeamFinances` table stores per-team `capSpace` (remaining) but has no `salaryCap` field; cap total is implicitly derived from the League table

### 5.2 Phantom player rows (null `playerId`)

Players table: **1,697 rows**, **0 rows with null or empty `playerId`**. No phantom player rows found. **FIXED** from prior audit.

### 5.3 Null Personnel rows

Personnel table: **1,378 rows**, **197 rows with `personId: null`**.

All 197 null rows have all identity fields null (`fullName`, `role`, `teamId`, `status`, `age`, `reputation`, `contractId`), with only `scheme` populated and a spurious `Column1: null` field. Example:
```json
{ "personId": null, "fullName": null, "role": null, "teamId": null,
  "status": null, "age": null, "scheme": "West Coast",
  "reputation": null, "contractId": null, "Column1": null }
```
These appear to be padding/template rows from spreadsheet export.

### 5.4 Excel header row baked into data tables

**No matches found.** No table row has a field value equal to its field name. **FIXED** from prior audit.

### 5.5 Draft ID scheme incompatibility

Three tables have incompatible linkage:

| Table | ID field | Format | Notes |
|---|---|---|---|
| `DraftOrder` | None | — | Fields: `season`, `round`, `pick`, `teamId`, `notes`. No prospect ID. |
| `DraftPicks` | `pickId`, `playerId` | `PICK_2026_R1_MIL` | All 224 rows have `playerId: null` |
| `2026_Draft_Class` | `"Player ID"` (space in name) | `PLY_11697`–`PLY_12048` | No cross-reference to either other table |

**Incompatibilities:**
1. `DraftOrder` has no ID field linking it to `DraftPicks` or `2026_Draft_Class` — join requires positional inference (round/pick number)
2. `DraftPicks.playerId` is null for all 224 rows — no prospect is ever assigned
3. `2026_Draft_Class` uses field `"Player ID"` (with space) vs the `playerId` convention used throughout the rest of the data and engine
4. `DraftOrder` (224 rows) and `DraftPicks` (224 rows) align by count; `2026_Draft_Class` (352 rows) has no linkage to either

---

## 6. Test Coverage

### 6.1 Test files found

**153 total test files.** Selected listing by directory:

**`src/context/__tests__/`** (38 files):
`offseasonRegression.test.ts`, `freeAgency.offers.test.ts`, `loadState.backupRecovery.test.ts`, `phaseGuards.test.ts`, `draftProspectIdFix.test.ts`, `franchiseTag.test.ts`, `freePlayInitReducer.test.ts`, `draftTradeTimingAndOffers.regression.test.ts`, `combineReducer.test.ts`, `mediumPriorityFixes.test.ts`, `freeAgency.resolve.test.ts`, `configPinning.loadState.test.ts`, `personnelOverlayReplay.test.ts`, `playoffs.transition.after_week17_pbp.test.ts`, `preseasonCutdownsNormalization.test.ts`, `playoffsTick.test.ts`, `draftReducer.integration.test.ts`, `phaseUtils.test.ts`, `freeAgency.lifecycle.test.ts`, `offseason.phaseAlignment.test.ts`, `playbooksCombine.integration.test.ts`, `draftFlowSanity.test.ts`, `saveSeedPolicy.test.ts`, `scoutingRollover.regression.test.ts`, `seasonloop.pbp.applies_weekly_postprocessing.test.ts`, `recoveryMode.test.ts`, `telemetry.percentiles.integration.test.ts`, `transactions.qa.test.ts`, `seasonRollover.freeAgency.test.ts`, `saveLoad.integrity.smoke.test.ts`, `weekAdvance.seedParity.test.ts`, `telemetry.rollover.retention.test.ts`, `saveIdentityLifecycle.test.ts`, `weather.persistence.test.ts`, `weeklyDeterminism.parity.test.ts`, `telemetry.weekFinalize.integration.test.ts`, `staffCounterOffers.regression.test.ts`, `autosave.guard.test.tsx`

**`src/engine/__tests__/`** (30+ files):
`deterministicRng.test.ts`, `deadMoney.test.ts`, `playerGenerator.test.ts`, `tradeEngine.test.ts`, `moraleEngine.test.ts`, `injuryRecurrence.test.ts`, `gameSim.test.ts`, `leagueSim.test.ts`, `injuries.test.ts`, `seasonFlow.test.ts`, `replayParity.smoke.test.ts`, `determinism.weekSeed.parity.test.ts`, `weather.integration.simParity.test.ts`, `seedDerivation.parity.test.ts`, `snapBasedProgression.test.ts`, `strategyEngine.test.ts`, `coachImpact.test.ts`, `playoffBracket.test.ts`, `playoffsSim.test.ts`, `gameplan.test.ts`

**`src/lib/__tests__/`**: `saveManager.test.ts` (27 tests), `userTeam.test.ts`, `stateMachine.test.ts`

**`src/pages/hub/__tests__/`**: `FreeAgency.ui.test.tsx`, `HallOfFame.test.tsx`, `PhaseSubsystemRoutes.freeAgencyRoute.test.tsx`, `contracts.releaseRoutesToLedger.test.tsx`, `development.test.ts`

**Root level**: `App.recovery-routing.test.ts`, `App.test.tsx`

### 6.2 Selected test block counts

| File | `it(`/`test(` count |
|---|---|
| `src/lib/__tests__/saveManager.test.ts` | 27 |
| `src/engine/__tests__/gameSim.test.ts` | 17 |
| `src/testHarness/__tests__/stabilizationRegression.test.ts` | 15 |
| `src/engine/__tests__/playerGenerator.test.ts` | 15 |
| `src/context/__tests__/phaseGuards.test.ts` | 12 |
| `src/context/__tests__/offseasonRegression.test.ts` | 12 |
| `src/pages/hub/__tests__/development.test.ts` | 10 |
| `src/engine/__tests__/coachImpact.test.ts` | 10 |
| `src/engine/practiceFocus.test.ts` | 9 |
| `src/engine/contracts/__tests__/offerDecision.test.ts` | 9 |

### 6.3 Test covering `CUT_APPLY → ledger event`

**YES — two files:**
- `src/pages/hub/__tests__/contracts.releaseRoutesToLedger.test.tsx` — 1 test: "routes contract-screen release to `CUT_APPLY` so ledger, rosterIndex, and effective roster stay aligned." Dispatches `CUT_APPLY` via `buildContractReleaseAction` and asserts `lastLedgerEvent.kind === "CUT"`.
- `src/context/__tests__/transactions.qa.test.ts` — 5 tests, including "cut apply sets free-agent override and affects effective selectors + ratings."

### 6.4 Test for `Resigning.tsx` or contract signing

**No test found for `Resigning.tsx` as a component.** Two engine-level test files reference `RESIGN_SET_DECISION`:
- `src/engine/__tests__/contracts.oneYear.test.ts`
- `src/engine/contracts/__tests__/oneYearDeals.test.ts`

Both test `offerDecision` engine logic only. No test renders `Resigning.tsx`, exercises the hardcoded `EXPIRING` array, or verifies that a re-sign produces a signed contract.

### 6.5 Total approximate test count

**~535 test blocks across 153 test files.**

---

## 7. Asset Completeness

### 7.1 Subdirectories under avatar/personnel directories

```
public/avatars/
  players/            (1 file: PLY_000000.png — single placeholder)
  personnel/
    owners/           (20 files: PERS_0001 through PERS_0020, mixed .png/.JPG)
```

### 7.2 Role folders presence check

All six role subdirectories are **ABSENT**:

| Folder | Present? |
|---|---|
| `public/avatars/personnel/HC/` | NO |
| `public/avatars/personnel/OC/` | NO |
| `public/avatars/personnel/DC/` | NO |
| `public/avatars/personnel/STC/` | NO |
| `public/avatars/personnel/GM/` | NO |
| `public/avatars/personnel/AGM/` | NO |

The only subdirectory under `public/avatars/personnel/` is `owners/`.

### 7.3 Owner avatar files

Present at `public/avatars/personnel/owners/`. 20 files, IDs `PERS_0001` through approximately `PERS_0020`, mixed `.png` and `.JPG` extensions.

### 7.4 Total file counts per directory

| Directory | File count |
|---|---|
| `public/avatars/players/` | 1 |
| `public/avatars/personnel/owners/` | 20 |
| `public/icons/` | 47 |

---

## 8. Open Issue Checklist

| # | Issue | File(s) Checked | Status | Note |
|---|---|---|---|---|
| 1 | `Math.random()` in `feedbackEvents.ts` | `src/engine/feedbackEvents.ts` | **FIXED** | File is a pure factory/format module. No `Math.random()` call present. GameContext.tsx:3174 comment confirms prior fix. |
| 2 | `Date.now()` as default RNG seed in `schedule.ts` | `src/engine/schedule.ts` | **FIXED** | `shuffle()` at line 22 takes explicit `seed: number` parameter. No `Date.now()` anywhere in file. |
| 3 | Six divergent Mulberry32 copies | All engine RNG files | **CHANGED — worse** | Now **10 total** mulberry32 declarations across the codebase (previously 6). At least **4 functionally distinct variants** producing different output for same seed. Additionally, `interviewHiring/rng.ts` is not mulberry32 at all (XorShift32). |
| 4 | Dual save paths with asymmetric validation | `GameContext.tsx`, `src/lib/saveManager.ts`, `src/context/boot/loadState.ts` | **PRESENT** | Two independent versioning axes (`schemaVersion` max 2, `saveVersion` max 6). `saveManager` runs `validateCriticalSaveState`; `loadStateFromStorage` runs `applyBootValidators`. Sets are not identical. |
| 5 | Duplicate `getUserTeamId()` definitions | Entire `src/` | **FIXED** | Exactly one definition at `src/lib/userTeam.ts`:14. |
| 6 | `Resigning.tsx` hardcoded fake player IDs | `src/pages/hub/offseason/Resigning.tsx` | **PRESENT** | Lines 8–13: hardcoded `EXPIRING` array with IDs `PLY_1001`–`PLY_1004`. These IDs do not exist in `leagueDB.json`. |
| 7 | `Resigning.tsx` missing `CONTRACT_SIGNED` ledger event | `src/pages/hub/offseason/Resigning.tsx` | **PRESENT** | Accept dispatches only `RESIGN_SET_DECISION`. No ledger write, no cap mutation, no roster change on this path. |
| 8 | `CutDowns.tsx` disconnected from real roster | `src/pages/hub/offseason/CutDowns.tsx` | **PRESENT** | Line 8 generates 60 synthetic players (`R_001`–`R_060`). `CUT_TOGGLE` handler only writes to `offseasonData.cutDowns.decisions`; emits no ledger event. `CUT_APPLY` is never dispatched from this component. |
| 9 | Salary cap mismatch in `leagueDB.json` | `src/data/leagueDB.json`, `src/pages/hub/RosterAudit.tsx`:24 | **PRESENT** | `leagueDB.json`: $210M. `RosterAudit.tsx` hardcoded: $224.8M. $14.8M discrepancy. Engine uses canonical $210M. |
| 10 | Phantom player row (null `playerId`) | `src/data/leagueDB.json` | **FIXED** | Players table: 1,697 rows, 0 with null `playerId`. |
| 11 | Null Personnel rows | `src/data/leagueDB.json` | **PRESENT** | Personnel table: 1,378 rows, **197 with `personId: null`**. All null rows have all identity fields null; only `scheme` and spurious `Column1` populated. Appear to be spreadsheet export padding rows. |
| 12 | Excel header row baked into data tables | `src/data/leagueDB.json` | **FIXED** | No table row found with a field value equal to its field name. |
| 13 | Draft ID scheme incompatibility | `src/data/leagueDB.json` | **PRESENT** | Three tables are not joinable: `DraftOrder` has no prospect ID; `DraftPicks.playerId` is null for all 224 rows; `2026_Draft_Class` uses field `"Player ID"` (with space) with `PLY_11xxx` format, unreferenced by either other table. |
| 14 | Personnel avatar role folders absent (HC/OC/DC/STC/GM/AGM) | `public/avatars/personnel/` | **PRESENT** | All six role directories missing. Only `owners/` subdirectory exists. |

---

## 9. New Issues Found

The following issues were not in the prior audit's issue list:

### N1 — `rand.ts` is a dead duplicate of `rng.ts`

`src/engine/rand.ts` is a bitwise-identical copy of `src/engine/rng.ts`. Both export `mulberry32` with the same implementation. Neither file references the other. Any caller using `rand.ts` instead of `rng.ts` (or vice versa) produces numerically identical output, but the dual file existence adds confusion and increases the divergent-copy count.

### N2 — `2026_Draft_Class` field uses space in key name

The `2026_Draft_Class` table in `leagueDB.json` uses `"Player ID"` (with a space) as its prospect identifier field, while every other table and all engine code uses `playerId` (camelCase, no space). Any code that destructures or dot-accesses `row.playerId` on `2026_Draft_Class` entries will silently get `undefined`.

### N3 — `DraftPicks.playerId` is null for all 224 rows

The `DraftPicks` table was presumably intended to be the join table between `DraftOrder` and `2026_Draft_Class`, but all 224 rows have `playerId: null`. The draft prospect assignment step has either never run or the data was not exported after that step.

### N4 — Personnel `Column1` spurious field

All 197 null-`personId` Personnel rows contain a field named `Column1: null` that does not appear in any other table or engine interface. This is an artifact of the spreadsheet export and indicates the null-row data was sourced from a row with an out-of-bounds column.

### N5 — `interviewHiring/rng.ts` uses XorShift32, not Mulberry32

`src/engine/interviewHiring/rng.ts` exports `class XorShift32`, a different PRNG algorithm from the mulberry32 used everywhere else. XorShift32 and mulberry32 have different statistical properties and period lengths. Using a different algorithm for interview/hiring randomness means those outcomes are not comparable to the RNG behavior of the rest of the engine, and any future attempt to unify RNG implementations will require handling this divergence explicitly.

### N6 — `TRADE_PLAYER` is a permanently no-op action type in the reducer

`GameContext.tsx` lines 7824–7826 handle `TRADE_PLAYER` by returning `state` unchanged, with a comment noting it is a "deprecated ambiguous alias." Any code path that dispatches `TRADE_PLAYER` will silently do nothing. Whether all such call sites have been migrated to the correct replacement action is unverified.

### N7 — Player avatar coverage is effectively zero

`public/avatars/players/` contains exactly one file (`PLY_000000.png`), which appears to be a placeholder. With 1,697 players in the Players table, there are no individual player avatar assets. The UI presumably falls back to the placeholder for all players, but this has not been verified.

### N8 — Owner avatars use inconsistent file extensions

`public/avatars/personnel/owners/` contains files with both `.png` and `.JPG` extensions (uppercase JPG). Any case-sensitive asset loader or import system will fail to resolve `.JPG` files if it expects `.jpg` or `.png`. On Linux (case-sensitive filesystem), `PERS_0001.JPG` and `PERS_0001.jpg` are distinct paths.

---

## 10. Executive Summary

The UGF codebase has a substantial and active test suite (~535 tests across 153 files) covering core engine paths — determinism, save/load, phase transitions, telemetry, and draft flows — but two critical UI subsystems (`Resigning.tsx` and `CutDowns.tsx`) remain entirely hardcoded scaffolds with no connection to real game state, no ledger writes on user actions, and no test coverage. The most urgent structural issues are: **(1)** the proliferation of divergent RNG implementations — now at 10 total mulberry32 declarations with at least 4 distinct behavioral variants (worsened since the prior audit), creating a determinism risk that directly undermines the core product promise; **(2)** the dual save versioning system (`schemaVersion` + `saveVersion`) running asymmetric validation passes, which creates a class of saves that may pass one validator but not the other; and **(3)** the data layer's 197 null Personnel rows and completely unlinked Draft tables (`DraftPicks.playerId` null for all 224 rows), which will cause silent failures in any draft or personnel system that relies on these joins. The prior audit's two `Math.random()` / `Date.now()` violations and the duplicate `getUserTeamId()` definition are confirmed fixed. Four of the 14 tracked issues have been resolved; ten remain open, and eight new issues were identified in this audit.
