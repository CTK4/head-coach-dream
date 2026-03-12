# Branch Review Before Merge

Date: 2026-03-12
Branch: `work`

## Scope Reviewed
- Recent branch commits:
  - `649c73b chore: update package-lock.json after npm install`
  - `b536d60 UI audit phase 1: token consolidation, shared primitives, a11y`
- Files changed across those commits were linted directly.

## Validation Performed
```bash
npx eslint src/components/common/FilterPill.tsx src/components/draft/ProspectRow.tsx src/components/layout/BottomNav.tsx src/components/layout/PageScreen.tsx src/pages/Hub.tsx src/pages/Offers.tsx src/pages/PressFeedbackDemo.tsx src/pages/SeasonAwards.tsx src/pages/SkillTree.tsx src/pages/hub/CapProjection.tsx src/pages/hub/ContractsRoutes.tsx src/pages/hub/Development.tsx src/pages/hub/FreeAgencyRecap.tsx src/pages/hub/FrontOffice.tsx src/pages/hub/InjuryReport.tsx src/pages/hub/OwnerRelations.tsx src/pages/hub/PhaseSubsystemRoutes.tsx src/pages/hub/PowerRankings.tsx src/pages/hub/RosterAudit.tsx src/pages/hub/Settings.tsx src/pages/hub/Trades.tsx src/pages/hub/offseason/Combine.tsx src/pages/hub/offseason/Draft.tsx src/pages/hub/scouting/BigBoard.tsx src/pages/hub/scouting/ScoutingHome.tsx tailwind.config.ts
```

Result: **failed with 25 errors and 10 warnings**.

## Merge Recommendation
**Do not merge yet**. The branch currently violates lint policy in modified files.

## Blocking Findings
1. **Policy violation: restricted imports in UI pages**
   - `src/pages/hub/CapProjection.tsx` imports `getPlayers` from `@/data/leagueDb` (blocked by `no-restricted-imports`).
   - `src/pages/hub/PhaseSubsystemRoutes.tsx` imports `getPlayers` from `@/data/leagueDb` (blocked by `no-restricted-imports`).

2. **Type safety regressions: widespread `any` usage in changed files**
   - `@typescript-eslint/no-explicit-any` errors exist in:
     - `src/pages/SkillTree.tsx`
     - `src/pages/hub/CapProjection.tsx`
     - `src/pages/hub/InjuryReport.tsx`
     - `src/pages/hub/PhaseSubsystemRoutes.tsx`
     - `src/pages/hub/RosterAudit.tsx`
     - `src/pages/hub/Settings.tsx`

3. **Config lint failure in changed config file**
   - `tailwind.config.ts` uses `require()` and fails `@typescript-eslint/no-require-imports`.

## Non-blocking Warnings (to address soon)
- Hook dependency warnings in `InjuryReport.tsx`, `Trades.tsx`, and `Draft.tsx`.
- Fast-refresh export warnings in `InjuryReport.tsx` and `Settings.tsx`.
- Unused symbol warnings in `CapProjection.tsx`, `ContractsRoutes.tsx`, and `Combine.tsx`.
