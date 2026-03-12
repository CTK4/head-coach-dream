# API Service (Auth)

Implements token-based auth with:

- Short-lived access tokens (`15m` default)
- Refresh token rotation
- Session revocation/logout
- Device-bound session metadata (`deviceId`, platform, app version, user-agent, IP)

## Endpoints

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me` (Bearer auth)

## Run

Set `START_API_SERVICE=1` and run `api-service/src/server.ts` with your TypeScript Node runner (e.g. tsx/ts-node).
