# Production Readiness Review

## Search precheck (requested)

Executed targeted scans for incomplete/stubbed code:

- `rg -n --glob '!src/data/*.json' --glob '!public/**' "\b(TODO|FIXME|HACK|XXX)\b|not implemented|stubbed?|Coming soon|throw new Error\(|\.skip\(|describe\.skip|it\.skip|test\.skip" src tests scripts docs workers`

Top actionable matches:

- `src/pages/hub/scouting/PrivateWorkouts.tsx` — disabled CTA + “Coming soon”.
- `src/pages/hub/scouting/ScoutingInterviews.tsx` — explicit stub comment + disabled CTA.
- `src/pages/hub/scouting/MedicalBoard.tsx` — disabled CTA + “not implemented yet”.
- `src/pages/hub/TagCenter.tsx` — TODO extension flow placeholder.
- `src/pages/CoordinatorHiring.tsx` and `src/pages/hub/AssistantHiring.tsx` — counter-offer flow explicitly stubbed.

No `.skip` tests were found in `tests/` or `src/**/__tests__` from this scan.

---

## A) Project Summary

- **Product intent:** A single-player football head-coach career simulator with onboarding, hiring, roster management, scouting, contracts, offseason, and in-season progression. (README scope statement)【F:README.md†L1-L4】
- **Target users:** Players running multi-season franchise careers from coach creation through team operations and gameplay decisions. (README onboarding-to-hub loop)【F:README.md†L3-L4】
- **Architecture maturity:** Frontend-only React+TypeScript app using static JSON datasets and browser persistence; no backend/API/database in repo today.【F:RUNBOOK.md†L4-L8】【F:RUNBOOK.md†L67-L69】
- **Runtime/persistence:** Core state is persisted to `localStorage` via save manager and context/reducer flows, with migration + validation support in save load paths.【F:RUNBOOK.md†L6-L7】【F:src/lib/saveManager.ts†L15-L23】【F:src/lib/saveManager.ts†L74-L85】
- **Entrypoints:** Main render root (`src/main.tsx`), route orchestration in `src/App.tsx`, game state orchestration in `src/context/GameContext.tsx`, and route-level feature pages under `src/pages/**`.【F:src/main.tsx†L1-L10】【F:src/App.tsx†L111-L140】【F:src/context/GameContext.tsx†L1-L39】
- **Build/deploy posture:** Vite build with prebuild data generation/validation, plus Vercel rewrite config for SPA routing.【F:package.json†L6-L10】【F:package.json†L15-L17】【F:vercel.json†L1-L5】
- **Testing posture:** Strong unit/integration coverage in engine/lib/context plus Playwright smoke/golden-path tests; however CI wiring is not present in-repo and lint currently fails heavily.【F:docs/QA/BUG_FREE_CORE_LOOP.md†L15-L25】【F:tests/golden-path.spec.ts†L1-L39】【F:tests/ui-smoke.spec.ts†L56-L95】
- **Current maturity:** Advanced prototype / pre-production beta. Core gameplay loop exists, but several user-facing modules remain explicitly stubbed and quality gates are not green by default.【F:src/pages/hub/scouting/PrivateWorkouts.tsx†L17-L25】【F:src/pages/hub/scouting/MedicalBoard.tsx†L17-L25】【F:src/pages/hub/TagCenter.tsx†L267-L271】

---

## B) “Definition of Done” Proposal

A release candidate should satisfy all of the following:

### Features & product completeness
- [ ] Onboarding → first meaningful game loop can be completed in one deterministic happy path and one failure path.
- [ ] All routed hub/scouting/offseason pages are functional (no “Coming soon” placeholders in shipped routes).
- [ ] Hiring and negotiation loops (coordinator + assistant + tag/extension) are interactive end-to-end.
- [ ] League history/stat leader pages are fed from live/persisted state and validated against sim outputs.

### Correctness & quality
- [ ] `npm run lint`, `npm run typecheck`, critical Vitest suites, and Playwright smoke/golden path all pass.
- [ ] Deterministic “golden season” invariants stay green and are regression-gated.
- [ ] Save migration/roundtrip integrity checks pass across at least three historical schema fixtures.

### Security & reliability
- [ ] No hidden production fallback URLs for asset origins; all deploy-time envs documented and validated.
- [ ] Save import path validates/sanitizes payload schema and size constraints.
- [ ] Error logging has consistent event IDs and a production sink (Sentry/Datadog/etc.) behind config.

### Operability
- [ ] CI pipeline exists and blocks merges on quality gates.
- [ ] Deployment runbook includes rollback, cache-busting, and asset bucket verification.
- [ ] Basic client observability (error rate, route latency, critical user actions) is instrumented.

### Docs & DX
- [ ] README + RUNBOOK are aligned with actual scripts and workflows.
- [ ] `.env.example` added for optional asset/config vars and test env defaults.
- [ ] Architecture map + state model docs added for onboarding maintainers.

---

## C) Gaps / Issues

