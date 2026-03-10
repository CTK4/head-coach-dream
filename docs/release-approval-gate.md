# Release Approval Gate

This document is the **single source of truth** for release signoff. It tracks current failures, blockers, and objective approval criteria.

## Current failing tests

Update this table continuously during stabilization. Leave it empty when there are no active failing tests.

| Test name / file | Failure summary | Owner | Target phase |
|---|---|---|---|

## Blocker tracker

Use this section for release-blocking work only. Keep severity at P0/P1, include explicit unblock conditions, and leave the table empty when there are no open blockers.

| Severity (P0/P1) | Blocker | Owner | Status | Unblock condition |
|---|---|---|---|---|

## Release gate checklist

All rows require explicit release signoff before promotion.

| Gate | Owner | Evidence link | Status (PENDING / PASS / FAIL / WAIVED) | Signoff |
|---|---|---|---|---|
| Type safety gate completed | | | PENDING | |
| Build gate completed | | | PENDING | |
| Determinism gate completed | | | PENDING | |
| Transactions targeted suite completed | | | PENDING | |
| Rollover targeted suite completed | | | PENDING | |
| Recovery targeted suite completed | | | PENDING | |
| Weekly finalization targeted suite completed | | | PENDING | |
| Lint changed-files gate completed (blocking) | | | PENDING | |
| Full-repo lint debt check reviewed (non-blocking) | | | PENDING | |

## Canonical approval commands

Run these commands exactly as written for approval evidence:

```sh
npm run typecheck
npm run test:lint:changed
npm run build
npm run check:determinism
npm run test -- src/context/__tests__/transactions.qa.test.ts src/engine/transactions/__tests__/transactionReplay.test.ts
npm run test -- src/context/__tests__/seasonRollover.freeAgency.test.ts src/context/__tests__/scoutingRollover.regression.test.ts
npm run test -- src/context/__tests__/recoveryMode.test.ts src/context/__tests__/loadState.backupRecovery.test.ts
npm run test -- src/context/__tests__/telemetry.weekFinalize.integration.test.ts src/context/__tests__/seasonloop.pbp.applies_weekly_postprocessing.test.ts
npm run lint:changed -- --base <release-base-branch>
# Non-blocking debt visibility only:
npm run lint -- --max-warnings=0
```
CI base-ref policy for `lint:changed`:
- pull_request: `origin/<base branch>`
- push: `${{ github.event.before }}` (fallback `origin/main` when empty/all zeros)
- workflow_dispatch: `origin/main`

## Approval ladder

### Conditional GO

Entry criteria (all required):
- P0 blockers are closed.
- Any remaining P1 blockers have approved mitigations documented in the blocker tracker.
- Typecheck, build, determinism, and all targeted vitest suites pass in both local verification and CI.
- Blocking lint:changed gate passes (or has explicitly approved, time-bound waiver with owner/date).
- Full-repo lint is tracked as non-blocking debt and documented in release notes/checklist.

### RC (Release Candidate)

Entry criteria (all required):
- Conditional GO criteria met.
- Release gate checklist has named owner + evidence link for every row.
- No failing tests in "Current failing tests".
- Candidate build artifact/version is frozen and traceable to commit SHA.

### GO

Entry criteria (all required):
- RC criteria met.
- Final release gate checklist rows are all marked PASS with signoff.
- Blocker tracker has no open P0/P1 items.
- Release approver confirms no scope drift from approved RC.

## Related launch/readiness docs

- [Production Readiness Review](./production-readiness-review.md)
- [Patch scope and verification](./patch-scope-and-verification.md)
