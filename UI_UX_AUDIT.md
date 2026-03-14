# UI/UX & Wiring Audit — Head Coach Dream

## 1) Executive summary

### Overall UI/UX health
**Moderate risk (6/10).** The app has broad feature coverage and strong route organization, but user-facing consistency is uneven because multiple navigation surfaces point to missing routes, placeholder screens, and legacy/dead UI paths.

### Overall implementation wiring health
**Partial (5/10).** Core state flow is centralized and coherent via `GameContext` + reducer, but wiring quality is inconsistent at the page level: several screens are present but not fully connected to concrete routes/handlers/data, and there are notable type-integrity regressions that imply implementation drift.

### Top 10 highest-priority issues
1. **Broken Strategy navigation:** “Franchise Tag” card links to `"tag"`, but no matching strategy route exists; users hit wildcard redirect.
2. **Broken Cap Baseline link:** Cap Baseline links to `/hub/finances`, but there is no route for it in hub routing.
3. **Prospect profile is placeholder-only:** route exists, but screen is static text with no data wiring.
4. **Preseason game starts with `opponentTeamId: "TBD"`:** indicates incomplete matchup wiring.
5. **Injury Report depends on generated mock data in dev when real injuries absent, risking false confidence in UI behavior.**
6. **Hub contains dead/unused tile and progression logic (`mainTiles`, `optionalTiles`, advance dialog trigger path) not actually rendered via current mission-control UI.**
7. **Accessibility gaps in playbook UI:** clickable `<div>` cards/modal wrappers without semantic button roles or keyboard handlers.
8. **Duplicate/parallel strategy surfaces (`/strategy` and `/hub/team-strategy`) create UX inconsistency and split mental model.**
9. **React Query provider is mounted but no real query usage pattern is visible in pages; data layer is mostly direct local state/static sources, reducing loading/error state discipline.**
10. **Typecheck is currently failing with many errors in app code, indicating wiring/type contract regressions in active surfaces.**

---

## 2) Findings by area

### A. Routing & navigation

#### A1 — Strategy “Franchise Tag” card is a dead link
- **Severity:** High
- **Area:** Strategy (`/strategy`)
- **User experience:** User taps “Franchise Tag” from Strategy Home and gets redirected away (no dedicated target page under strategy).
- **Root cause:** Link points to `tag` but `StrategyRoutes` defines only `identity`, `priorities`, and `playbooks`.
- **Files:** `src/pages/hub/StrategyRoutes.tsx`
- **Recommended fix:** Add `<Route path="tag" element={<Navigate to="/contracts/tag" replace />} />` or route to real Tag screen directly.
- **Confidence:** High

#### A2 — Cap Baseline links to non-existent `/hub/finances`
- **Severity:** High
- **Area:** Contracts/Cap
- **User experience:** Clicking “← Finances” from Cap Baseline navigates to a URL with no explicit route.
- **Root cause:** Link exists, but hub route table does not include `/hub/finances`.
- **Files:** `src/pages/hub/CapBaseline.tsx`, `src/routes/appRoutes.ts`, `src/App.tsx`
- **Recommended fix:** Either register `/hub/finances` route, or update link to an existing destination (e.g., `/hub/front-office` or `/contracts/summary`).
- **Confidence:** High

#### A3 — Placeholder prospect profile route
- **Severity:** Medium
- **Area:** Scouting/Prospect profile
- **User experience:** Page presents generic text only, no actual prospect data.
- **Root cause:** `ProspectProfileScreen` renders static `PhaseLocked` placeholder content.
- **Files:** `src/pages/hub/PhaseSubsystemRoutes.tsx`
- **Recommended fix:** Implement data lookup from prospect id route param + true scouting/intel panel.
- **Confidence:** High

### B. Gameplay flow wiring

#### B1 — Preseason start payload still has `"TBD"` opponent
- **Severity:** High
- **Area:** Preseason flow
- **User experience:** Starting preseason game may produce invalid matchup context or downstream simulation anomalies.
- **Root cause:** `START_GAME` dispatch hardcodes `opponentTeamId: "TBD"` instead of schedule-derived opponent.
- **Files:** `src/pages/hub/PreseasonWeek.tsx`
- **Recommended fix:** Resolve opponent from preseason schedule and pass concrete `teamId`.
- **Confidence:** High

