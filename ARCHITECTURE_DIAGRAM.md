# Resonix v0.1 Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RESONIX v0.1                             │
│              Offline-First MP3 Player                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐      ┌──────────────────────────┐
│                          │      │                          │
│   📱 MOBILE APP          │      │   🔗 BACKEND SERVER      │
│   React Native + Expo    │      │   Express + TypeScript   │
│                          │      │                          │
│  Port: Device Screen     │      │  Port: 3000              │
│  Type: Android (primary) │      │  Status: Health check    │
│                          │      │                          │
└───────────┬──────────────┘      └────────────┬─────────────┘
            │                                  │
            └──────────────────┬───────────────┘
                               │ 
                      HTTP/CORS Channel


┌──────────────────────────────────────────────────────────────┐
│                    MOBILE LAYER STACK                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ HomeScreen (app/(tabs)/index.tsx)                     │  │
│  │ • Displays app title "Resonix"                        │  │
│  │ • Shows permission status (4 states)                  │  │
│  │ • Visual feedback (colors + icons)                    │  │
│  └───────────────┬────────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────▼────────────────────────────────────────┐  │
│  │ useStoragePermission Hook                             │  │
│  │ • Manages permission state                            │  │
│  │ • Auto-requests on mount                              │  │
│  │ • Returns { isGranted, isLoading, error }            │  │
│  └───────────────┬────────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────▼────────────────────────────────────────┐  │
│  │ permissions.ts Utilities                              │  │
│  │ • requestStoragePermission()                           │  │
│  │ • checkStoragePermission()                             │  │
│  │ • Platform-aware (Android-specific)                   │  │
│  └───────────────┬────────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────▼────────────────────────────────────────┐  │
│  │ expo-media-library                                    │  │
│  │ • Native Android permission handling                  │  │
│  │ • Future: File system access                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER STACK                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Express Server (src/server.ts)                        │  │
│  │ • Middleware: JSON, CORS                              │  │
│  │ • Routes: /, /health, 404 handler                     │  │
│  │ • Port: 3000 (configurable)                           │  │
│  └───────────────┬────────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────┼────────────────────────────────────────┐  │
│  │   │                                                    │  │
│  │   ├─ /health endpoint (routes/health.ts)             │  │
│  │   │  GET /health → { "status": "ok" }                │  │
│  │   │                                                    │  │
│  │   └─ 404 error handler → { "error": "Not Found" }    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────▼────────────────────────────────────────┐  │
│  │ Configuration (src/config.ts)                         │  │
│  │ • PORT (default: 3000)                                │  │
│  │ • NODE_ENV (development/production)                   │  │
│  │ • CORS_ORIGIN (configurable)                          │  │
│  │ Loaded from: .env file via dotenv                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. APP LAUNCH                                               │
│     App → useStoragePermission hook → Check permission      │
│                                      → UI state update       │
│                                      → Return { status }     │
│                                                               │
│  2. PERMISSION REQUEST (Android)                            │
│     User sees "Permissions Required" → Click Allow          │
│     Permission granted → Hook updates state                 │
│     UI shows "Ready to Go" ✓                                 │
│                                                               │
│  3. HEALTH CHECK (Optional)                                 │
│     Mobile app → GET /health → Backend responds             │
│     { "status": "ok" } → App knows backend is running       │
│                                                               │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    CONFIGURATION                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  MOBILE (app.json)                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ {                                                     │  │
│  │   "expo": {                                           │  │
│  │     "name": "Resonix",                               │  │
│  │     "version": "0.1.0",                              │  │
│  │     "plugins": ["expo-router"],                      │  │
│  │     "android": {                                     │  │
│  │       "permissions": [                               │  │
│  │         "READ_EXTERNAL_STORAGE",                     │  │
│  │         "READ_MEDIA_AUDIO"                           │  │
│  │       ]                                              │  │
│  │     }                                                │  │
│  │   }                                                  │  │
│  │ }                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  BACKEND (.env)                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ PORT=3000                                             │  │
│  │ NODE_ENV=development                                 │  │
│  │ CORS_ORIGIN=*                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  LOCAL DEVELOPMENT                                           │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ Backend              │        │ Mobile               │  │
│  │ npm run dev          │        │ npm start            │  │
│  │ localhost:3000       │        │ Expo CLI             │  │
│  └──────────────────────┘        └──────────────────────┘  │
│                                                               │
│  PRODUCTION DEPLOYMENT                                       │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ Backend              │        │ Mobile               │  │
│  │ Heroku / DigitalOcean│        │ Play Store / APK     │  │
│  │ Docker container     │        │ EAS Build            │  │
│  │ npm run build        │        │ Sideload             │  │
│  │ npm start            │        │                      │  │
│  └──────────────────────┘        └──────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ROADMAP                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  v0.1 ✅ CURRENT                                             │
│  └─ Bootstrap: App runs, permissions working                │
│                                                               │
│  v0.2 → Lectura de Archivos                                 │
│  └─ Scan MP3 files, display list                            │
│                                                               │
│  v0.3 → Reproducción de Audio                               │
│  └─ Play, pause, progress, background audio                 │
│                                                               │
│  v0.4 → Player Avanzado                                     │
│  └─ Next/previous, shuffle, repeat, mini-player            │
│                                                               │
│  v0.5 → Estado y Performance                                │
│  └─ Global state (zustand), optimization                   │
│                                                               │
│  v0.6 → Playlists Locales                                   │
│  └─ Create/edit playlists, local storage                    │
│                                                               │
│  v0.7 → Backend + Auth                                      │
│  └─ User registration, JWT, cloud sync ready                │
│                                                               │
│  v0.8 → Sync de Metadata                                    │
│  └─ Cloud backup, multi-device sync                         │
│                                                               │
│  v0.9 → UX + Polish                                         │
│  └─ Animations, dark mode, gestures                         │
│                                                               │
│  v1.0 ✅ RELEASE ESTABLE                                    │
│  └─ Play Store release, full feature set                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Architecture Principles
- **Separation of Concerns**: Hooks, utils, components isolated
- **TypeScript First**: Strict mode enforced, zero `any`
- **Minimal Scope**: v0.1 only features, no premature optimization
- **Production Quality**: Error handling, logging, configuration
- **Platform Aware**: Android-first, iOS/web compatible

### Why These Technologies?
- **React Native + Expo**: Managed workflow, no native code needed
- **Express + TypeScript**: Lightweight, type-safe, extensible
- **Strict TypeScript**: Catch errors at compile time, not runtime
- **Environment Variables**: Secure, deployment-ready configuration
- **Modular Structure**: Easy to test, refactor, and extend

---

**Created**: January 28, 2026  
**Version**: v0.1  
**Status**: ✅ Complete
