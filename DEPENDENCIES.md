# Resonix v0.1 Dependencies & Versions

This document tracks all dependencies for transparency and reproducibility.

---

## Backend Dependencies

### Production (`dependencies`)
```json
"cors": "^2.8.6",              // CORS middleware
"dotenv": "^17.2.3",           // Environment variable loader
"express": "^5.2.1",           // Web framework
"mongoose": "^9.1.5",          // MongoDB (for future cloud features)
"nodemon": "^3.1.11"           // Development auto-reload
```

### Development (`devDependencies`)
```json
"@types/cors": "^2.8.17",      // TypeScript types for cors
"@types/express": "^5.0.6",    // TypeScript types for express
"@types/node": "^22.0.0",      // TypeScript types for Node.js
"ts-node": "^10.9.2",          // TypeScript execution
"typescript": "^5.9.3"         // TypeScript compiler
```

### Scripts
```json
"dev": "nodemon src/server.ts"      // Development: auto-reload
"build": "tsc"                       // Build: compile TypeScript
"start": "node dist/server.js"       // Production: run compiled
"test": "..."                        // Future test framework
```

---

## Mobile Dependencies

### Production (`dependencies`)
```json
"@expo/vector-icons": "^15.0.3",                 // Icon library
"@react-native-camera-roll/camera-roll": "^7.4.0", // (prep for v0.2)
"@react-native-permission/permission": "^4.1.5",   // (prep for v0.2)
"@react-navigation/bottom-tabs": "^7.4.0",      // Tab navigation
"@react-navigation/elements": "^2.6.3",         // Navigation utilities
"@react-navigation/native": "^7.1.8",           // Navigation foundation

"expo": "~54.0.32",                             // Expo framework
"expo-media-library": "~14.0.1",                // Storage permissions & media access
"expo-permissions": "^15.8.0",                  // Permission abstraction
"expo-constants": "~18.0.13",                   // Constants
"expo-font": "~14.0.11",                        // Font loading
"expo-haptics": "~15.0.8",                      // Haptic feedback
"expo-image": "~3.0.11",                        // Image handling
"expo-linking": "~8.0.11",                      // Deep linking
"expo-router": "~6.0.22",                       // File-based routing
"expo-splash-screen": "~31.0.13",               // Splash screen
"expo-status-bar": "~3.0.9",                    // Status bar styling
"expo-symbols": "~1.0.8",                       // SF Symbols
"expo-system-ui": "~6.0.9",                     // System UI integration
"expo-web-browser": "~15.0.10",                 // Web browser

"react": "19.1.0",                              // React (latest)
"react-dom": "19.1.0",                          // React DOM
"react-native": "0.81.5",                       // React Native
"react-native-gesture-handler": "~2.28.0",      // Gesture support
"react-native-worklets": "0.5.1",               // Performance
"react-native-reanimated": "~4.1.1",            // Animations
"react-native-safe-area-context": "~5.6.0",    // Safe area
"react-native-screens": "~4.16.0",              // Screen management
"react-native-web": "~0.21.0"                   // Web support
```

### Development (`devDependencies`)
```json
"@types/react": "~19.1.0",      // TypeScript types for React
"typescript": "~5.9.2",         // TypeScript compiler
"eslint": "^9.25.0",            // Linting
"eslint-config-expo": "~10.0.0" // Expo linting rules
```

### Scripts
```json
"start": "expo start"               // Start development server
"reset-project": "node ./scripts/reset-project.js" // Reset to clean state
"android": "expo start --android"   // Run on Android
"ios": "expo start --ios"           // Run on iOS
"web": "expo start --web"           // Run in web browser
"lint": "expo lint"                 // Check linting
```

---

## Version Rationale

### Why These Versions?

**Backend**
- Express 5.2.1: Latest stable with TypeScript support
- TypeScript 5.9.3: Latest stable (strict mode critical)
- Node.js 18+: LTS version with full ES2020 support
- Nodemon 3.1.11: Latest for reliable auto-reload

**Mobile**
- Expo ~54.0.32: Latest stable managed workflow
- React 19.1.0: Latest with proper typing
- React Native 0.81.5: Latest stable compatible with Expo 54
- TypeScript ~5.9.2: Latest for mobile strict mode

---

## Installation

### Backend
```bash
cd MPX/backend
npm install
# All specified versions will be locked in package-lock.json
```

### Mobile
```bash
cd MPX/mobile
npm install
# All specified versions will be locked in package-lock.json
```

---

## Important Notes

### Pinning Strategy
- `^x.y.z`: Allows minor/patch updates (most dependencies)
- `~x.y.z`: Allows patch updates only (framework versions: Expo, React)
- Exact versions: Critical tools (TypeScript, Node.js)

### Platform Compatibility
- **Node.js**: 18.0.0 or higher required
- **Android**: API 31+ (Android 12+)
- **iOS**: 13.0+ (via Expo managed workflow)
- **Web**: Modern browsers (via React Native Web)

### Future Considerations

**For v0.2** (File Scanning)
```json
"react-native-fs": "^2.20.0"    // File system access
// OR: Use expo-media-library (already installed)
```

**For v0.3** (Audio Playback)
```json
"expo-av": "^13.x.x"            // Audio/Video playback
"react-native-track-player": "^4.x.x" // Alternative
```

**For v0.7** (Authentication)
```json
"jsonwebtoken": "^9.x.x"        // Backend JWT
"@react-native-async-storage/async-storage": "^1.x.x" // Token storage
```

---

## Security & Compliance

✅ No known vulnerabilities in v0.1 (checked at creation date)  
✅ All packages are well-maintained  
✅ No deprecated packages  
✅ Type definitions up-to-date  

---

## Maintenance

**Weekly**: Check for critical security updates
```bash
npm audit
npm update --save
```

**Monthly**: Check for new versions
```bash
npm outdated
# Review and test updates before applying
```

---

## License Compatibility

All dependencies are compatible with ISC/MIT open-source licensing model.

---

Generated: January 28, 2026  
Status: v0.1 Complete
