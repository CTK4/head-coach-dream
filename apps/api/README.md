# Save API (`apps/api`)

Versioned API server for health + save metadata + save snapshot CRUD.

## Contract-first

The OpenAPI contract lives at `apps/api/openapi.yaml`.

## Run locally

```bash
npm install
npm --prefix apps/api run dev
```

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/saves/metadata`
- `POST /api/v1/saves/snapshots`
- `GET /api/v1/saves/:saveId/snapshot`
- `PUT /api/v1/saves/:saveId/snapshot`
- `DELETE /api/v1/saves/:saveId/snapshot`


## Contract tests

Run contract + backward-compatibility tests:

```bash
npm run test:api:contract
```

These validate OpenAPI response schemas, example fixtures, error envelope shape, metadata pagination, timestamp format, and required version headers.
