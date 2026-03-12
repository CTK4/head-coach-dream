# TypeScript strictness staged rollout

This repository now rolls out strictness in three gates so we avoid a one-shot refactor:

1. **Stage 1:** `strictNullChecks`
2. **Stage 2:** `noImplicitAny` (with Stage 1 still enabled)
3. **Stage 3:** full `strict`

## How we are rolling this out

- We use **per-folder tsconfig overrides** for folders that are green at each stage.
- Current green folders:
  - `src/types`
  - `src/engine/config`
- The stage configs are:
  - `tsconfig.strict-nullchecks.json`
  - `tsconfig.no-implicit-any.json`
  - `tsconfig.strict.full.json`

## Burn-down tracking

Track adoption by moving folders from backlog to stage coverage as they become green.

| Folder | Stage 1 (`strictNullChecks`) | Stage 2 (`noImplicitAny`) | Stage 3 (`strict`) | Notes |
| --- | --- | --- | --- | --- |
| `src/types` | ✅ | ✅ | ✅ | Green and gated in CI |
| `src/engine/config` | ✅ | ✅ | ✅ | Green and gated in CI |
| `src/lib` | ⬜ | ⬜ | ⬜ | Migrate next |
| `src/engine` (remaining) | ⬜ | ⬜ | ⬜ | Migrate incrementally by module |
| `src/context` | ⬜ | ⬜ | ⬜ | High coupling, split into sub-folders first |
| `src/components` | ⬜ | ⬜ | ⬜ | Move feature-by-feature |

When a folder is not yet green, prefer small targeted fixes or temporary `// @ts-expect-error` with a ticket reference and removal follow-up.
