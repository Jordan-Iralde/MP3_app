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
