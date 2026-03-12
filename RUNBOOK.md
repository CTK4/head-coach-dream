# RUNBOOK

## Stack Inventory
- Frontend: React 18 + TypeScript + Vite.
- UI: shadcn/ui + Tailwind CSS.
- State/data: Local in-browser state (`localStorage`) + static JSON assets in `src/data`.
- Test runner: Vitest.
- Package manager: npm (lockfile: `package-lock.json`).

## Local Setup (clean clone)
1. Install Node.js 22+ and npm.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Build production bundle:
   ```bash
   npm run build
   ```
5. Preview production build:
   ```bash
   npm run preview
   ```

## Environment Variables
Core web mode is still local-only persistence by default, with an optional API mirror mode:

- `VITE_ENABLE_API_SAVE_MODE` (optional): set to `"true"` to enable dual-write API mirroring for save snapshot writes/deletes.
- `VITE_SAVE_API_BASE_URL` (optional): base URL for the save API (defaults to `http://localhost:8787`).

## Ports
- Vite dev server: `5173` (default)
- Vite preview: `4173` (default)

## Tests and Checks
- JSON integrity prebuild check:
  ```bash
  node scripts/validateJson.mjs
  ```
- Smoke test (data wiring + reference integrity):
  ```bash
  npm run smoke
  ```
- Unit tests:
  ```bash
  npm test
  ```
- Typecheck:
  ```bash
  npm run typecheck
  ```
- Lint:
  ```bash
  npm run lint
  ```
- Repo hygiene check (top-level executable docs coverage):
  ```bash
  npm run check:repo-hygiene
  ```

## Smoke-Test Checklist (manual)
1. Start app (`npm run dev`) and open `/`.
2. Create coach with name, age tier, and hometown.
3. Continue through background/interviews/offers.
4. Accept an offer and enter hub.
5. On hub, click **Continue** and verify navigation lands on the expected stage screen.
6. Refresh browser and confirm progress is restored from local storage.
7. Trigger an intentional render failure (developer-only) and confirm the error boundary fallback is shown.

## Known Limitations
- In this execution environment, `npm ci` was blocked by upstream registry policy (`403`), so full `lint/typecheck/vitest/build` verification could not be executed end-to-end here.
- API support now exists in `apps/api` for versioned health/metadata/snapshot CRUD; web remains local-first unless feature-flagged.

## Legacy tooling
- Archived Python calibration harness scripts live under `tools/legacy/`.
- Usage and constraints are documented in `tools/legacy/README.md`.
