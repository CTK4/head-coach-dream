# Capacitor commands

Capacitor dependencies are intentionally **not** installed in the root web package so CI can run deterministic `npm ci` on Node 22.

## Current root behavior

The existing `cap:*` scripts are kept as no-op guards in `package.json` so callers get a clear message and root script execution does not break.

```bash
npm run cap:sync
npm run cap:build:android
npm run cap:build:ios
```

Each script exits successfully after printing guidance to use a dedicated mobile workspace/package for Capacitor tooling.

## Web app install/build (repo root)

```bash
npm ci
npm run build
```
