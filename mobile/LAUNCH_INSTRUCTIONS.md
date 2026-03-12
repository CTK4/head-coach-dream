# Head Coach Dream iOS - Exact Launch Instructions

## 🎯 Quick Start (macOS Only)

### Prerequisites
```bash
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods
```

### Launch in 3 Commands
```bash
cd mobile
npm run ios:dev
# Then in Xcode: Select simulator → Press Play
```

---

## 📋 Detailed Step-by-Step

### Step 1: Prepare macOS Environment

```bash
# Install Xcode (if not already installed)
# Download from: https://developer.apple.com/download/
# Or install from App Store

# Install Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify installations
xcode-select --version
pod --version
```

### Step 2: Navigate to Mobile Workspace

```bash
cd /path/to/head-coach-dream/mobile
```

### Step 3: Build Web App

```bash
npm run build:web
```

**Expected output**:
```
✓ built in 18.74s
dist/index.html                       1.07 kB
dist/assets/index-C9Mk39zg.css      108.69 kB
dist/assets/index-BUczHZhA.js     7,866.38 kB
```

### Step 4: Sync Web Assets to iOS

```bash
npm run cap:sync:ios
```

**Expected output**:
```
✔ Copying web assets from dist to ios/App/App/public
✔ Creating capacitor.config.json in ios/App/App
✔ Updating iOS plugins
✔ Sync finished
```

### Step 5: Open Xcode

```bash
npm run cap:open:ios
```

Or manually:
```bash
open ios/App/App.xcodeproj
```

### Step 6: Configure Simulator

**In Xcode**:
1. Look at the top toolbar (next to the Play button)
2. Click the device selector (shows "iPhone 15" or similar)
3. Select a simulator:
   - `iPhone 15` (recommended)
   - `iPhone 15 Pro`
   - `iPhone 14`
   - Any other available simulator

### Step 7: Build & Run

**In Xcode**:
1. Press the **Play button** (or press `Cmd+R`)
2. Wait for build to complete (2-5 minutes first time, 30-60 seconds after)
3. App should launch in simulator

### Step 8: Test Main Flow

Once app launches:

1. **Landing Page** ✅
   - See "HEAD COACH DREAM" title
   - See "New Save" button

2. **Create New Save** ✅
   - Click "New Save"
   - Select "Story Mode"

3. **Interview Flow** ✅
   - Answer 6 interview questions
   - Click through all questions
   - View interview results

4. **Verify Responsiveness** ✅
   - Tap buttons
   - Scroll content
   - Rotate simulator (Cmd+Left Arrow)

---

## 🔧 Troubleshooting

### Build Fails: "CocoaPods is not installed"
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### Build Fails: "Xcode not found"
```bash
xcode-select --install
# Or download from App Store
```

### Build Fails: "Pod install failed"
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

### Web Assets Not Updating
```bash
npm run cap:sync:ios
# Then rebuild in Xcode (Cmd+B)
```

### Simulator Won't Start
```bash
# Reset simulator
xcrun simctl erase all

# Or select a different simulator in Xcode
```

### App Crashes on Launch
1. Check Xcode Console for error messages
2. Verify web assets: `ls ios/App/App/public/index.html`
3. Run: `npm run cap:sync:ios`
4. Rebuild: `Cmd+B` in Xcode

### "Cannot find module" Error
```bash
cd mobile
npm install
npm run cap:sync:ios
```

---

## 📊 Expected Results

### Build Metrics
- **Build Time**: 2-5 minutes (first), 30-60 seconds (incremental)
- **App Size**: ~50-60 MB
- **Startup Time**: 2-3 seconds
- **Memory**: 100-150 MB

### Simulator Behavior
- App launches with dark theme
- Landing page displays immediately
- Buttons are responsive
- No console errors
- Smooth navigation

---

## 🎮 Main Flow Test Checklist

- [ ] App launches in simulator
- [ ] Landing page displays
- [ ] "New Save" button is visible and clickable
- [ ] Story Mode option is selectable
- [ ] Interview screen loads
- [ ] 6 interview questions display
- [ ] Questions are answerable (clickable options)
- [ ] Interview results show after completion
- [ ] No crashes or errors
- [ ] App is responsive to touch

---

## 📁 File Structure Reference

```
mobile/
├── package.json                 # npm scripts
├── capacitor.config.ts          # Capacitor config
├── ios/
│   ├── App/
│   │   ├── App.xcodeproj/      # ← Open this in Xcode
│   │   ├── App/
│   │   │   ├── public/         # Web assets (from ../dist)
│   │   │   ├── ViewController.swift
│   │   │   ├── AppDelegate.swift
│   │   │   └── Info.plist
│   │   └── Podfile
│   └── capacitor-cordova-ios-plugins/
├── README.md                    # Development guide
├── HANDOFF.md                   # Build instructions
├── BUILD_SUMMARY.md             # What was done
└── LAUNCH_INSTRUCTIONS.md       # This file
```

---

## 🚀 One-Command Workflow

```bash
# Everything in one command (build + sync + open Xcode)
cd mobile && npm run ios:dev

# Then in Xcode: Select simulator and press Play
```

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **Xcode Help**: https://developer.apple.com/documentation/xcode
- **iOS Development**: https://developer.apple.com/ios/
- **Web App Repo**: https://github.com/CTK4/head-coach-dream

---

## ✅ Summary

**Status**: Ready to build on macOS

The iOS app is fully configured and ready to build. Simply follow the "Quick Start" section or the detailed step-by-step guide above.

**Estimated time to first launch**: 10-15 minutes

---

**Date**: March 7, 2026  
**Platform**: iOS 14.0+  
**Status**: ✅ Ready for Launch
