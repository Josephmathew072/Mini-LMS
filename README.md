# LearnFlow — Mini LMS Mobile App

A production-quality React Native Expo learning app demonstrating authentication, course catalog, notifications, offline support, and bidirectional WebView integration.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio with SDK 33+

### Install & Run

```bash
git clone <your-repo-url>
cd mini-lms
npm install
npx expo start
```

Run on a device or simulator:
```bash
npx expo run:android   # Android
npx expo run:ios       # iOS (Mac only)
```

### Environment Variables
None required — all data comes from `https://api.freeapi.app`.

---

## Building the APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

---

## Project Structure

```
mini-lms/
├── app/                       # Expo Router file-based screens
│   ├── _layout.tsx            # Root layout — boots, gates router
│   ├── index.tsx              # Auth redirect
│   ├── login.tsx
│   ├── register.tsx
│   ├── (tabs)/                # Tab group
│   │   ├── home.tsx           # Course list with search
│   │   ├── bookmarks.tsx
│   │   └── profile.tsx
│   ├── course/[id].tsx        # Dynamic course detail
│   └── webview/index.tsx      # WebView content screen
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios: retry logic + token refresh
│   │   └── endpoints.ts       # Typed API functions
│   ├── components/            # CourseCard, SearchBar, OfflineBanner, etc.
│   ├── hooks/                 # useNetwork (polling), useDebounce
│   ├── services/
│   │   ├── notifications.ts   # Local notification triggers
│   │   └── storage.ts         # SecureStore (native) + AsyncStorage
│   ├── stores/                # Zustand: auth, courses, settings
│   ├── types/                 # Shared TypeScript interfaces
│   └── utils/
│       ├── constants.ts       # STORAGE_KEYS, thresholds
│       ├── helpers.ts         # Data transforms + WebView HTML builder
│       └── images.ts          # getCourseImage, getAvatarImage
├── global.css                 # NativeWind CSS entry
├── tailwind.config.js
├── metro.config.js
└── babel.config.js
```

---

## Key Architectural Decisions

### Retry logic (exponential backoff)
`client.ts` retries network errors, timeouts, and 5xx responses up to 3 times with delays of 1s → 2s → 4s before rejecting. This is the standard production pattern for flaky mobile connections.

### Token refresh with queued retry
On a 401, the interceptor attempts one refresh via `/users/refresh-token`. While the refresh is in-flight, any other failing requests are queued rather than rejected, then replayed with the new token once refresh succeeds. If refresh fails, all queued requests reject and tokens are cleared.

### SecureStore vs AsyncStorage
SecureStore (Keychain on iOS / Android Keystore) is the only encrypted-at-rest option for tokens on a mobile device. A token in plain AsyncStorage is accessible to anyone with root/file-system access. Bookmarks and settings are not sensitive, so AsyncStorage is appropriate and faster. On web, AsyncStorage replaces SecureStore as a fallback since the native secure APIs are unavailable.

### NativeWind v4
All components and screens use `className` from NativeWind. StyleSheet.create is only used for values that cannot be expressed with Tailwind utilities (shadow styles, fixed pixel dimensions). The setup follows the v4 pattern: `metro.config.js` with `withNativeWind()`, `global.css`, `jsxImportSource: nativewind` in Babel, and `nativewind/preset` in tailwind config.

### LegendList over FlatList
LegendList recycles DOM nodes rather than unmounting them, giving measurably better scroll performance on large lists. It is fully compatible with the New Architecture enabled by default in Expo SDK 56.

### Deterministic duration
Course duration is derived from `product.id % 10` rather than `Math.random()`, so it is stable across renders and re-mounts — random values in render functions cause flicker.

### Bidirectional WebView communication
- **Web → Native**: The HTML page sends `WEBVIEW_READY` on load and `LESSON_SELECTED` when a lesson is tapped via `window.ReactNativeWebView.postMessage()`.
- **Native → Web**: Once `WEBVIEW_READY` is received, the app calls `webviewRef.current.injectJavaScript()` to push the current user's name into the page. This is the deliberate bidirectional path. Using `injectedJavaScript` + `onMessage` instead of HTTP headers is technically correct for inline HTML sources because there is no actual HTTP request to attach headers to.

### No backend required
The assignment spec points entirely to `api.freeapi.app`. Profile avatar updates persist the local file URI in AsyncStorage — a valid choice at this scope, documented as a known limitation.

### Network detection via polling
`expo-network` does not expose a listener/subscription API. The app polls `getNetworkStateAsync()` every 4 seconds, which is reliable across both platforms without requiring native event registration.

### Dark Mode (Light / Dark / System)
The app includes a complete dark mode implementation via `ThemeContext`, which provides a light and dark color palette. Users can toggle between:
- **System**: Follows device color scheme preference
- **Light**: Forces light theme
- **Dark**: Forces dark theme

The selection persists in AsyncStorage and is applied to all UI components throughout the app. All color values are dynamically derived from the theme context, including backgrounds, text, borders, and interactive elements.

### Course Completion Tracking
Users can mark courses as complete from the webview screen. Completion status is persisted locally in AsyncStorage and reflected in the profile statistics. The "Done" stat box shows the total number of completed courses.

---

## Features

| Feature | Status |
|---------|--------|
| Login / Register (react-hook-form + zod) | ✅ |
| Token storage (SecureStore) | ✅ |
| Token refresh on 401 | ✅ |
| Exponential backoff retry (3x) | ✅ |
| Auto-login on restart | ✅ |
| Course catalog (LegendList) | ✅ |
| Pull-to-refresh | ✅ |
| Debounced search | ✅ |
| Bookmark toggle + persistence | ✅ |
| Enroll with visual state | ✅ |
| Mark course as complete | ✅ |
| Bidirectional WebView bridge | ✅ |
| Profile picture update | ✅ |
| **Dark mode** (system / light / dark) | ✅ **NEW** |
| Bookmark milestone notification (5+) | ✅ |
| 24h inactivity reminder | ✅ |
| Offline banner (polled) | ✅ |
| Offline course cache | ✅ |
| Skeleton loaders | ✅ |
| Error view + retry | ✅ |
| NativeWind throughout | ✅ |
| TypeScript strict mode | ✅ |
| Discount price display | ✅ |
| Portrait + landscape | ✅ |

---

## Known Limitations

- **Token validation on restore**: `restoreSession()` trusts any stored token without validating it against the server. Since FreeAPI has no `/me` endpoint, tokens are not verified on app boot. If a token has expired or been revoked externally, the app will not detect this until the first API call fails with a 401. This is an intentional trade-off to avoid an extra network request on every app start.
- **24h notification**: Evaluated on next app open, not as a true background task. Background scheduling would require `expo-task-manager` + `expo-background-fetch`, which is significantly heavier beyond the scope of this assignment.
- **Profile stats "Done"**: Counts locally completed courses (marked by user in webview). FreeAPI has no course progress tracking, so completion is client-side only.
- **Search is client-side**: Filters already-loaded courses in memory. A production LMS would send the query to an API with server-side pagination.
- **Bookmark milestone resets**: When bookmarks drop below 5, the milestone flag is reset so the notification can fire again when reaching 5+ bookmarks.
- **Profile avatar**: Updates persist the local file URI in AsyncStorage. A production app would upload to a CDN or backend storage.
