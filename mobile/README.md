# Head Coach Dream - iOS Mobile Wrapper

This is a dedicated Capacitor workspace for building the Head Coach Dream web app as a native iOS application.

## Architecture

- **Web App**: Located at `../` (Vite + React)
- **Mobile Wrapper**: This directory (Capacitor + iOS)
- **Separation**: Web and mobile tooling are intentionally separated per repo guidance

## Quick Start

### Prerequisites

**macOS Only** (required for iOS development):
- Xcode 15+ with Command Line Tools
- CocoaPods: `sudo gem install cocoapods`
- Node.js 18+

### Development Workflow

```bash
# 1. Build the web app
npm run build:web

# 2. Sync web assets to iOS
npm run cap:sync:ios

# 3. Open Xcode
npm run cap:open:ios

# 4. In Xcode: Select simulator and press Play to build & run
```

### One-Command Development

```bash
npm run ios:dev
```

This command:
1. Builds the web app
2. Syncs assets to iOS
3. Opens Xcode

Then manually select a simulator and press Play.

### Production Build

```bash
npm run ios:build
```

This command:
1. Builds the web app (optimized)
2. Syncs assets to iOS
3. Builds the iOS app in Xcode

## Project Structure

```
mobile/
├── package.json                    # Scripts and dependencies
├── capacitor.config.ts             # Capacitor configuration
├── ios/
│   ├── App/
│   │   ├── App.xcodeproj/         # Xcode project
│   │   ├── App/
│   │   │   ├── public/            # Web assets (synced from ../dist)
│   │   │   ├── ViewController.swift
│   │   │   └── ...
│   │   └── Podfile                # CocoaPods dependencies
│   └── capacitor-cordova-ios-plugins/
└── README.md
```

## Scripts

| Script | Purpose |
|--------|---------|
| `build:web` | Build web app from root directory |
| `cap:sync` | Sync web assets to all platforms |
| `cap:sync:ios` | Sync web assets to iOS only |
| `cap:build:ios` | Build iOS app (requires Xcode) |
| `cap:open:ios` | Open iOS project in Xcode |
| `cap:run:ios` | Build and run on simulator |
| `ios:dev` | Full dev workflow (build + sync + open) |
| `ios:build` | Full production build workflow |

## Configuration

**App Metadata** (`capacitor.config.ts`):
- App ID: `com.headcoachdream.app`
- App Name: `Head Coach Dream`
- Web Directory: `../dist`

## Troubleshooting

### "CocoaPods is not installed"
**Solution**: Install CocoaPods
```bash
sudo gem install cocoapods
```

### "Xcode not found"
**Solution**: Install Xcode from App Store or download from developer.apple.com

### Web assets not updating
**Solution**: Run sync command
```bash
npm run cap:sync:ios
```

### Simulator not launching
**Solution**: In Xcode, select a simulator from the top toolbar and press Play

## Testing on Simulator

1. Run `npm run ios:dev`
2. In Xcode, select a simulator (iPhone 15, iPhone 14, etc.)
3. Press the Play button to build and run
4. App should launch in simulator
5. Test the main flow:
   - Click "New Save"
   - Select "Story Mode"
   - Complete interview questions
   - Verify interview results display

## Notes

- Web app builds are optimized for mobile (relative paths, responsive design)
- Capacitor automatically bridges web and native APIs
- All game state persists in browser localStorage (no native storage needed)
- No native plugins required for current feature set

## Next Steps

1. Build and test on iOS simulator (see Testing on Simulator)
2. Test on physical device (requires Apple Developer account)
3. Submit to App Store (requires provisioning profiles and certificates)

## Related Documentation

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [Head Coach Dream Web App](../README.md)
