# Mini LMS — Mobile Learning App

A production-quality **React Native + Expo** learning application with authentication, course catalog, dark mode theming, notifications, offline support, and interactive WebView integration.

**Repository**: [github.com/Josephmathew072/Mini-LMS](https://github.com/Josephmathew072/Mini-LMS)  
**Status**: ✅ Complete — Ready for production deployment

---

## 📱 Screenshots

### Main Screens
| Home / Explore | Bookmarks | Profile |
|---|---|---|
| ![Placeholder: Course list with search](https://via.placeholder.com/300x600?text=Home+Screen) | ![Placeholder: Saved courses](https://via.placeholder.com/300x600?text=Bookmarks) | ![Placeholder: User profile](https://via.placeholder.com/300x600?text=Profile) |

### Course & Learning
| Course Detail | WebView Content | Theme Toggle |
|---|---|---|
| ![Placeholder: Course details](https://via.placeholder.com/300x600?text=Course+Detail) | ![Placeholder: Course content](https://via.placeholder.com/300x600?text=WebView+Content) | ![Placeholder: Dark mode](https://via.placeholder.com/300x600?text=Dark+Mode) |

### Authentication
| Login | Register | Offline Mode |
|---|---|---|
| ![Placeholder: Login screen](https://via.placeholder.com/300x600?text=Login) | ![Placeholder: Sign up](https://via.placeholder.com/300x600?text=Register) | ![Placeholder: Offline banner](https://via.placeholder.com/300x600?text=Offline+Mode) |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Josephmathew072/Mini-LMS.git
cd Mini-LMS

# Install dependencies
npm install

# Start development server
npx expo start

# Run on device/simulator
npx expo run:android   # Android
npx expo run:ios       # iOS (Mac only)
```

**✨ No API keys or environment variables required!** All data comes from `https://api.freeapi.app`.

---

## 📋 Setup Instructions

### Prerequisites
- **Node.js** 18 or higher
- **Expo CLI**: `npm install -g expo-cli` (or `npm install expo-cli` locally)
- **iOS** (optional): Xcode 15+ on macOS, Apple Developer account
- **Android** (optional): Android Studio with SDK 33+

### Installation & Running

```bash
# 1. Clone and enter directory
git clone https://github.com/Josephmathew072/Mini-LMS.git
cd Mini-LMS

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start

# 4. Run on simulator/device
# Press 'a' in terminal for Android
# Press 'i' in terminal for iOS (macOS only)
# Or use the Expo Go app on a real device to scan the QR code
```

### Troubleshooting Setup

```bash
# If you encounter issues, clear cache:
rm -rf node_modules .expo
npm install
npx expo start --clear
```

---

## 🔐 Environment Variables

**No environment variables are required.** The app works out-of-the-box using the public FreeAPI endpoint.

For development or custom backends, optionally create a `.env.local` file:

```env
EXPO_PUBLIC_API_BASE=https://api.freeapi.app/api/v1
```

The `.env.local` file is **git-ignored** and local-only.

---

## 📱 Features

### ✅ Core Functionality
- **Authentication**: Secure login/register with auto token refresh
- **Course Catalog**: Browse 30+ real courses with ratings and pricing
- **Search & Filter**: Debounced search by title, description, or instructor
- **Bookmarks**: Save favorite courses with persistent storage
- **Enrollment**: Track enrolled and completed courses
- **Course Completion**: Mark courses complete with progress tracking
- **WebView Integration**: Interactive course content with bidirectional messaging
- **Profile Management**: Update avatar, view statistics, manage settings

### ✨ Advanced Features
- **Dark Mode**: System / Light / Dark themes with persistence
- **Dynamic Theming**: All UI components respond to theme changes
- **Notifications**: 
  - Milestone alert: "Congrats! 5+ courses saved" 🎉
  - Inactivity reminder: "Miss you! Open after 24h" 👋
- **Offline Support**: Courses cached automatically, sync on reconnect
- **Real-time Network Detection**: 4-second polling, offline banner
- **Token Refresh**: Automatic refresh on 401, request queuing
- **Error Handling**: Exponential backoff (1s → 2s → 4s, 3x retry)
- **Performance**: 
  - LegendList for smooth scrolling
  - Skeleton loaders while loading
  - Memoized course cards

### 🎨 UI/UX & Technical
- **NativeWind v4**: Tailwind-inspired styling
- **Responsive**: Portrait & landscape layouts
- **TypeScript**: Strict mode, full type safety
- **State Management**: Zustand (lightweight, reactive)
- **Secure Storage**: Encrypted tokens (iOS Keychain / Android Keystore)
- **Form Validation**: React Hook Form + Zod validation
- **Icons & Emojis**: Lightweight, no icon library dependencies

---

## 🏗️ Project Architecture

### Directory Structure

```
mini-lms/
├── src/
│   ├── app/                    # Expo Router file-based screens
│   │   ├── _layout.tsx         # Root layout — app boot, session restore, routing
│   │   ├── index.tsx           # Auth gate (login/home redirect)
│   │   ├── login.tsx           # Login form
│   │   ├── register.tsx        # Sign-up form
│   │   ├── (tabs)/             # Tab-based navigation
│   │   │   ├── _layout.tsx     # Tab layout
│   │   │   ├── home.tsx        # Explore courses + search
│   │   │   ├── bookmarks.tsx   # Saved courses
│   │   │   └── profile.tsx     # User profile + settings
│   │   ├── course/[id].tsx     # Dynamic course detail page
│   │   └── webview/index.tsx   # Course content viewer
│   ├── api/
│   │   ├── client.ts           # Axios config: retry + token refresh
│   │   └── endpoints.ts        # Typed API methods
│   ├── components/             # Reusable UI components
│   │   ├── CourseCard.tsx      # Course list item (memoized)
│   │   ├── SearchBar.tsx       # Search input
│   │   ├── ErrorView.tsx       # Error state + retry
│   │   ├── OfflineBanner.tsx   # Offline indicator
│   │   └── SkeletonCard.tsx    # Loading placeholder
│   ├── context/
│   │   └── ThemeContext.tsx    # Global theme provider + hook
│   ├── hooks/
│   │   ├── useNetwork.ts       # Network status (polling)
│   │   └── useDebounce.ts      # Debounce hook
│   ├── services/
│   │   ├── notifications.ts    # Local notification triggers
│   │   └── storage.ts          # SecureStore + AsyncStorage
│   ├── stores/                 # Zustand state management
│   │   ├── authStore.ts        # Auth state (login, tokens, user)
│   │   ├── courseStore.ts      # Courses, bookmarks, enrollment
│   │   └── settingsStore.ts    # Settings (theme, notifications)
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts            # Instructor, Course, User, etc.
│   └── utils/
│       ├── constants.ts        # STORAGE_KEYS, thresholds
│       ├── helpers.ts          # Data transforms, HTML builder
│       ├── images.ts           # Image generators
│       └── showToast.ts        # Toast notifications
├── assets/                     # App icons, splash screens
├── global.css                  # NativeWind global styles
├── tailwind.config.js          # Tailwind configuration
├── metro.config.js             # Metro bundler config
├── babel.config.js             # Babel + NativeWind
└── package.json
```

---

## 🎯 Key Architectural Decisions

### 1. **Token Refresh & Retry Logic** (`src/api/client.ts`)
- **Exponential backoff**: 1s → 2s → 4s, max 3 retries on network/timeout/5xx errors
- **401 handling**: Attempts one token refresh; queues other requests while refresh is in-flight
- **Request queuing**: Replays queued requests with new token; cancels if refresh fails
- **Why**: Handles flaky mobile connections and prevents cascading 401 failures

### 2. **SecureStore vs AsyncStorage**
- **SecureStore** (encrypted): Tokens only — Keychain on iOS, Keystore on Android
- **AsyncStorage** (plain): Bookmarks, settings, cache — not sensitive, faster
- **Web fallback**: AsyncStorage for both (no native secure APIs on web)
- **Why**: Tokens must never be stored in plaintext; anything root/jailbroken can read AsyncStorage

### 3. **NativeWind v4 + Dynamic Theming**
- **Approach**: All components use Nativewind for responsive layouts + inline `colors` object for theme-dependent values
- **Theme hook**: `useTheme()` provides `colors`, `isDarkMode`, and `setThemeMode()`
- **Persistence**: Theme selection saved to AsyncStorage; restored on app boot
- **Why**: Nativewind provides Tailwind utilities; inline colors handle true dynamic values (theme-switching doesn't require rebuild)

### 4. **LegendList over FlatList**
- **LegendList** recycles DOM nodes instead of unmounting → better scroll performance
- Used on home and bookmarks screens with 30+ items
- **Why**: Measurably smoother UX, fully compatible with Expo SDK 56 New Architecture

### 5. **Network Detection via Polling**
- `expo-network` doesn't expose a listener API
- App polls `getNetworkStateAsync()` every 4 seconds
- **Why**: Reliable on both platforms, simple, no native event registration needed

### 6. **Bidirectional WebView Communication**
- **Native → Web**: `injectJavaScript()` pushes current user name after `WEBVIEW_READY` signal
- **Web → Native**: Page sends `WEBVIEW_READY` on load; app injects user data
- **Why**: HTML is inline (not HTTP-fetched), so headers cannot be used; message passing is the correct pattern

### 7. **Course Completion Tracking**
- Client-side tracking: Completion status stored in AsyncStorage
- Marked from webview; visible in profile stats
- **Why**: FreeAPI has no backend progress tracking; client-side is intentional

### 8. **Profile Avatar Updates**
- Avatar file URI persisted locally in AsyncStorage
- **Production note**: Real app would upload to CDN/backend storage
- **Known limitation**: Local URIs may break after app uninstall

### 9. **No API Keys Required**
- App works out-of-the-box with FreeAPI public endpoint
- No `.env` setup needed for basic functionality
- **Why**: Easier onboarding, follows assignment spec

---

## 🧪 Code Quality & Testing

```bash
# Type checking
npx tsc --noEmit

# Linting (if eslint added)
npx eslint src --fix
```

For unit tests, add Jest:
```bash
npm install --save-dev jest @testing-library/react-native
```

---

## 🔐 Security & Privacy

| Aspect | Implementation |
|--------|----------------|
| **Tokens** | SecureStore (Keychain/Keystore), never logged |
| **Passwords** | Never stored; HTTPS only transmission |
| **Data** | Sensitive data encrypted; cached courses in AsyncStorage |
| **Token Refresh** | Automatic before expiration; interceptor-driven |
| **CORS** | Properly configured for cross-origin requests |

---

## 📊 Feature Status Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Register | ✅ | React Hook Form + Zod validation |
| Token storage (SecureStore) | ✅ | Encrypted on iOS/Android |
| Auto token refresh on 401 | ✅ | With request queuing |
| Exponential backoff retry | ✅ | 3x with 1s/2s/4s delays |
| Auto-login on app restart | ✅ | Tokens restored from SecureStore |
| Course catalog (LegendList) | ✅ | 30+ courses, smooth scrolling |
| Pull-to-refresh | ✅ | Network-aware |
| Debounced search | ✅ | 300ms delay |
| Bookmark persistence | ✅ | AsyncStorage |
| Enrollment tracking | ✅ | Per-user state |
| Mark course complete | ✅ | WebView integration |
| Bidirectional WebView | ✅ | Native ↔ Web messaging |
| Profile picture update | ✅ | Image picker + local storage |
| Dark Mode (System/Light/Dark) | ✅ | Full theme support |
| Dynamic theming all components | ✅ | All pages use useTheme |
| Nativewind throughout | ✅ | Responsive layouts |
| Notifications (milestone + inactivity) | ✅ | Local notifications |
| Offline caching | ✅ | Courses cached on first load |
| Offline banner | ✅ | 4-second polling |
| Skeleton loaders | ✅ | While fetching courses |
| Error view + retry | ✅ | Graceful error states |
| TypeScript strict mode | ✅ | Full type safety |
| Discount price display | ✅ | When applicable |
| Responsive (portrait/landscape) | ✅ | Mobile-first |

---

## 🐛 Known Limitations & Trade-offs

### Token Validation on Restore
- `restoreSession()` trusts stored tokens without server validation
- FreeAPI has no `/me` endpoint for validation
- **Trade-off**: Avoids extra network request on every boot (faster startup)
- **Impact**: Externally revoked tokens detected only on first API call (results in 401)

### 24-Hour Inactivity Reminder
- Evaluated on next app open, not as a background task
- Would require `expo-task-manager` + `expo-background-fetch` (heavy, out of scope)
- **Trade-off**: Simpler implementation, acceptable for MVP

### Completion Stats
- Counts locally marked courses (no backend sync)
- FreeAPI has no progress endpoint
- **Trade-off**: Intentional design; backend would add complexity

### Client-Side Search
- Filters already-loaded courses in-memory
- Production would use server-side pagination + query
- **Trade-off**: 30 courses fit in memory; acceptable for demo scale

### Profile Avatar Storage
- Local file URI stored in AsyncStorage
- May break after app uninstall
- **Production**: Upload to CDN or backend
- **Trade-off**: Simplicity vs cloud storage complexity

### Bookmark Milestone Resets
- When bookmarks < 5, milestone flag resets
- Allows notification to fire again when reaching 5+
- **By design**: Repeated milestone notifications

---

## 🆘 Troubleshooting

### App won't start / Blank screen
```bash
# Clear all cache
rm -rf node_modules .expo dist
npm install
npx expo start --clear
```

### Can't log in / API errors
- Verify internet connection
- Check FreeAPI availability: [api.freeapi.app](https://api.freeapi.app)
- Try creating a new account
- Check app data not corrupted: Clear app from device settings

### Dark mode not persisting
- Verify theme selection saved to AsyncStorage
- Toggle System → Light → Dark
- Restart app to confirm persistence
- Check device Settings aren't overriding

### Notifications not appearing
- Verify enabled in Profile → Settings → Notifications
- Check OS-level permissions:
  - **iOS**: Settings → [App] → Notifications
  - **Android**: Settings → Apps → [App] → Notifications
- Check notification threshold (bookmark milestone = 5+)

### Offline mode not working
- App needs internet for initial course load (to cache)
- Offline: browse cached courses, enroll/bookmark will sync when online
- Check AsyncStorage available (not disabled by OS)

### WebView not loading
- Verify course exists in catalog
- Check for network connectivity
- Try refreshing / going back and re-entering course
- Check browser console for errors (web platform)

---

## 📦 Building & Deployment

### Development Build

```bash
npx expo start --clear
```

### Production APK (Android)

```bash
npm install -g eas-cli
eas login              # Expo account required
eas build --platform android --profile production
# Download APK from EAS Dashboard
```

### Production IPA (iOS)

```bash
eas build --platform ios --profile production
# Requires Mac, Xcode, Apple Developer account
# Download IPA from EAS Dashboard
```

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please follow the code style and ensure TypeScript checks pass.

---

## 📚 Resources & Links

- [Expo Documentation v56](https://docs.expo.dev/versions/v56.0.0/)
- [React Native Docs](https://reactnative.dev)
- [NativeWind v4](https://www.nativewind.dev)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [FreeAPI Docs](https://api.freeapi.app)
- [GitHub Repository](https://github.com/Josephmathew072/Mini-LMS)

---

## 📧 Support & Feedback

- 🐛 **Issues**: [Open an issue](https://github.com/Josephmathew072/Mini-LMS/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Josephmathew072/Mini-LMS/discussions)
- 📝 **Code Review**: Comment on PRs

---

**Built with ❤️ using React Native, Expo, TypeScript, and NativeWind**
