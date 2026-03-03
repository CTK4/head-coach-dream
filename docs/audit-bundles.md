# Audit bundles

This repository defines deterministic audit bundles through `scripts/makeAuditBundle.mjs`.
Each bundle has explicit include/exclude globs so the file set is reproducible for a given commit.

## Why this exists

Audits must reflect repository reality (what build/test scripts actually consume), not ad-hoc exports.
The generator enforces deterministic ordering and produces `dist/audit-bundles/<bundle>.zip` with preserved relative paths.

### Critical required inputs

Bundles `00` and `01` always include these minimum paths:

- `index.html` (required by Vite build flow).
- `src/data/**` (contains `leagueDB.json` read by smoke checks).
- `public/Hall_of_Fame/**` (CSV inputs consumed by league history generation).

These requirements match known touchpoints:

- `package.json` uses Vite build commands that require `index.html`.
- `scripts/smokeTest.mjs` reads `src/data/leagueDB.json`.
- `scripts/generateLeagueHistoryFromCsv.mjs` reads `public/Hall_of_Fame/**`.

## Bundle manifest summary (00–08)

| Bundle | Purpose | Includes (high-level) | Excludes |
| --- | --- | --- | --- |
| `00` | Critical build and audit data inputs | `index.html`, `src/data/**`, `public/Hall_of_Fame/**` | none |
| `01` | Critical inputs + verification scripts/config | `00` + `package.json`, `vite.config.ts`, core scripts | none |
| `02` | App source with required public data | `src/**`, `scripts/**`, `public/**`, key configs | `public/avatars/**` |
| `03` | Source + tests + docs | `02` + `tests/**`, `docs/**` | `public/avatars/**` |
| `04` | Repo snapshot (lightweight assets) | `**` | `.git/**`, `node_modules/**`, `dist/**`, `public/avatars/**` |
| `05` | Repo snapshot with avatars | `**` | `.git/**`, `node_modules/**`, `dist/**` |
| `06` | Engineering systems/data audit | focused `src/data`, `src/systems`, `src/context`, `docs`, scripts | none |
| `07` | QA/runbook audit | `README`, `RUNBOOK`, `docs/**`, `tests/**`, scripts | none |
| `08` | Forensic full repo capture | `**` | `.git/**`, `node_modules/**`, `dist/**` |

## Determinism rules

The generator is deterministic for a given commit because it:

1. Resolves files from explicit glob rules in the manifest.
2. Applies exclusions consistently (including always-excluded generated/dependency paths).
3. Sorts selected file paths lexicographically before zipping.
4. Uses `zip -X` to omit extra file attributes that vary by environment.

## Usage

```bash
node scripts/makeAuditBundle.mjs --bundle 00
node scripts/makeAuditBundle.mjs --bundle 01
```

The resulting zip files are written to:

- `dist/audit-bundles/00.zip`
- `dist/audit-bundles/01.zip`
- etc.
