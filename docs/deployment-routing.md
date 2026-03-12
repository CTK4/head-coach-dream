# Deployment routing behavior

This repository uses Vercel route ordering to support three concerns at once during migration:

1. **Static assets must resolve directly from the built filesystem** (`/assets/*`, `/favicon.ico`, etc.).
2. **API prefixes must bypass SPA fallback** (`/api/*` now, with room for additional API families later).
3. **All non-file, non-API app URLs must fallback to `/`** so React Router deep links continue to work.

## Route precedence (`vercel.json`)

Routes are evaluated in order:

1. `{"handle":"filesystem"}`
   - Lets Vercel serve real files first.
   - Prevents hashed JS/CSS assets from being rewritten to `/`.
2. `{"src":"/api/(.*)","dest":"/api/$1"}`
   - Explicitly reserves `/api/*` for API handlers/services.
   - Keeps API traffic out of SPA fallback logic.
3. `{"src":"/(.*)","dest":"/"}`
   - Catch-all SPA fallback for client-side routes such as `/hub/*`.

## Collision avoidance during migration

- **Web app routes** should live outside reserved API prefixes. Example: `/hub/*`, `/onboarding`, `/settings`.
- **API service routes** should stay under `/api/*` (or another explicitly reserved prefix added before SPA fallback).
- **Static assets** remain served through the filesystem handler and should not be duplicated under API prefixes.

If a new API namespace is introduced (for example `/internal-api/*`), add a dedicated passthrough rule **above** SPA fallback.

## Deployment smoke checks

Run:

```bash
npm run smoke:deploy
```

This verifies that:

- Filesystem handling is first.
- `/api/*` is explicitly exempted from SPA rewrite.
- Catch-all SPA fallback remains the final route.
- Representative SPA and API paths resolve to the expected destinations.
