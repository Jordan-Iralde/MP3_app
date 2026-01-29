# Quick Start Guide — Resonix v0.1

## 5-Minute Setup

### 1. Backend (Terminal 1)
```bash
cd MPX/backend
npm install
npm run dev
```
✅ Server running at `http://localhost:3000`
✅ Test: `curl http://localhost:3000/health`

### 2. Mobile (Terminal 2)
```bash
cd MPX/mobile
npm install
npm start
```
✅ Expo dev server running
✅ Press `a` for Android
✅ Press `i` for iOS
✅ Press `w` for web

---

## Project Files (Key)

### Backend
- `src/server.ts` — Express app entry point
- `src/config.ts` — Environment configuration
- `src/routes/health.ts` — Health check endpoint
- `.env` — Local development variables
- `tsconfig.json` — TypeScript strict mode

### Mobile
- `app/(tabs)/index.tsx` — HomeScreen (main UI)
- `hooks/use-storage-permission.ts` — Permission hook
- `utils/permissions.ts` — Permission utilities
- `app.json` — Expo config + Android permissions
- `tsconfig.json` — TypeScript strict mode

---

## Key Features (v0.1)

✅ **Backend**
- Running Express with TypeScript
- `/health` endpoint returns `{ status: "ok" }`
- CORS enabled
- Environment variables configured

✅ **Mobile**
- App starts without errors
- HomeScreen displays permission status
- Auto-requests storage permission on Android
- Clean, minimal UI
- No player or file scanning (v0.2+)

---

## Development Workflow

### Making Changes

**Backend:**
- Edit `src/**/*.ts` files
- Nodemon auto-reloads on save
- TypeScript errors show in terminal

**Mobile:**
- Edit `app/`, `hooks/`, `utils/` files
- Expo hot-reloads on save
- Check console for TypeScript errors

### Building

**Backend:**
```bash
npm run build  # Creates dist/ folder
npm start      # Run compiled version
```

**Mobile:**
```bash
npm run android  # Build and run on Android
npm run ios      # Build and run on iOS
```

---

## Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Mobile permissions not working
- Ensure `expo-media-library` is installed: `npm install`
- Check `app.json` has Android permissions declared
- Clear Expo cache: `npm start -- --clear`

### TypeScript errors
- Run: `npm install` to ensure all types are installed
- Check terminal output for specific error messages
- Refer to `tsconfig.json` for strict mode settings

---

## Testing

### Backend Health Check
```bash
curl http://localhost:3000/health
# Expected: { "status": "ok" }
```

### Mobile Permission Status
- Open app on Android device/emulator
- App will auto-request storage permission
- HomeScreen will display "Ready to Go" ✓ when granted

---

## Next: v0.2 Preview

Coming in the next version:
- Scan MP3 files from device storage
- Display song list with metadata
- Player UI components
- Audio playback setup

---

## Useful Commands

```bash
# Backend
npm run dev       # Start development server
npm run build     # Compile TypeScript
npm start         # Run compiled server

# Mobile
npm start         # Start Expo server
npm run android   # Run on Android
npm run ios       # Run on iOS
npm run web       # Run in web browser
npm run lint      # Check linting
```

---

## Environment Variables

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

---

## Resources

- [Full Bootstrap Guide](BOOTSTRAP_V01.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Roadmap](roadmap.md)
- [Architecture](architecture.md)

---

**Status**: ✅ v0.1 Complete — Bootstrap Funcional Ready

