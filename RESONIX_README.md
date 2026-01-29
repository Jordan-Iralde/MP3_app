# Resonix — v0.1 Bootstrap Funcional

> **An offline-first MP3 player for Android, built with React Native (Expo) and Express.**

[![Status](https://img.shields.io/badge/Status-v0.1%20Complete-success)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 🎯 Quick Start

### Backend (5 minutes)
```bash
cd MPX/backend
npm install
npm run dev
# Running on http://localhost:3000
```

### Mobile (5 minutes)
```bash
cd MPX/mobile
npm install
npm start
# Press 'a' for Android
```

**[Full Setup Guide →](QUICKSTART.md)**

---

## ✨ What's Included

### 📱 Mobile App
- React Native with Expo (managed workflow)
- Clean HomeScreen with permission status
- Automatic storage permission request (Android)
- Modular hooks and utilities
- Strict TypeScript configuration
- Ready for v0.2 features

### 🔗 Backend Server
- Express + TypeScript
- `/health` endpoint for monitoring
- CORS configured
- Environment variable support
- Development auto-reload (nodemon)
- Production-ready structure

### 📚 Documentation
- [QUICKSTART.md](QUICKSTART.md) — 5-minute setup
- [BOOTSTRAP_V01.md](BOOTSTRAP_V01.md) — Full guide
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deploy anywhere
- [CODE_REVIEW_CHECKLIST.md](CODE_REVIEW_CHECKLIST.md) — Quality assurance
- [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) — System design
- [CODE_SNIPPETS.md](CODE_SNIPPETS.md) — Reference code
- [INDEX.md](INDEX.md) — Complete navigation

---

## 🚀 Features (v0.1)

✅ App runs on Android without crashes  
✅ Automatic storage permission handling  
✅ Permission status display  
✅ Clean, minimal UI  
✅ Express API with health check  
✅ CORS enabled for mobile  
✅ TypeScript strict mode (both projects)  
✅ No hardcoded values (environment-driven)  
✅ Production-grade code quality  
✅ Comprehensive documentation  

---

## 📂 Project Structure

```
MPX/
├── backend/                    # Express + TypeScript server
│   ├── src/
│   │   ├── server.ts          # Express app
│   │   ├── config.ts          # Environment config
│   │   ├── types.ts           # TypeScript types
│   │   └── routes/
│   │       └── health.ts      # /health endpoint
│   ├── .env                   # Development config
│   ├── .env.example           # Template
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                     # React Native + Expo
    ├── app/
    │   ├── (tabs)/
    │   │   ├── _layout.tsx
    │   │   └── index.tsx      # HomeScreen
    │   └── _layout.tsx
    ├── hooks/
    │   └── use-storage-permission.ts
    ├── utils/
    │   └── permissions.ts
    ├── components/
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## 🛠️ Technology Stack

**Mobile**
- React Native 0.81.5
- Expo 54 (managed)
- React Navigation 7
- TypeScript 5.9
- expo-media-library

**Backend**
- Node.js 18+
- Express 5.2
- TypeScript 5.9
- Nodemon (dev)
- CORS, dotenv

**Both Projects**
- Strict TypeScript mode
- Zero `any` type usage
- Type-safe configurations
- Production-ready structure

---

## 📋 Verification

**Backend Working?**
```bash
curl http://localhost:3000/health
# Expected: { "status": "ok" }
```

**Mobile Working?**
- App launches without errors ✅
- HomeScreen displays "Resonix" title ✅
- Permission status shown (Initializing → Ready to Go) ✅
- No console warnings ✅

---

## 📚 Documentation Quick Links

| Need | Link |
|------|------|
| **Get Started (5 min)** | [QUICKSTART.md](QUICKSTART.md) |
| **Full Feature Guide** | [BOOTSTRAP_V01.md](BOOTSTRAP_V01.md) |
| **Deploy to Production** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Code Quality Review** | [CODE_REVIEW_CHECKLIST.md](CODE_REVIEW_CHECKLIST.md) |
| **Architecture Overview** | [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) |
| **Code Snippets** | [CODE_SNIPPETS.md](CODE_SNIPPETS.md) |
| **All Documentation** | [INDEX.md](INDEX.md) |
| **Dependencies** | [DEPENDENCIES.md](DEPENDENCIES.md) |
| **What Was Built** | [DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md) |
| **Implementation Details** | [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) |

---

## 🎓 Code Quality

- ✅ **TypeScript**: Strict mode enabled, no `any` types
- ✅ **Type Safety**: All functions fully typed
- ✅ **Error Handling**: Proper try-catch, error states
- ✅ **Security**: Environment-driven config, no hardcoded values
- ✅ **Documentation**: Inline comments + comprehensive guides
- ✅ **Testing**: Hook-based architecture, easy to test
- ✅ **Modularity**: Clear separation of concerns
- ✅ **Scope**: v0.1 features only, no premature optimization

---

## 🔄 Development Workflow

### Making Changes

**Backend**
```bash
cd MPX/backend
npm run dev          # Auto-reloads on changes
npm run build        # Check TypeScript errors
```

**Mobile**
```bash
cd MPX/mobile
npm start            # Hot reload on save
npm run android      # Build & test
npm run lint         # Check code
```

### Common Tasks

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Run type checking
npx tsc --noEmit

# Format code
npx prettier --write .
```

---

## 📦 What's Next?

### v0.2 — Lectura de Archivos Locales
- Scan MP3 files from device storage
- Display song list with metadata
- Read basic ID3 tags

### v0.3 — Reproducción de Audio
- Add audio playback with expo-av
- Play, pause, progress controls
- Background audio support

### v0.4+ → See [roadmap.md](roadmap.md)

---

## 🚀 Deployment

### Backend (Quick)
```bash
cd MPX/backend
npm install
npm run build
npm start
# Or deploy to Heroku, DigitalOcean, AWS, etc.
# See [DEPLOYMENT.md](DEPLOYMENT.md)
```

### Mobile (Quick)
```bash
cd MPX/mobile
npm run android      # Build APK
eas build --platform android  # Cloud build
# Then submit to Play Store
# See [DEPLOYMENT.md](DEPLOYMENT.md)
```

---

## 🔒 Security

- ✅ No hardcoded credentials
- ✅ Environment variable based config
- ✅ CORS configured (customizable)
- ✅ Runtime permission handling
- ✅ TypeScript strict mode prevents unsafe casts
- ✅ No external security vulnerabilities

---

## 📄 License

Code is provided as-is. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Jordan Iralde

---

## 🤝 Contributing

This is a learning/reference project. Feel free to fork and adapt!

---

## 📞 Need Help?

- **Setup issues**: Check [QUICKSTART.md](QUICKSTART.md)
- **Code questions**: See [CODE_SNIPPETS.md](CODE_SNIPPETS.md)
- **Architecture**: Read [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)
- **Deployment**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
- **Everything else**: [INDEX.md](INDEX.md) has all docs

---

## Status

**v0.1 Bootstrap**: ✅ COMPLETE

The app runs on Android devices, handles permissions correctly, and is ready for v0.2 development.

---

**Last Updated**: January 28, 2026  
**Version**: 0.1.0  
**Status**: Production-Ready