| Area | Finding | Evidence | Severity | Recommended Fix |
|---|---|---|---|---|
| Core functionality completion | Scouting sub-features are routed but still disabled stubs (private workouts/interviews/medical). | `PrivateWorkouts`, `ScoutingInterviews`, `MedicalBoard` all show “Coming soon” and disabled buttons. | **High** | Wire existing reducer actions to UI, or gate routes behind feature flags until complete. |
| Core functionality completion | Hall of Fame route is still placeholder-only. | `src/pages/hub/HallOfFame.tsx` renders “Coming soon.” | **Med** | Either remove route from nav for v1 or feed it with league history data and sorting UI. |
| Core functionality completion | Contract extension/tag negotiation flow incomplete despite visible UI section. | `TagCenter` includes TODO “extension flow”. | **High** | Implement extension negotiation state machine or hide section until backend logic lands. |
| Core functionality completion | Hiring negotiation depth is incomplete (counter-offers non-interactive). | `CoordinatorHiring.tsx` and `AssistantHiring.tsx` both say counter-offers are stubbed. | **Med** | Add explicit accept/reject/counter events and deterministic AI responses. |
| Bugs / correctness risks | Hook rule violations in routing code indicate potential runtime instability and non-compliant React patterns. | `LegacyHub*Redirect` uses `useParams()` inline in expression; lint fails on hook-order rules. | **High** | Refactor redirects to normal components with a single top-level `useParams` call. |
| Bugs / correctness risks | Quality gate currently red: lint reports 571 errors/39 warnings. | `npm run lint` output in this review run. | **Blocker** | Define a lint burn-down plan (critical-first), then enforce lint pass in CI. |
| API/contract consistency | Docs claim no env vars required for core functionality, while README and code rely on optional R2 env overrides for assets. | RUNBOOK env section vs README R2 env section + `getR2BaseUrl` env logic. | **Med** | Clarify required vs optional envs by environment and add `.env.example`. |
| Data model & migrations | Save migration system exists, but repo lacks explicit versioned migration test matrix documentation. | Save manager delegates to schema migration/validation; only targeted tests documented. | **Med** | Add migration fixtures (`vN -> latest`) and CI gate for backward compatibility. |
| Dependency / build issues | Production bundle has very large main chunk (>5MB), warning from build. | `npm run build` output indicates `index-*.js` > 500k warning with 5.4MB bundle. | **High** | Introduce route-level lazy loading and manual chunking for heavy pages/assets. |
| Testing gaps | `npm test` referenced in RUNBOOK but no `test` script in package scripts. | RUNBOOK says `npm test`; `package.json` has no `test` script. | **Med** | Add `test` script alias to vitest and ensure docs match actual commands. |
| Testing gaps | E2E exists but only chromium desktop project configured; mobile behavior tested via viewport emulation only. | `playwright.config.ts` single Desktop Chrome project; tests set mobile viewport. | **Low** | Add mobile device profile project (WebKit/Chromium mobile) for key smoke tests. |
| Observability | Logging utility is used, but no documented external telemetry sink/config for production incident response. | Error logging hooks exist in app/save paths; no observability runbook or provider config present. | **Med** | Add pluggable telemetry adapter and runbook for alerting/error triage. |
| Security | Hardcoded Cloudflare R2 account URLs as defaults may create accidental cross-env coupling and asset leak risk. | `DEFAULT_R2_BASE_URLS` uses fixed account endpoint fallback. | **Med** | Move prod defaults to env-only in production builds; validate host allowlist. |
| Security | Browser save model means user data integrity is fragile and modifiable client-side by design. | Save/load writes directly to `localStorage` and tests mutate it directly. | **Med** | Add signed export format or server sync option for tamper resistance (if competitive/online features planned). |
| Performance / scalability | Entire app is client-side with massive static data and no streaming/pagination strategy called out. | RUNBOOK states static JSON + localStorage; bundle warning indicates weight pressure. | **Med** | Incrementally load heavy datasets and split routes by career phase. |
| DX & documentation | Existing system audit doc appears stale against current code (e.g., standings noted placeholder while current page renders table). | `docs/league-systems-audit.md` says standings placeholder; `src/pages/hub/Standings.tsx` is implemented table view. | **Low** | Refresh or archive audit docs with date/version tags to avoid misleading prioritization. |
| Deployment (CI/CD) | Vercel deployment path documented, but no in-repo CI workflow for tests/lint/typecheck before deploy. | README references auto deploy; no `.github/workflows/*` in repo. | **High** | Add CI workflow to run lint/typecheck/tests/build and block deploy on failure. |

---

## D) Finish Plan (prioritized roadmap)

### Phase 0 — Make it run (1–2 days)

1) **Stabilize baseline quality gates**  
- **Owner skillset:** Frontend TS/React + lint tooling.  
- **Files:** `src/App.tsx`, high-error files from lint (`src/pages/hub/TradeHub.tsx`, `src/components/franchise-hub/*`, `tailwind.config.ts`), `package.json`.  
- **Acceptance criteria:** `npm run lint` returns zero errors; `npm run typecheck` passes; `npm run build` passes with no new critical warnings.

