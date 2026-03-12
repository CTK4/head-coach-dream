# Head Coach Dream iOS Wrapper

This document outlines the setup, build, and common troubleshooting steps for the Head Coach Dream iOS Capacitor application. It also details recent improvements made to enhance App Store quality.

## Table of Contents
1.  [Setup and Installation](#setup-and-installation)
2.  [Building and Running](#building-and-running)
3.  [Common Pod and Xcode Fixes](#common-pod-and-xcode-fixes)
4.  [App Store Quality Improvements](#app-store-quality-improvements)
    *   [PR1: Safe Areas + AlertDialog](#pr1-safe-areas--alertdialog)
    *   [PR2: Native Persistence + Migration](#pr2-native-persistence--migration)
    *   [PR3: Import/Export + Haptics](#pr3-importexport--haptics)

## 1. Setup and Installation

Before you begin, ensure you have the following installed:

-   Node.js (LTS version recommended)
-   npm (Node Package Manager)
-   Xcode (latest stable version from the Mac App Store)
-   CocoaPods (installed via `sudo gem install cocoapods`)
-   Capacitor CLI (`npm install -g @capacitor/cli`)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/CTK4/head-coach-dream.git
    cd head-coach-dream
    ```

2.  **Install root dependencies:**
    ```bash
    npm install
    ```

3.  **Build the web application:**
    ```bash
    npm run build
    ```

4.  **Navigate to the mobile directory and install dependencies:**
    ```bash
    cd mobile
    npm install
    ```

5.  **Sync Capacitor project:**
    ```bash
    npx cap sync ios
    ```
    This command copies your web assets into the iOS project and updates Capacitor dependencies.

## 2. Building and Running

### Running on a Simulator or Device

1.  **Open Xcode:**
    ```bash
    npx cap open ios
    ```
    This will open the `App.xcworkspace` file in Xcode.

2.  **Select a target:** In Xcode, select your desired simulator or a connected physical device from the scheme dropdown menu.

3.  **Build and Run:** Click the 
Run button (▶️) in Xcode.

### Using `cap run ios`

Alternatively, you can build and run directly from the command line:

```bash
npm run cap:run:ios
```

This command will build the web assets, sync them to the iOS project, and then open Xcode to run the app on a connected device or the last-used simulator.

## 3. Common Pod and Xcode Fixes

Capacitor iOS development can sometimes encounter issues with CocoaPods or Xcode. Here are some common fixes:

### Pod Install Issues

If `npx cap sync ios` or `pod install` fails, try the following:

1.  **Clean Pods cache:**
    ```bash
    cd ios/App
    rm -rf Pods
    rm Podfile.lock
    pod deintegrate
    pod install
    ```

2.  **Update CocoaPods:**
    ```bash
    sudo gem install cocoapods
    ```

3.  **Ensure correct Ruby version:** Xcode often relies on the system Ruby. If you use a version manager like `rbenv` or `rvm`, ensure your shell is configured correctly or switch to the system Ruby for CocoaPods operations.

### Xcode Build Errors

1.  **Clean Build Folder:** In Xcode, go to `Product > Clean Build Folder`.
2.  **Delete Derived Data:** Close Xcode, then delete the Derived Data folder. You can find its location in Xcode preferences (`Xcode > Settings > Locations > Derived Data`).
3.  **Check Signing & Capabilities:** Ensure your project has the correct signing certificate and provisioning profile configured in Xcode under `Signing & Capabilities`.
4.  **Update Project Build Settings:** Sometimes, build settings (e.g., `Build Active Architecture Only`) can get misconfigured. Compare with a fresh Capacitor project if necessary.

## 4. App Store Quality Improvements

This section summarizes the key changes implemented to improve the Head Coach Dream iOS application for App Store quality, delivered across three PR-sized commits.

### PR1: Safe Areas + AlertDialog

**Summary:** This commit introduces proper handling of iOS safe areas and replaces native `window.confirm()` dialogs with a custom, in-app AlertDialog component from Radix/shadcn.

**Key Changes:**

-   **`index.html`**: Added `viewport-fit=cover` to the viewport meta tag to allow content to extend into the safe areas.
-   **`src/index.css`**: Introduced new Tailwind CSS utilities (`.pb-safe`, `.pt-safe`, etc.) using `env(safe-area-inset-*)` for consistent safe area padding.
-   **`src/components/layout/BottomNav.tsx`**: Updated the `BottomNav` component to correctly utilize `pb-[env(safe-area-inset-bottom)]` to prevent overlap with the home indicator.
-   **`src/components/layout/AppShell.tsx`**: Adjusted the main content padding to account for the bottom safe area, ensuring content is not obscured by the `BottomNav`.
-   **`src/pages/LoadSave.tsx`**: Replaced the browser's native `window.confirm()` for save deletion with a custom `AlertDialog` component, providing a more integrated and visually consistent user experience.

**Verification Checklist:**

-   [ ] On notched iPhones (e.g., iPhone 14 Pro, iPhone 15 Pro Max), the bottom navigation bar (`BottomNav`) does not overlap with the home indicator.
-   [ ] Content within the app is not hidden behind the `BottomNav` or other safe area insets.
-   [ ] When attempting to delete a save in `LoadSave.tsx`, an in-app `AlertDialog` appears instead of the system's native confirmation dialog.
-   [ ] The `AlertDialog` displays relevant save information (coach name, team name) for clarity.

### PR2: Native Persistence + Migration

**Summary:** This commit transitions the application's save data persistence from `localStorage` to native Capacitor plugins (`@capacitor/preferences` and `@capacitor/filesystem`) for improved reliability and data integrity on iOS. It includes a one-time migration mechanism for existing `localStorage` saves.

**Key Changes:**

-   **`mobile/package.json`**: Added `@capacitor/preferences` and `@capacitor/filesystem` as dependencies.
-   **`src/lib/native/saveStore.ts` (New)**: Implemented a native save store API that uses Capacitor Filesystem for individual save files (JSON per save) and Capacitor Preferences for maintaining a save index. It features an atomic write mechanism to prevent data corruption during unexpected app termination.
-   **`src/lib/native/migrationHelper.ts` (New)**: Developed a utility to perform a one-time migration of existing `localStorage` saves into the new native store. This migration is marked in Preferences and does not delete the original `localStorage` data.
-   **`src/context/persistence/gameCheckpoint.ts`**, **`src/lib/settings.ts`**, **`src/lib/haptics.ts`**: Modified these files to conditionally use Capacitor Preferences for persistence when running in a Capacitor iOS environment, falling back to `localStorage` for web builds.

**Verification Checklist:**

-   [ ] Create several saves in the web version of the app (using `localStorage`).
-   [ ] Build and run the iOS app. Verify that the saves created in the web version appear in the iOS app after the one-time migration.
-   [ ] Force-quit the iOS app (swipe up from the app switcher) and relaunch it. Verify that all saves are still present and load correctly.
-   [ ] Change a setting (e.g., haptics enabled/disabled) and force-quit the app. Verify the setting persists upon relaunch.
-   [ ] Ensure that the web version of the app continues to function correctly, using `localStorage` for its persistence.

### PR3: Import/Export + Haptics

**Summary:** This commit integrates native iOS sharing capabilities for exporting save files and enhances haptic feedback using the Capacitor Haptics plugin. It also lays the groundwork for native file import.

**Key Changes:**

-   **`mobile/package.json`**: Added `@capacitor/share` and `@capacitor/haptics` as dependencies.
-   **`src/lib/native/importExport.ts` (New)**: Implemented a native import/export API. The `exportToShare` function writes the save JSON to a temporary file in the app's Documents directory and then invokes the iOS share sheet. The `importFromFiles` function is a placeholder, awaiting integration with a document picker plugin.
-   **`src/lib/haptics.ts`**: Updated the haptics utility to use `@capacitor/haptics` for native haptic feedback on iOS devices, providing a more responsive and system-integrated experience. It falls back to `navigator.vibrate` for web environments.
-   **`src/pages/LoadSave.tsx`**: Modified the export functionality to use the native share sheet on iOS. The import button is temporarily disabled on iOS, with a note indicating that it requires a document picker plugin.
-   **`src/lib/debugBundle.ts`**: Updated the debug bundle export to also utilize the native share sheet on iOS, providing a consistent export experience.

**Verification Checklist:**

-   [ ] On an iOS device, navigate to the Load/Save screen and tap the 
Export button for a save. Verify that the native iOS share sheet appears, allowing you to share the save file via Mail, Messages, Files app, or other installed applications.
-   [ ] Verify that haptic feedback is triggered when interacting with UI elements (e.g., button presses) on an iOS device. (Ensure Haptics are enabled in iOS Settings > Accessibility > Touch > Haptic Touch).
-   [ ] Export a debug bundle from the app. Verify that the native iOS share sheet is used for this export as well.
-   [ ] Observe that the "Import Save" button on the `LoadSave.tsx` screen is disabled on iOS, with a message indicating it requires a Files app integration.
-   [ ] Ensure that the web version of the app continues to use the standard browser download for exports and `navigator.vibrate` for haptics.

---

**Author:** Manus AI