#### B2 — Injury Report dev fallback can mask missing real data integration
- **Severity:** Medium
- **Area:** Roster/Injuries
- **User experience:** In dev, Injury Report appears fully populated even if injury pipeline isn’t producing real entries.
- **Root cause:** Generated mock injuries are used when `state.injuries` is empty.
- **Files:** `src/pages/hub/InjuryReport.tsx`
- **Recommended fix:** Gate mock fallback behind explicit debug toggle banner and visibly label mock mode.
- **Confidence:** High

### C. State/data architecture consistency

#### C1 — React Query present but effectively unused in UI layer
- **Severity:** Medium
- **Area:** Data fetching pattern
- **User experience:** Limited standardized loading/error handling patterns for async data.
- **Root cause:** App mounts `QueryClientProvider`, but pages are mostly reducer/static-data driven with no clear `useQuery` usage pattern.
- **Files:** `src/App.tsx`
- **Recommended fix:** Either remove QueryClient until needed or migrate async domains to query hooks with standardized loading/error/empty states.
- **Confidence:** Medium

#### C2 — Type-integrity regression blocks reliable wiring confidence
- **Severity:** Critical
- **Area:** Cross-cutting
- **User experience:** High chance of broken paths in compile/CI or subtle runtime mismatch if type issues are bypassed.
- **Root cause:** `npm run typecheck` reports numerous app errors (settings typing, playbook typing, etc.).
- **Files:** multiple (`src/pages/...`, `src/lib/settings.ts`, `src/context/GameContext.tsx`, etc.)
- **Recommended fix:** Establish a “typecheck must pass” gate before feature merges; fix settings async typing first (high fan-out).
- **Confidence:** High

### D. UX consistency and dead code

#### D1 — Hub has significant unused tile/progression structures
- **Severity:** Medium
- **Area:** Hub
- **User experience:** Potential drift between intended hub navigation and actual rendered mission-control layout.
- **Root cause:** `mainTiles`, `optionalTiles`, and advance flow helper state are defined but not rendered/triggered in current JSX.
- **Files:** `src/pages/Hub.tsx`
- **Recommended fix:** Remove dead paths or re-integrate intentionally with one canonical hub layout.
- **Confidence:** High

#### D2 — Duplicate strategy surfaces create confusion
- **Severity:** Medium
- **Area:** Strategy
- **User experience:** Users can alter GM mode in both `/strategy` and `/hub/team-strategy` with different UX treatment.
- **Root cause:** Parallel implementations for similar controls.
- **Files:** `src/pages/hub/StrategyRoutes.tsx`, `src/pages/hub/TeamStrategy.tsx`
- **Recommended fix:** Consolidate into one strategy surface and link all entry points there.
- **Confidence:** High

### E. Accessibility

#### E1 — Interactive playbook cards/modal wrappers use non-semantic `<div onClick>` patterns
- **Severity:** Medium
- **Area:** Playbook screens
- **User experience:** Keyboard/screen-reader users may struggle to discover/activate interactions consistently.
- **Root cause:** Click handlers attached to plain divs without semantic button roles/tabindex/keyboard handlers.
- **Files:** `src/pages/hub/strategy/playbooks/PRO_STYLE_BALANCED.tsx` (representative; pattern appears across playbooks)
- **Recommended fix:** Replace with `<button>` or add proper ARIA role, keyboard handlers, focus styles.
- **Confidence:** High

---

## 3) Hookup / wiring matrix