2) **Align scripts/docs for developer workflow**  
- **Owner skillset:** Tooling + docs.  
- **Files:** `package.json`, `RUNBOOK.md`, `README.md`.  
- **Acceptance criteria:** documented commands all exist and run; `npm test` alias present or docs updated.

3) **Gate unfinished routes**  
- **Owner skillset:** Product/frontend routing.  
- **Files:** `src/App.tsx`, `src/pages/hub/scouting/*.tsx`, `src/pages/hub/HallOfFame.tsx`.  
- **Acceptance criteria:** no dead-end “Coming soon” routes in default nav for production profile.

### Phase 1 — Make it correct

1) **Complete scouting interaction loop**  
- **Owner skillset:** Reducer/state-machine + UI wiring.  
- **Files:** `src/context/GameContext.tsx`, `src/pages/hub/scouting/PrivateWorkouts.tsx`, `ScoutingInterviews.tsx`, `MedicalBoard.tsx`.  
- **Acceptance criteria:** each action mutates scouting state, decrements budget/slots, and persists after reload.

2) **Finish negotiation loops (staff + tag extension)**  
- **Owner skillset:** Game economy/contract logic + UI.  
- **Files:** `src/pages/CoordinatorHiring.tsx`, `src/pages/hub/AssistantHiring.tsx`, `src/pages/hub/TagCenter.tsx`, related engine modules.  
- **Acceptance criteria:** user can submit/receive counter offers and complete signed/expired outcomes deterministically.

3) **Expand regression tests around core loop**  
- **Owner skillset:** Test engineering (Vitest + Playwright).  
- **Files:** `src/testHarness/__tests__/goldenSeason.test.ts`, `src/lib/__tests__/saveManager.roundtrip.test.ts`, `tests/*.spec.ts`, `playwright.config.ts`.  
- **Acceptance criteria:** golden invariants, save roundtrips, and onboarding/week-advance/reload flows all pass in one CI command.

### Phase 2 — Make it safe

1) **Harden configuration and secrets posture**  
- **Owner skillset:** Frontend security + deployment config.  
- **Files:** `src/lib/r2Assets.ts`, `README.md`, add `.env.example`.  
- **Acceptance criteria:** production builds fail if required envs absent; no hidden production endpoint defaults.

2) **Input/schema hardening for save import/export**  
- **Owner skillset:** Data validation and security.  
- **Files:** `src/lib/saveManager.ts`, migration validators, import UI pages.  
- **Acceptance criteria:** oversized/malformed payloads rejected with user-safe errors; tests cover tamper cases.

3) **Threat-model and dependency hygiene pass**  
- **Owner skillset:** AppSec + JS supply-chain governance.  
- **Files:** `package.json`, lockfile, docs (`RUNBOOK.md`).  
- **Acceptance criteria:** automated dependency audit policy documented and integrated in CI.

### Phase 3 — Make it operable

1) **Establish CI/CD gate**  
- **Owner skillset:** DevOps/GitHub Actions or equivalent.  
- **Files:** add `.github/workflows/ci.yml` (or platform equivalent), update README badges/instructions.  
- **Acceptance criteria:** PRs blocked on lint/typecheck/vitest/playwright/build.

2) **Add production telemetry/alerts**  
- **Owner skillset:** SRE/observability + frontend instrumentation.  
- **Files:** `src/lib/logger.ts`, app bootstrap, deployment env docs.  
- **Acceptance criteria:** unhandled exceptions and key flow failures are searchable with release/version tags.

3) **Performance hardening + budget enforcement**  
- **Owner skillset:** Frontend performance.  
- **Files:** `src/App.tsx` (route-level lazy imports), Vite config, heavy hub pages.  
- **Acceptance criteria:** main bundle reduced materially (e.g., <1.5MB gzip target), with CI budget check.

---

## E) Quick Wins (Top 10)

1. Add a `test` script in `package.json` mapping to vitest run mode to match RUNBOOK docs.  
2. Fix `LegacyHubScoutingRedirect` and `LegacyHubOffseasonRedirect` hook usage pattern in `src/App.tsx`.  
3. Replace `dispatch as any` reset in `src/App.tsx` with a typed action union extension.  
4. Hide/feature-flag `HallOfFame` route until wired (`src/pages/hub/HallOfFame.tsx`).  
5. Convert scouting stub buttons into temporary “read-only preview” cards without dead CTA (`src/pages/hub/scouting/*`).  
6. Remove `TODO: extension flow` banner from `TagCenter` until backend exists, or implement a minimal extension accept/decline action.  
7. Update `docs/league-systems-audit.md` with a “last validated commit/date” and reconcile stale statements.  
8. Add `.env.example` documenting R2 asset base URLs and Playwright base URL defaults.  
9. Add Playwright mobile project profile in `playwright.config.ts` for at least one golden-path test.  
10. Start route-level lazy loading for heavyweight hub pages to reduce initial bundle (`src/App.tsx`).

---

## Ambiguities / Missing repo artifacts

- No explicit product requirements doc or roadmap board was found (scope inference depends on README + audit docs).
- No in-repo CI workflow definition was found, so actual branch protection and release gates are unclear.
- No backend contract/API schema exists; if online sync/live leagues are intended, requirements are missing.
