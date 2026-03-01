# Capacitor commands

Run these commands exactly from the repo root:

```bash
npm ci
npm run build
npx cap add android
npx cap add ios
npx cap sync
npm run cap:open:android
npm run cap:open:ios
```

## NPM scripts

```bash
npm run cap:sync
npm run cap:build:android
npm run cap:build:ios
```

Notes:
- `webDir` is `dist` in `capacitor.config.ts` to match `vite build` output.
- `base: './'` is set in `vite.config.ts` to avoid asset-path issues in Capacitor WebViews.
