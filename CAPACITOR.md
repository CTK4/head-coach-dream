# Capacitor setup

This project uses Capacitor to package the Vite web app for native Android and iOS.

## Install dependencies

```bash
npm install
npm i @capacitor/core
npm i -D @capacitor/cli
npm i @capacitor/android @capacitor/ios
```

## Add native platforms

```bash
npx cap add android
npx cap add ios
```

## Build and sync web assets

```bash
npm run build
npm run cap:sync
```

## Open native projects

```bash
npm run cap:open:android
npm run cap:open:ios
```

## One-command platform sync after a web build

```bash
npm run cap:build:android
npm run cap:build:ios
```

> ⚠️ `webDir` in `capacitor.config.ts` must match your web build output directory. This repo uses Vite, so it is set to `dist`.
