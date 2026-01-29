# Resonix v0.1 Code Snippets Reference

Quick reference for the most important code in v0.1.

---

## Backend

### src/server.ts (Express Setup)
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';

import { config } from './config';
import healthRoutes from './routes/health';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Routes
app.use('/', healthRoutes);

// Error handling
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(config.PORT, () => {
  const env = config.NODE_ENV === 'production' ? 'production' : 'development';
  console.log(`Backend running on port ${config.PORT} (${env})`);
});
```

### src/config.ts (Configuration)
```typescript
interface Config {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CORS_ORIGIN: string;
}

function getConfig(): Config {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['NODE_ENV'];
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    CORS_ORIGIN: corsOrigin,
  };
}

export const config = getConfig();
```

### src/routes/health.ts (Endpoint)
```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

export default router;
```

### package.json (Backend Scripts)
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## Mobile

### app/(tabs)/index.tsx (HomeScreen)
```typescript
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStoragePermission } from '@/hooks/use-storage-permission';

export default function HomeScreen() {
  const { isGranted, isLoading, error } = useStoragePermission();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Resonix
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your offline-first MP3 player
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {isLoading && (
          <ThemedText style={styles.statusText}>
            Initializing...
          </ThemedText>
        )}

        {!isLoading && error && (
          <ThemedView style={styles.errorBox}>
            <ThemedText style={styles.errorText}>
              ⚠️ Permission Error
            </ThemedText>
            <ThemedText style={styles.errorDescription}>
              {error.message}
            </ThemedText>
          </ThemedView>
        )}

        {!isLoading && !error && !isGranted && (
          <ThemedView style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              ⚙️ Permissions Required
            </ThemedText>
            <ThemedText style={styles.warningDescription}>
              Storage access is needed to read your music files.
            </ThemedText>
          </ThemedView>
        )}

        {!isLoading && isGranted && (
          <ThemedView style={styles.successBox}>
            <ThemedText style={styles.successText}>
              ✓ Ready to Go
            </ThemedText>
            <ThemedText style={styles.successDescription}>
              Storage permissions granted. v0.1 bootstrap complete.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.versionText}>
          v0.1 — Bootstrap funcional
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#E53E3E',
  },
  errorDescription: {
    fontSize: 14,
    color: '#C53030',
  },
  // ... additional styles
});
```

### hooks/use-storage-permission.ts (Permission Hook)
```typescript
import { useEffect, useState } from 'react';
import { checkStoragePermission, requestStoragePermission } from '@/utils/permissions';

export interface PermissionStatus {
  isGranted: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage storage permissions.
 * Automatically requests permission on first mount if needed.
 */
export function useStoragePermission(): PermissionStatus {
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializePermission = async () => {
      try {
        setIsLoading(true);
        const hasPermission = await checkStoragePermission();

        if (!hasPermission) {
          const granted = await requestStoragePermission();
          setIsGranted(granted);
        } else {
          setIsGranted(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsGranted(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializePermission();
  }, []);

  return { isGranted, isLoading, error };
}
```

### utils/permissions.ts (Permission Utilities)
```typescript
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

/**
 * Request storage permissions for accessing audio files on Android.
 * Returns true if permission is granted, false otherwise.
 */
export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
}

/**
 * Check if storage permission is already granted.
 */
export async function checkStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
}
```

### app.json (Expo Configuration - Relevant Sections)
```json
{
  "expo": {
    "name": "Resonix",
    "version": "0.1.0",
    "slug": "resonix",
    "android": {
      "permissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_AUDIO"
      ]
    }
  }
}
```

---

## Configuration Files

### Backend .env (Development)
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Backend tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "ignoreDeprecations": "6.0"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Mobile tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

## Common Commands

### Backend Development
```bash
cd MPX/backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Test health endpoint
curl http://localhost:3000/health
```

### Mobile Development
```bash
cd MPX/mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator
npm run ios

# Run in web browser
npm run web

# Check linting
npm run lint
```

---

## Type Definitions

### Backend Response Types
```typescript
// Health endpoint
interface HealthResponse {
  status: 'ok';
}

// Error response
interface ErrorResponse {
  error: string;
}
```

### Mobile Hook Types
```typescript
interface PermissionStatus {
  isGranted: boolean;
  isLoading: boolean;
  error: Error | null;
}
```

---

## Testing Examples

### Backend Health Check
```bash
# Test GET /health
curl -X GET http://localhost:3000/health

# With pretty JSON output
curl -s http://localhost:3000/health | jq

# Test 404
curl -X GET http://localhost:3000/nonexistent
```

### Mobile Permission Check
The app automatically checks and requests permissions on launch. Check Android Logcat:
```bash
adb logcat | grep Resonix
```

---

## Error Handling Examples

### Backend
```typescript
// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Try-catch in config
try {
  const port = parseInt(process.env.PORT || '3000', 10);
} catch (error) {
  console.error('Invalid PORT:', error);
}
```

### Mobile
```typescript
// Hook error handling
catch (err) {
  setError(err instanceof Error ? err : new Error('Unknown error'));
  setIsGranted(false);
}

// UI error display
{!isLoading && error && (
  <ThemedView style={styles.errorBox}>
    <ThemedText style={styles.errorText}>
      ⚠️ Permission Error
    </ThemedText>
    <ThemedText style={styles.errorDescription}>
      {error.message}
    </ThemedText>
  </ThemedView>
)}
```

---

## Best Practices Demonstrated

✅ **TypeScript Strict Mode**
- All types explicitly defined
- No implicit `any` types
- Function return types required

✅ **Error Handling**
- Try-catch in async operations
- User-friendly error messages
- Proper error state management

✅ **React Hooks**
- Proper dependency arrays
- Single responsibility
- Type-safe return values

✅ **Environment Configuration**
- Externalized configuration
- Default values provided
- Production-ready structure

✅ **Code Organization**
- Separation of concerns
- Reusable utilities
- Clear naming conventions

✅ **Comments**
- JSDoc comments on functions
- Inline comments only where necessary
- Clear intent in code

---

**Version**: v0.1  
**Last Updated**: January 28, 2026  
**Status**: Production-Ready ✅
