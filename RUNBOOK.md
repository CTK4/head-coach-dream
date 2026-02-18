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
This app currently does **not** require env vars for core functionality.

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
- There is no backend/API or database service in this repository; connectivity scope is static data + client runtime persistence.