| Feature / Screen | UI present? | Navigation connected? | State connected? | Backend/data connected? | Loading/error/empty states? | Accessibility concerns? | Status |
|---|---|---|---|---|---|---|---|
| Landing / New Save | Yes | Yes | Yes (save list + navigate) | Local save storage only | Partial | Low | Partial |
| Story onboarding (create/background/offers/coordinators) | Yes | Yes | Yes (dispatch-driven) | Local engine/data | Partial | Medium | Partial |
| Hub Mission Control | Yes | Yes | Yes | Local state | Partial | Low | Partial |
| Strategy main (`/strategy`) | Yes | **Partial** (tag link broken) | Yes | Local state | Minimal | Low | Partial |
| Team Strategy (`/hub/team-strategy`) | Yes | Yes | Yes | Local state | Minimal | Low | Partial |
| Contracts summary/baseline | Yes | **Partial** (`/hub/finances` link mismatch) | Yes | Local state calculations | Partial | Low | Partial |
| Free Agency/Re-sign/Trades subsystems | Yes | Yes | Yes | Local engine data | Partial | Medium | Partial |
| Prospect profile | Placeholder | Route exists but content stub | No real state hookup | No | Minimal | Low | Broken |
| Preseason flow | Yes | Yes | Partial (`TBD` opponent) | Local simulation | Partial | Low | Partial |
| Injury Report | Yes | Yes | Yes | **Partial** (mock fallback behavior) | Good empty/filter states | Medium | Partial |
| Scouting playbooks UI | Yes | Yes | Local component state | Static catalog | Limited | **Medium/High** | Partial |

---

## 4) UX review

### Confusing flows
- Strategy is split between two pages with overlapping controls.
- Some hub links route to legacy aliases or redirects, increasing “where am I?” friction.

### Feedback states
- Many surfaces use local state only and provide limited explicit error messaging.
- Typecheck failures suggest mismatch risk between UI assumptions and state utility signatures.

### Inconsistent interaction patterns
- Mix of polished shadcn controls and custom div-based click UI in playbook subsystems.
- Some pages use branded shells (`HubShell`), others raw card stacks.

### Unnecessary friction
- Broken tag/finances links force users into redirects or dead-end patterns.
- Placeholder screens (prospect profile) look navigable but are not actionable.

### Accessibility issues
- Non-semantic clickable containers in playbook files.
- Potential missing keyboard affordances where click-only patterns are used.

### Responsive/mobile concerns
- Many dense custom playbook visualizations rely on fixed dimensions; likely mobile usability stress (needs device validation).

---

## 5) Dead / unfinished implementation review

### TODO/FIXME/HACK markers and placeholders
- `TODO` marker in offseason draft file indicates unfinished UI swap/selector work.
- Prospect profile intentionally placeholder text.
- Injury report comments indicate placeholder medical rating model.

### Mock/fake data
- Injury report includes generated mock injuries in dev mode.

### Stubs/no-op/partially integrated
- Hub contains non-rendered tile collections and non-triggered confirm-advance flow.
- QueryClient provider present without an obvious query-hook data layer in pages.

### Unreachable/disconnected UI
- Strategy `tag` link disconnected from route table.
- Cap baseline `finances` link disconnected from route table.

---

## 6) Final action plan

### Quick wins (1–3 days)
1. Fix route mismatches (`/strategy/tag`, `/hub/finances`) with explicit redirects.
2. Label mock injury mode in UI and hide by default unless dev toggle enabled.
3. Replace key playbook clickable div cards with semantic buttons in shared playbook primitives.

### Medium effort (1–2 sprints)
1. Implement real prospect profile screen with route-param data lookup + error/empty states.
2. Consolidate strategy into a single canonical screen.
3. Remove or re-enable dead hub tile/advance logic to reduce drift.

### Structural refactor
1. Decide primary async data architecture (reducer-only vs React Query) and standardize loading/error state handling.
2. Enforce passing `npm run typecheck` in CI to prevent further wiring regressions.

### Recommended order of operations
1. Route correctness + dead-link fixes.
2. Typecheck stabilization (high fan-out files).
3. Placeholder replacements (prospect profile, preseason opponent resolution).
4. Accessibility pass across playbook subsystem.
5. Architecture cleanup (query/reducer boundaries).

---

## Primary user journey viability (inferred)

1. **Start new career (Story Mode):** likely works end-to-end at baseline, but downstream navigation quality varies by selected subsystem.
2. **Start new career (Free Play):** team select/difficulty/realism setup appears functional and dispatches init actions.
3. **Run weekly team operations from hub:** mostly workable; quality dips in specific subfeatures (broken links, placeholders).
4. **Offseason workflows (re-sign/FA/trades/draft):** mostly wired, but some placeholder or phase-specific gaps remain.
5. **Deep strategy/scouting review:** available, but split experiences and accessibility issues reduce implementation integrity.

