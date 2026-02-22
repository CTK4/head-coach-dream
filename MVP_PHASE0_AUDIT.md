# Phase 0 MVP Audit (Functional Vertical Slice)

Date: 2026-02-22

## Verdict

**Phase 0 MVP is _not yet complete_.** The project has strong coverage for core regular-season simulation, cap/dead-money accounting, free-agency offer lifecycle, and draft-loop safety checks, but key exit-criteria gaps remain (notably real playoff/bracket progression and injury lifecycle implementation).

## Evidence Summary

### Systems Track

#### Offseason
- ✅ **Cap math stable (partial evidence):** cap ledger + dead-cap calculations exist with tests validating dead-money totals, sorting, and cap-percentage math.
- ✅ **Release + dead cap works:** `CUT_APPLY` computes dead cap and writes transactions; dead-money tests pass.
- ✅ **Free agency submit → resolve → sign → cap update:** reducer has explicit `FA_SUBMIT_OFFER`, `FA_RESOLVE`, and signing paths that call `applyFinances` for user signings.
- ✅ **Draft: 7 rounds, CPU logic rational:** draft data includes rounds 1–7 (224 picks), and CPU draft advancement logic exists.
- ⚠️ **Basic scouting confidence system:** scouting/profile/budget systems are present in state and actions; no dedicated automated confidence-system test found in this audit.

#### Regular Season
- ✅ **Schedule + standings update:** `generateLeagueSchedule` + `simulateLeagueWeek` integration test passes.
- ✅ **Play-by-play engine deterministic:** game sim is seed-based and tests validate completion/time progression.
- ✅ **Basic play families (run/pass/PA/screen):** play catalog and engine include run, pass, play-action, and screen families.
- ✅ **Simple defensive looks:** defensive shell/box/blitz model is implemented and tested.
- ✅ **Stats accumulate:** game sim tests verify rushing/passing accumulation.
- ❌ **Injuries occur + return:** `resolveInjuries` is currently a no-op.

#### Playoffs
- ❌ **Bracket works / champion crowned / clean offseason transition:** only postseason types/order helpers were found; no playoff simulation pipeline or bracket progression implementation was found in current engine flow.

### UX Track
- ⚠️ **Mobile-first layout stable:** cannot fully verify from code-only audit.
- ⚠️ **Core navigation not broken:** UI smoke tests exist but currently fail in this environment due missing Playwright browser binaries.
- ⚠️ **Clear Advance flow:** present conceptually (multiple advance actions), but not fully validated end-to-end in this run.
- ✅ **Play call selection clean:** dedicated play-call screen with clear grouped play families and controls exists.
- ⚠️ **No dead buttons:** not fully verifiable without successful UI run-through.
- ✅ **Clear cap display:** cap ledger/finance screens and cap computations are wired.
- ✅ **Depth chart drag works:** drag-and-drop handlers are implemented in depth chart UI.

### Stability Track
- ✅ **Save/load stable (basic):** robust load/migration path + guarded localStorage save with error handling.
- ✅ **Deterministic RNG verified (basic):** deterministic seed RNG is used in game/draft paths and core sim tests pass.
- ✅ **No cap math leaks (partial):** dead-money math tests pass; no full-season cap leak property test found.
- ✅ **No infinite draft loops (partial):** CPU draft advance loop has clear break/complete exits; no observed hangs in current tests.
- ⚠️ **No state corruption mid-game:** no dedicated corruption/property test found; existing unit tests pass.

## MVP Exit Criteria Assessment

Can you do the following **without breaking state** right now?

- ✅ Play one regular-season game snap-by-snap (play-call + game sim path exists).
- ✅ Make FA offers.
- ✅ Draft (7 rounds data + draft sim flow).
- ❌ Reach full postseason/champion flow and cleanly transition to next offseason via implemented bracket pipeline.
- ❌ Injury occur/return lifecycle is not implemented.

**Overall: MVP exit criteria are not fully met yet.**

## Commands Run During Audit

- `npx vitest run` → pass (58 tests).
- `npm run smoke` → pass.
- `npm run test:ui` → fail in environment (Playwright browser executable missing).
- `node -e "const db=require('./src/data/leagueDB.json'); const rounds=[...new Set((db.DraftOrder||[]).map(r=>r.round))].sort((a,b)=>a-b); console.log('rounds',rounds); console.log('picks', (db.DraftOrder||[]).length);"` → confirms 7 rounds / 224 picks.

## Recommended Next Steps to Reach MVP Exit

1. Implement actual playoff bracket simulation + champion assignment + offseason transition wiring.
2. Implement injury generation/recovery lifecycle (and unit tests) in the regular-season loop.
3. Add an automated full-season integration test (advance through offseason → regular season → playoffs → next offseason) asserting state integrity.
4. Add deterministic replay test: identical seed + actions ⇒ identical season outcomes.
