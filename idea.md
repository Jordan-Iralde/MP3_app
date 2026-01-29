🎵 MP3 Player App

Stack: React Native · Node.js · Express · MongoDB
Modo principal: canciones guardadas localmente en el dispositivo
Repo: público
Objetivo: una build móvil deployada por versión

1️⃣ Arquitectura general (alto nivel)
📱 Mobile (React Native)

Responsabilidades:

UI/UX

Reproducción de audio

Gestión de archivos locales

Estado de reproducción

Cache / metadata

Tecnologías sugeridas:

expo-av o react-native-track-player

react-native-fs o expo-file-system

Estado: zustand o redux-toolkit

Navegación: react-navigation

🌐 Backend (Node + Express)

Rol ligero, no crítico para reproducción:

Sync de metadata

Playlists en la nube

Backup de información del usuario

Futuro: recomendaciones / estadísticas

Endpoints típicos:

/auth

/users

/playlists

/tracks/metadata

🗄️ MongoDB

Modelos iniciales:

User

Playlist

TrackMetadata (no audio)

DeviceSync

2️⃣ Estructura del repositorio
mp3-player/
├── mobile/
│   ├── app/
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── services/
│   └── server.ts
│
├── docs/
│   ├── roadmap.md
│   ├── api.md
│   └── architecture.md
│
└── README.md

3️⃣ Principios del roadmap

Cada versión = build instalable

Feature mínima pero cerrada

No features “a medias”

Primero core offline, luego cloud

UX > features

🧭 ROADMAP v0.1 → v1.0 (10 pasos)
🔹 v0.1 — Bootstrap funcional

🎯 Objetivo: App corre en celular

Mobile

Setup React Native (Expo recomendado)

Navegación base

Pantalla Home vacía

Permisos de storage

Backend

Express server básico

Health check endpoint

📦 Build: Android APK / Expo Dev

🔹 v0.2 — Lectura de archivos locales

🎯 Objetivo: detectar MP3 del dispositivo

Escaneo de storage

Listado de canciones

Leer metadata básica (title, artist)

UI lista simple

📦 Build funcional con canciones reales

🔹 v0.3 — Reproducción de audio

🎯 Objetivo: reproductor usable

Play / Pause

Track actual

Duración y progreso

Manejo de audio en background

📦 Build “ya es un MP3 player”

🔹 v0.4 — Player avanzado

🎯 Objetivo: experiencia decente

Next / Previous

Shuffle

Repeat

Mini-player persistente

📦 Build daily-use

🔹 v0.5 — Estado y performance

🎯 Objetivo: estabilidad

Store global (zustand/redux)

Optimización de listas

Manejo de errores

Persistencia de estado

📦 Build estable

🔹 v0.6 — Playlists locales

🎯 Objetivo: organización

Crear / editar playlists

Agregar / quitar canciones

Guardado local (AsyncStorage)

📦 Build orientada a usuario real

🔹 v0.7 — Backend + Auth

🎯 Objetivo: base cloud

Registro / login

JWT

Usuario asociado a device

API documentada

📦 Build con login opcional

🔹 v0.8 — Sync de metadata

🎯 Objetivo: backup ligero

Sync playlists

Sync favoritos

Manejo offline-first

📦 Build multi-device ready

🔹 v0.9 — UX + polish

🎯 Objetivo: producto presentable

Animaciones

Dark mode

Gestos

Feedback visual

📦 Build casi final

🔹 v1.0 — Release estable

🎯 Objetivo: MP3 Player sólido

Bugfixing

Performance final

Docs completos

README profesional

Screenshots

Licencia

CI básico

📦 Build Play Store / APK público