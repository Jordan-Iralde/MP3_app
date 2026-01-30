/**
 * FOLDER STRUCTURE & ARCHITECTURE (v0.2 Refactored)
 * 
 * This file explains the scalable architecture for the Resonix app.
 */

/**
 * NEW FOLDER STRUCTURE:
 * 
 * MPX/mobile/
 * ├── app/
 * │   └── (tabs)/                    # Expo Router screens
 * │       ├── library.tsx            # Library screen (UI only)
 * │       ├── home.tsx
 * │       ├── explore.tsx
 * │       ├── index.tsx
 * │       └── _layout.tsx
 * │
 * ├── domain/
 * │   └── models/
 * │       └── Song.ts                # Core Song domain model
 * │
 * ├── services/                      # Business logic layer
 * │   └── musicLibrary.service.ts    # MediaLibrary abstraction
 * │
 * ├── hooks/                         # React hooks (state + UI layer)
 * │   ├── use-local-music-library.ts # Hook for library state
 * │   ├── use-storage-permission.ts
 * │   └── ...
 * │
 * ├── components/                    # Reusable UI components
 * │   ├── themed-text.tsx
 * │   ├── themed-view.tsx
 * │   └── ...
 * │
 * ├── utils/                         # Utility functions
 * │   ├── formatDuration.ts
 * │   └── permissions.ts
 * │
 * ├── constants/                     # App constants
 * │   └── theme.ts
 * │
 * └── types/
 *     └── Track.ts                   # @deprecated (use Song instead)
 */

/**
 * LAYER ARCHITECTURE:
 * 
 * ┌─────────────────────────────────┐
 * │  UI LAYER (Screens)             │
 * │  - library.tsx                  │ ← No business logic
 * │  - Renders UI states            │
 * └────────────────┬────────────────┘
 *                  │ uses
 * ┌────────────────▼────────────────┐
 * │  HOOKS LAYER                    │
 * │  - useLocalMusicLibrary()       │ ← State management
 * │  - useStoragePermission()       │
 * │  - Manages loading/error states │
 * └────────────────┬────────────────┘
 *                  │ calls
 * ┌────────────────▼────────────────┐
 * │  SERVICE LAYER                  │
 * │  - musicLibraryService          │ ← Business logic
 * │  - Direct MediaLibrary calls    │
 * │  - Permission checks            │
 * │  - Error handling               │
 * └────────────────┬────────────────┘
 *                  │ uses
 * ┌────────────────▼────────────────┐
 * │  DOMAIN MODELS                  │
 * │  - Song interface               │ ← Pure data structures
 * │  - Type definitions             │
 * └─────────────────────────────────┘
 */

/**
 * DESIGN DECISIONS:
 * 
 * 1. SONG DOMAIN MODEL (domain/models/Song.ts)
 *    - Pure interface, no methods
 *    - Represents a music track regardless of source
 *    - Ready for backend sync later (same structure)
 *    - Field order: id, title, artist, duration, uri
 * 
 * 2. MUSIC LIBRARY SERVICE (services/musicLibrary.service.ts)
 *    - Singleton pattern (single instance)
 *    - Abstracts MediaLibrary complexity
 *    - Permission check before query
 *    - Centralized error handling
 *    - Asset → Song transformation
 *    - Ready to add caching/pagination later
 * 
 * 3. USELOCALMUSICLIBRARY HOOK (hooks/use-local-music-library.ts)
 *    - Manages hook state (songs, loading, error)
 *    - Calls service via async function
 *    - Auto-loads when permission granted
 *    - Provides refetch for manual refresh
 *    - Return type: UseLocalMusicLibraryState
 * 
 * 4. LIBRARY SCREEN (app/(tabs)/library.tsx)
 *    - No service calls (all via hook)
 *    - Five state renderings:
 *      1. Permission denied
 *      2. Loading
 *      3. Error
 *      4. Empty
 *      5. Songs list
 *    - Uses Song instead of Track
 *    - Touch handlers ready for playback integration
 */

/**
 * FUTURE-READY ARCHITECTURE:
 * 
 * PLAYBACK INTEGRATION:
 * └─ Create: services/audioPlayer.service.ts
 * └─ Create: hooks/useAudioPlayer.ts
 * └─ Update: library.tsx to call playback on tap
 * 
 * PLAYLISTS:
 * └─ Create: domain/models/Playlist.ts
 * └─ Create: services/playlistManager.service.ts
 * └─ Create: hooks/useUserPlaylists.ts
 * 
 * FAVORITES:
 * └─ Create: services/favoritesManager.service.ts
 * └─ Create: hooks/useFavorites.ts
 * └─ Update: library.tsx to show favorite indicator
 * 
 * BACKEND SYNC:
 * └─ Create: services/syncManager.service.ts
 * └─ Create: services/api/resonixApi.ts
 * └─ Update: all services to support sync
 * 
 * CACHING:
 * └─ Create: services/cache/songCache.ts
 * └─ Integrate with musicLibraryService
 * └─ Add TTL and invalidation strategies
 */

/**
 * NAMING CONVENTIONS:
 * 
 * Domain Models:
 * - Location: domain/models/*.ts
 * - Example: Song.ts
 * - Exports: Song (interface)
 * 
 * Services:
 * - Location: services/*.service.ts
 * - Example: musicLibrary.service.ts
 * - Exports: ServiceClass (class), serviceInstance (singleton)
 * 
 * Hooks:
 * - Location: hooks/use-*.ts
 * - Example: use-local-music-library.ts
 * - Exports: useLocalMusicLibrary (hook function)
 * - Return Type: UseLocalMusicLibraryState (interface)
 * 
 * Screens:
 * - Location: app/(tabs)/*.tsx
 * - Example: library.tsx
 * - Name: CamelCase exported as default function
 * 
 * Types:
 * - Location: types/*.ts
 * - Example: Track.ts
 * - Use for backward compatibility only
 */

/**
 * NO OVER-ENGINEERING:
 * 
 * What we avoided:
 * ✗ Redux/Zustand/Recoil - React hooks are sufficient
 * ✗ Context API - Not needed yet (only 2-3 layers)
 * ✗ DI container - Manual injection keeps it simple
 * ✗ Abstract base classes - KISS principle
 * ✗ Heavy typing - Only what's needed
 * ✗ Repository pattern - Service layer is enough
 * 
 * What we included:
 * ✓ Clear separation of concerns
 * ✓ Testable service layer
 * ✓ Scalable folder structure
 * ✓ Type safety where it matters
 * ✓ Easy to extend (add new services/hooks)
 * ✓ No external state library lock-in
 */

/**
 * MIGRATION PATH FROM v0.1 TO v0.2:
 * 
 * 1. Old: app/(tabs)/library.tsx imported useAudioLibrary
 *    New: app/(tabs)/library.tsx imports useLocalMusicLibrary
 * 
 * 2. Old: Hook returned tracks: Track[]
 *    New: Hook returns songs: Song[]
 * 
 * 3. Old: Direct MediaLibrary calls in hook
 *    New: Hook calls musicLibraryService
 * 
 * 4. Old: types/Track.ts was main model
 *    New: domain/models/Song.ts is canonical
 *    Old: Track.ts kept for compatibility
 * 
 * Backward compatibility:
 * - Track type still exists (marked @deprecated)
 * - Can import and use if needed
 * - Gradual migration to Song possible
 */

export {};
