# Patch scope and verification

## Local verification (canonical)
Run this before opening a PR:

```sh
npm run verify
```

`npm run verify` runs the full pre-PR gate:

```sh
npm run typecheck && npm run test:lint:changed && npm run lint:changed -- --base <base-ref> && npm run build && npm run smoke && npm run check:determinism && npm run test && npm run test:ui
# Temporary debt visibility + no-new-violations policy:
npm run lint:report
npm run lint:policy
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
- Lint full repo (non-blocking debt visibility, temporary while baseline exists)
- Enforce lint baseline (blocking no-new-violations)
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


## Lint policy
- `lint:changed` is blocking and must pass for all PRs.
- Full-repo lint currently runs in visibility mode (`lint:report`) because historical debt exists.
- `lint:policy` is blocking and fails CI if ESLint totals exceed `config/lint-baseline.json` (no new violations).
- Once baseline reaches zero (`errors=0`, `warnings=0`, `total=0`), remove `continue-on-error: true` from the CI full-lint step and make full lint fully blocking.
