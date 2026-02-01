import { useEffect, useState } from 'react';
import { cacheService } from '@/services/cache.service';
import { loggerService } from '@/services/logger.service';

/**
 * Hook for cache management with automatic cleanup
 */
export function useCache() {
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    // Cleanup expired entries periodically
    const interval = setInterval(() => {
      cacheService.cleanup();
      setCacheSize(cacheService.getSize());
      loggerService.debug('Cache', 'Cleanup performed', {
        size: cacheService.getSize(),
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const getCached = <T,>(key: string): T | null => {
    const data = cacheService.get<T>(key);
    if (data) {
      loggerService.debug('Cache', 'Cache hit', { key });
    }
    return data;
  };

  const setCached = <T,>(key: string, data: T, ttl?: number) => {
    cacheService.set(key, data, ttl);
    loggerService.debug('Cache', 'Data cached', { key });
    setCacheSize(cacheService.getSize());
  };

  const getOrSetCached = async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    loggerService.debug('Cache', 'Get or set', { key });
    const data = await cacheService.getOrSet(key, fetcher, ttl);
    setCacheSize(cacheService.getSize());
    return data;
  };

  const clearCache = () => {
    cacheService.clear();
    setCacheSize(0);
    loggerService.info('Cache', 'Cache cleared');
  };

  return {
    getCached,
    setCached,
    getOrSetCached,
    clearCache,
    cacheSize,
  };
}
