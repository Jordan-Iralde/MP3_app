# Resonix v0.1 — Bootstrap Funcional

> Offline-first MP3 player, built with React Native and Express.

## 📦 What's Included

### Mobile (React Native + Expo)
- ✅ Expo managed workflow with TypeScript
- ✅ React Navigation setup (tab-based)
- ✅ Clean HomeScreen with permission status
- ✅ Storage permission handling for Android
- ✅ Modular architecture (hooks, utils, components)
- ✅ Strict TypeScript configuration

### Backend (Node.js + Express)
- ✅ Express server with TypeScript
- ✅ Environment variable support via `.env`
- ✅ CORS enabled for mobile integration
- ✅ `/health` endpoint for monitoring
- ✅ Proper routing structure
- ✅ Strict TypeScript configuration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android emulator or physical device (for mobile testing)

### Backend Setup

```bash
cd MPX/backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will run on `http://localhost:3000` by default.

**Health check:**
```bash
curl http://localhost:3000/health
# Response: { "status": "ok" }
```

### Mobile Setup

```bash
cd MPX/mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# For Android
npm run android

# For iOS
npm run ios

# For web
npm run web
```

---

## 🏗️ Project Structure

```
MPX/
├── backend/
│   ├── src/
│   │   ├── config.ts          # Environment configuration
│   │   ├── server.ts          # Express app initialization
│   │   └── routes/
│   │       └── health.ts      # Health check endpoint
│   ├── .env                   # Development environment variables
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
└── mobile/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── _layout.tsx    # Tab navigation layout
    │   │   └── index.tsx      # HomeScreen
    │   ├── _layout.tsx        # Root layout
    │   └── modal.tsx
    ├── hooks/
    │   └── use-storage-permission.ts  # Permission management hook
    ├── utils/
    │   └── permissions.ts     # Permission utilities
    ├── components/            # Reusable UI components
    ├── constants/             # Theme and constants
    ├── app.json              # Expo configuration
    ├── tsconfig.json
    ├── package.json
    └── README.md
```

---

## 📋 v0.1 Checklist

- ✅ React Native project with Expo
- ✅ TypeScript configured (strict mode)
- ✅ Navigation stack (tabs with HomeScreen)
- ✅ Storage permissions request on Android
- ✅ Clean component architecture
- ✅ Express server with TypeScript
- ✅ Health check endpoint
- ✅ CORS enabled
- ✅ Environment variable support
- ✅ No warnings or runtime errors

---

## 🔧 Configuration

### Backend Environment Variables

Edit `MPX/backend/.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

For production, set `NODE_ENV=production` and restrict `CORS_ORIGIN` to your mobile app domain.

---

## 🧪 Testing

### Backend
```bash
cd MPX/backend
npm run dev
curl http://localhost:3000/health
```

### Mobile
The app will automatically request storage permissions on launch. The HomeScreen displays:
- **Initializing**: Checking permission status
- **Permission Error**: If permission check fails
- **Permissions Required**: If not granted (user needs to allow)
- **Ready to Go**: If permissions are granted ✓

---

## 📝 Notes

- **No audio playback yet**: v0.1 focuses on infrastructure and permissions.
- **Android-first**: Primary development target.
- **Offline-first design**: Local storage first, cloud sync in future versions.
- **Single build per version**: Each version produces one installable APK/build.

---

## 🎯 Next Steps (v0.2+)

- Scan local MP3 files from device storage
- Display list of songs with metadata
- Audio playback infrastructure
- Player UI (play, pause, progress)

---

## 📄 License

Código de uso libre. Refer to the root LICENSE file.

---

## 👤 Author

Jordan Iralde
