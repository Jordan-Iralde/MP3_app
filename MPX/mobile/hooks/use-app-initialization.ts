import { useEffect, useState } from 'react';
import { initAsyncStorage } from '@/utils/asyncStorageHelper';

/**
 * Hook to initialize AsyncStorage and other critical services
 * Call this in the root component or the earliest component in your app
 */
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[useAppInitialization] Starting app initialization...');
        
        // Initialize AsyncStorage first
        await initAsyncStorage();
        
        console.log('[useAppInitialization] App initialization completed');
        setIsInitialized(true);
      } catch (error) {
        console.error('[useAppInitialization] Initialization error:', error);
        setInitError(error instanceof Error ? error : new Error(String(error)));
        // Don't block app on initialization error, but log it
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  return { isInitialized, initError };
};
