# Patch scope and verification

## Local verification (canonical)
Run this before opening a PR:

```sh
npm run verify
```

`npm run verify` runs the full pre-PR gate:

```sh
npm run typecheck && npm run test:lint:changed && npm run lint:changed -- --base <base-ref> && npm run build && npm run smoke && npm run check:determinism && npm run test && npm run test:ui
# Non-blocking debt visibility only:
npm run lint
```

CI base-ref policy for `lint:changed`:
- pull_request: `origin/<base branch>`
- push: `${{ github.event.before }}` with fallback to `origin/main` when empty or all zeros
- workflow_dispatch: `origin/main`

## Required CI checks
PRs are expected to pass every step in `.github/workflows/ci.yml`:

- Typecheck
- Lint changed-files helper tests
- Lint changed files (blocking)
- Lint full repo (non-blocking debt visibility)
- Build
- Validate JSON
- Smoke test
- Determinism tripwire
- Unit tests
- UI tests

## Patch scope rules
- Do not mix feature work into stability/infra patches (and vice versa).
- Any persistence/recovery behavior change must include regression test coverage in the same PR.

## Release approval gate

For release decisions, use [Release Approval Gate](./release-approval-gate.md) as the canonical signoff tracker.
