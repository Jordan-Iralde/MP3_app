import { useEffect, useCallback, useState } from 'react';
import {
  errorHandlingService,
  AppError,
  ErrorCode,
} from '@/services/error-handling.service';

/**
 * Hook for handling errors in components
 */
export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [isHandling, setIsHandling] = useState(false);

  const handleError = useCallback((appError: AppError | Error) => {
    setIsHandling(true);

    if ('code' in appError) {
      // It's already an AppError
      setError(appError as AppError);
      errorHandlingService.logError(appError as AppError);
    } else {
      // Convert Error to AppError
      const converted = errorHandlingService.createError(
        ErrorCode.UNKNOWN_ERROR,
        (appError as Error).message,
        'An unexpected error occurred.',
        'medium',
        appError as Error
      );
      setError(converted);
    }

    setTimeout(() => setIsHandling(false), 100);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(
    async (operation: () => Promise<any>) => {
      try {
        setIsHandling(true);
        await errorHandlingService.retryWithBackoff(operation);
        clearError();
      } catch (err) {
        handleError(err as Error);
      } finally {
        setIsHandling(false);
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isHandling,
    handleError,
    clearError,
    retry,
  };
}

/**
 * Hook for handling audio-related errors
 */
export function useAudioErrorHandler() {
  const { error, handleError, clearError, retry } = useErrorHandler();

  const handleAudioError = useCallback(
    (audioError: Error, trackId?: string) => {
      const appError = errorHandlingService.handleAudioError(
        audioError,
        trackId
      );
      handleError(appError);
    },
    [handleError]
  );

  return {
    error,
    handleAudioError,
    clearError,
    retry,
  };
}

/**
 * Hook for handling storage errors
 */
export function useStorageErrorHandler() {
  const { error, handleError, clearError, retry } = useErrorHandler();

  const handleStorageError = useCallback(
    (storageError: Error) => {
      const appError = errorHandlingService.handleStorageError(storageError);
      handleError(appError);
    },
    [handleError]
  );

  return {
    error,
    handleStorageError,
    clearError,
    retry,
  };
}

/**
 * Hook for handling network errors
 */
export function useNetworkErrorHandler() {
  const { error, handleError, clearError, retry } = useErrorHandler();

  const handleNetworkError = useCallback(
    (networkError: Error) => {
      const appError = errorHandlingService.handleNetworkError(networkError);
      handleError(appError);
    },
    [handleError]
  );

  return {
    error,
    handleNetworkError,
    clearError,
    retry,
  };
}

/**
 * Hook for handling permission errors
 */
export function usePermissionErrorHandler() {
  const { error, handleError, clearError } = useErrorHandler();

  const handlePermissionError = useCallback(
    (permission: string) => {
      const appError = errorHandlingService.handlePermissionError(permission);
      handleError(appError);
    },
    [handleError]
  );

  return {
    error,
    handlePermissionError,
    clearError,
  };
}

/**
 * Hook for subscribing to global errors
 */
export function useGlobalErrorSubscription(
  callback: (error: AppError) => void
) {
  useEffect(() => {
    const unsubscribe = errorHandlingService.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook for viewing error history
 */
export function useErrorHistory(
  code?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
) {
  const [history, setHistory] = useState<AppError[]>([]);

  const refreshHistory = useCallback(() => {
    const errors = errorHandlingService.getErrorHistory(code, severity);
    setHistory(errors);
  }, [code, severity]);

  useEffect(() => {
    refreshHistory();

    const unsubscribe = errorHandlingService.subscribe(() => {
      refreshHistory();
    });

    return unsubscribe;
  }, [refreshHistory]);

  const clearHistory = useCallback(() => {
    errorHandlingService.clearErrorHistory();
    setHistory([]);
  }, []);

  const exportHistory = useCallback(() => {
    return errorHandlingService.exportErrors();
  }, []);

  return {
    history,
    clearHistory,
    exportHistory,
    refreshHistory,
  };
}

/**
 * Hook for async operations with error handling
 */
export function useAsyncOperation<T, E = Error>(
  operation: () => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null;
    error: E | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });

    try {
      const result = await operation();
      setState({ data: result, error: null, loading: false });
      return result;
    } catch (err) {
      const error = err as E;
      setState({ data: null, error, loading: false });
      throw error;
    }
  }, [operation]);

  return {
    ...state,
    execute,
  };
}
