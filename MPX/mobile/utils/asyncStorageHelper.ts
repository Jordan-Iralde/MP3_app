import { Platform } from 'react-native';

let AsyncStorageInstance: any = null;
let initPromise: Promise<any> | null = null;
let initError: any = null;
let memoryStorage: Map<string, string> = new Map();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Initialize AsyncStorage with retries
 */
export const initAsyncStorage = async (): Promise<any> => {
  if (AsyncStorageInstance) return AsyncStorageInstance;
  if (initPromise) return initPromise;

  if (Platform.OS === 'web') {
    AsyncStorageInstance = null;
    return null;
  }

  let attempts = 0;

  const attemptInit = async (): Promise<any> => {
    attempts++;
    try {
      const module = await import('@react-native-async-storage/async-storage');
      AsyncStorageInstance = module.default;
      initError = null;
      console.log('[AsyncStorageHelper] AsyncStorage initialized successfully');
      return AsyncStorageInstance;
    } catch (error) {
      initError = error;
      console.error(`[AsyncStorageHelper] AsyncStorage init attempt ${attempts} failed:`, error);
      if (attempts < MAX_RETRIES) {
        console.log(`[AsyncStorageHelper] Retrying AsyncStorage init in ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return attemptInit();
      }
      return null;
    }
  };

  initPromise = attemptInit();
  return initPromise;
};

/**
 * Get storage instance, retry init if previous failed
 */
const getStorage = async (): Promise<any> => {
  if (!AsyncStorageInstance && initError) {
    console.log('[AsyncStorageHelper] Previous init failed, retrying...');
    await initAsyncStorage();
  }
  return AsyncStorageInstance;
};

/**
 * Memory storage fallback
 */
const createMemoryStorage = () => ({
  getItem: async (key: string) => memoryStorage.get(key) || null,
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  multiGet: async (keys: string[]) => keys.map((k) => [k, memoryStorage.get(k) || null] as [string, string | null]),
  multiSet: async (pairs: [string, string][]) => {
    pairs.forEach(([k, v]) => memoryStorage.set(k, v));
  },
});

/**
 * Safe getItem
 */
export const asyncStorageGetItem = async (key: string, defaultValue: string | null = null): Promise<string | null> => {
  try {
    let storage = await getStorage();
    if (!storage) {
      storage = createMemoryStorage();
    }
    const value = await storage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`[AsyncStorageHelper] Error getting item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Safe setItem
 */
export const asyncStorageSetItem = async (key: string, value: string): Promise<boolean> => {
  try {
    let storage = await getStorage();
    if (!storage) {
      storage = createMemoryStorage();
    }
    await storage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`[AsyncStorageHelper] Error setting item ${key}:`, error);
    return false;
  }
};

/**
 * Safe removeItem
 */
export const asyncStorageRemoveItem = async (key: string): Promise<boolean> => {
  try {
    let storage = await getStorage();
    if (!storage) {
      storage = createMemoryStorage();
    }
    await storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[AsyncStorageHelper] Error removing item ${key}:`, error);
    return false;
  }
};

/**
 * Safe multiGet
 */
export const asyncStorageMultiGet = async (keys: string[]): Promise<[string, string | null][]> => {
  try {
    let storage = await getStorage();
    if (!storage) {
      storage = createMemoryStorage();
    }
    return await storage.multiGet(keys);
  } catch (error) {
    console.error('[AsyncStorageHelper] Error in multiGet:', error);
    return keys.map((k) => [k, null]);
  }
};

/**
 * Safe multiSet
 */
export const asyncStorageMultiSet = async (keyValuePairs: [string, string][]): Promise<boolean> => {
  try {
    let storage = await getStorage();
    if (!storage) {
      storage = createMemoryStorage();
    }
    await storage.multiSet(keyValuePairs);
    return true;
  } catch (error) {
    console.error('[AsyncStorageHelper] Error in multiSet:', error);
    return false;
  }
};

/**
 * Get or initialize storage (for sync contexts, returns memory storage as fallback)
 */
export const getAsyncStorage = () => {
  if (AsyncStorageInstance) {
    return AsyncStorageInstance;
  }
  return createMemoryStorage();
};
