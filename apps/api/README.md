# Save API (`apps/api`)

Versioned API server for health + save metadata + save snapshot CRUD.

## Contract-first

The OpenAPI contract lives at `apps/api/openapi.yaml`.

## Run locally

```bash
npm install
npm --prefix apps/api run dev
```

## Mutation semantics (backend mode)

All state-changing endpoints (`POST /saves/snapshots`, `PUT /saves/:saveId/snapshot`, `DELETE /saves/:saveId/snapshot`) require:

- `x-operation-id`: unique operation ID generated client-side for retry safety.
- `x-sequence-number`: monotonic sequence number per save stream (`last + 1`).

Server behavior:

- Retries with the same `x-operation-id` + same payload return the original response (`x-idempotent-replay: true`).
- Reusing an operation ID with a different payload returns `409 operation_id_conflict`.
- Out-of-order sequences return `409 sequence_conflict` with `expectedSequence`.

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/saves/metadata`
- `POST /api/v1/saves/snapshots`
- `GET /api/v1/saves/:saveId/snapshot`
- `PUT /api/v1/saves/:saveId/snapshot`
- `DELETE /api/v1/saves/:saveId/snapshot`
