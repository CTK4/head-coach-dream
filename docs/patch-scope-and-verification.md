# Patch scope and verification

## Local verification (canonical)
Run this before opening a PR:

```sh
npm run verify
```

If you need to run checks individually, use:

```sh
npm run typecheck && npm run lint && npm run build && npm run smoke && npm run check:determinism && npm run test && npm run test:ui
```

## Required CI checks
PRs are expected to pass every step in `.github/workflows/ci.yml`:

- Typecheck
- Lint
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
