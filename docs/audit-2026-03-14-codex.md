# Repository Audit Report — 2026-03-14

## A. Coverage Report

### Scope mapping
- Enumerated repository files with `rg --files -g '!node_modules/**' -g '!.git/**' -g '!dist/**' -g '!mobile/ios/**'`.
- Full checklist is recorded in `docs/audit-2026-03-14-file-checklist.md`.

### Coverage status
- **Reviewed:** 1168 files (listed in the checklist file).
- **Excluded:** `Assets.xcassets/AppIcon.appiconset/icon-1024.png` (binary image asset, not executable logic/config).

## B. Findings

### 1) Async settings API is used synchronously in UI code
- **Severity:** High
- **Confidence:** Confirmed
- **File:** `src/components/franchise-hub/ContextBar.tsx`, `src/components/franchise-hub/HubTile.tsx`, `src/pages/FreePlaySetup.tsx`, `src/lib/settings.ts`
- **Line(s):** `ContextBar.tsx:62`, `HubTile.tsx:41`, `FreePlaySetup.tsx:18-19`, `settings.ts:45`
- **Title:** `readSettings()` promise is dereferenced like a plain object
- **Why it is a problem:** `readSettings` is async and returns `Promise<UserSettings>`, but several components read properties immediately (e.g., `readSettings().showTooltips`). This is both a compile-time type error and a runtime logic bug.
- **Failure scenario:** Tooltips and preset defaults resolve to `undefined` or stale values; TypeScript strict checks fail and CI `typecheck` job fails.
- **Recommended fix:** Convert consumers to `useEffect`/`useState` with `await readSettings()`, or provide a synchronous cached accessor for UI initial state.
- **Evidence:** `readSettings` declared async in `src/lib/settings.ts`, and direct synchronous property access in the three consumer files.

### 2) Capacitor preferences dynamic import is typed as unknown but used as concrete API
- **Severity:** Medium
- **Confidence:** Confirmed
- **File:** `src/lib/settings.ts`
- **Line(s):** `37-39`, `49`, `88`
- **Title:** Unsafe `unknown` typing breaks compile and obscures runtime expectations
- **Why it is a problem:** `dynamicImport` returns `{ Preferences?: unknown }`, but code later calls `nativeStorage.get` and `nativeStorage.set` directly. This creates TS2339 failures and bypasses useful type guarantees.
- **Failure scenario:** `npm run typecheck` fails; future API shape changes can ship unnoticed if casts are later added unsafely.
- **Recommended fix:** Define a narrow interface for Preferences (`get/set`) and type guard/cast once at the boundary.
- **Evidence:** Current annotations in `settings.ts` and TS errors from `npm run typecheck`.

### 3) CI workflow YAML is structurally invalid (duplicated top-level keys)
- **Severity:** Critical
- **Confidence:** Confirmed
- **File:** `.github/workflows/ci.yml`
- **Line(s):** `11`, `39-43`
- **Title:** Duplicate `jobs:` section and stray `ci:` block under jobs
- **Why it is a problem:** YAML with duplicate top-level keys is ambiguous/invalid and may cause the first `jobs` map to be overridden or workflow parsing failures.
- **Failure scenario:** Scheduled dependency-health job may never run, or workflow loading can fail in GitHub Actions.
- **Recommended fix:** Keep one top-level `jobs:` map and move schedule metadata to `on.schedule` only.
- **Evidence:** File shows one `jobs:` at line 11 and another at line 43, with `ci:` and `workflow_dispatch:` nested incorrectly at lines 39-42.

### 4) TypeScript lib target mismatch with string API usage
- **Severity:** Medium
- **Confidence:** Confirmed
- **File:** `src/components/game/OffensiveCallSheet.tsx`, `tsconfig.app.json`
- **Line(s):** `OffensiveCallSheet.tsx:99`, `tsconfig.app.json:4-5`
- **Title:** `replaceAll` is used while TS lib target is ES2020
- **Why it is a problem:** `String.prototype.replaceAll` requires ES2021 lib typing; project lib is set to ES2020.
- **Failure scenario:** Typecheck fails (TS2551), blocking CI/type safety.
- **Recommended fix:** Use `replace(/_/g, " ")` or raise lib target to include ES2021 where acceptable.
- **Evidence:** Direct call in component plus compiler settings.

### 5) Lint debt is currently blocking and extensive
- **Severity:** Medium
- **Confidence:** Confirmed
- **File:** multiple (`src/**/*`, `tailwind.config.ts`, tests)
- **Line(s):** see lint output
- **Title:** 1000+ lint errors (mostly `no-explicit-any`) indicate policy/code drift
- **Why it is a problem:** Current code violates enforced lint policy at high volume, reducing maintainability and making real regressions harder to isolate.
- **Failure scenario:** `npm run lint` exits non-zero (1216 issues), CI policy gates fail when baseline enforcement catches changes.
- **Recommended fix:** Prioritize high-churn areas and replace `any` with scoped types; then ratchet baseline downward in stages.
- **Evidence:** `npm run lint` reported `1216 problems (1063 errors, 153 warnings)`.

## C. Cross-file Consistency Issues

1. **Settings API contract mismatch across modules.**
   - Producer: `readSettings(): Promise<UserSettings>` in `src/lib/settings.ts`.
   - Consumers: synchronous property access in `ContextBar`, `HubTile`, `FreePlaySetup`, and additional call-sites from typecheck output (`Hub.tsx`, `Gameplan.tsx`, `GameContext.tsx`).
   - Result: compile failures and inconsistent runtime defaults.

2. **Build pipeline inconsistency: transpile succeeds while typecheck fails.**
   - `npm run build` succeeds (Vite transpilation).
   - `npm run typecheck` fails with many TS errors.
   - Result: artifacts can build locally while typed correctness gates fail in CI.

## D. Validation Results

- `rg --files -g '!node_modules/**' -g '!.git/**' -g '!dist/**' -g '!mobile/ios/**'`
  - **Outcome:** Enumerated 1169 files for coverage mapping.
- `npm run typecheck`
  - **Outcome:** Failed with multiple TS2339/TS2551/TS2554 errors (confirmed defects above).
- `npm run lint`
  - **Outcome:** Failed with 1216 issues (1063 errors, 153 warnings).
- `npm run build`
  - **Outcome:** Passed; build artifacts produced.
- `npx vitest run --reporter=dot`
  - **Outcome:** Began execution and produced progress dots, but did not complete within observation window.

## E. Residual Risk

- Full runtime path validation for all UI flows was not completed in this pass because unit test run did not finish inside the available execution window.
- E2E suites under `tests/*.spec.ts` were not executed; browser-level integration risk remains.
- Mobile-specific runtime behavior (`mobile/` + Capacitor native bridge) was only statically reviewed in this pass.

### Additional checks to close uncertainty
1. Run full `npx vitest run` to completion and archive failing test list.
2. Run `npm run test:ui` in CI-like environment with Playwright dependencies.
3. Add a targeted test suite for async settings hydration in hub/free-play entry pages.
