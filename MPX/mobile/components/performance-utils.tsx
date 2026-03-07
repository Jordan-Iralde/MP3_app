import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ViewToken,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SkeletonLoader, AnimatedContainer } from './animations';
import { ThemedView } from './themed-view';

interface LazyLoadListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  skeletonCount?: number;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
}

/**
 * Lista lazy-loaded optimizada para renderización
 */
export const LazyLoadList = React.forwardRef<FlatList, LazyLoadListProps<any>>(
  (
    {
      data,
      renderItem,
      keyExtractor,
      onLoadMore,
      isLoading = false,
      hasMore = true,
      skeletonCount = 5,
      onViewableItemsChanged,
    },
    ref
  ) => {
    const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

    const handleViewableItemsChanged = useCallback(
      (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        const newIndices = new Set(
          info.viewableItems
            .map((item) => item.index)
            .filter((index): index is number => index !== null)
        );
        setVisibleIndices(newIndices);
        onViewableItemsChanged?.(info);
      },
      [onViewableItemsChanged]
    );

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50,
    };

    const renderItemOptimized = ({ item, index }: { item: any; index: number }) => {
      return (
        <AnimatedContainer animation="fadeIn" duration={200}>
          {renderItem(item, index)}
        </AnimatedContainer>
      );
    };

    const renderFooter = () => {
      if (!isLoading) return null;
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#00D4FF" />
        </View>
      );
    };

    const handleEndReached = () => {
      if (hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    };

    return (
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderItemOptimized}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);

LazyLoadList.displayName = 'LazyLoadList';

interface SkeletonScreenProps {
  count?: number;
  isLoaded: boolean;
  children: React.ReactNode;
}

/**
 * Pantalla de esqueleto para carga progresiva
 */
export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({
  count = 5,
  isLoaded,
  children,
}) => {
  if (!isLoaded) {
    return (
      <ThemedView style={styles.skeletonContainer}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.skeletonItem}>
            <SkeletonLoader width={40} height={40} borderRadius={8} marginBottom={0} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonLoader width="80%" height={14} marginBottom={6} />
              <SkeletonLoader width="60%" height={12} marginBottom={0} />
            </View>
          </View>
        ))}
      </ThemedView>
    );
  }

  return <AnimatedContainer animation="fadeIn">{children}</AnimatedContainer>;
};

interface CacheProps {
  data: any[];
  maxAge?: number; // milliseconds
}

/**
 * Sistema simple de caché
 */
class DataCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxAge: number;

  constructor(maxAge: number = 5 * 60 * 1000) {
    this.maxAge = maxAge;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  isExpired(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp > this.maxAge;
  }
}

/**
 * Hook para caché de datos
 */
export const useDataCache = (maxAge: number = 5 * 60 * 1000) => {
  const cacheRef = React.useRef(new DataCache(maxAge));
  return cacheRef.current;
};

interface DeferredRenderProps {
  children: React.ReactNode;
  defer?: boolean;
}

/**
 * Renderizado diferido para mejorar performance
 */
export const DeferredRender: React.FC<DeferredRenderProps> = ({ children, defer = true }) => {
  const [shouldRender, setShouldRender] = useState(!defer);

  useEffect(() => {
    if (defer) {
      const timer = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timer);
    }
  }, [defer]);

  if (!shouldRender) return null;
  return <AnimatedContainer animation="fadeIn">{children}</AnimatedContainer>;
};

/**
 * Hook para precargar datos
 */
export const usePreloadData = (
  fetchFn: () => Promise<any>,
  dependencies: any[] = []
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetchFn()
      .then(() => setIsLoading(false))
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, dependencies);

  return { isLoading, error };
};

/**
 * Hook para medir performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(
        `⚡ [PERF] ${componentName} renderizado en ${(endTime - startTime).toFixed(2)}ms`
      );
    };
  }, [componentName]);
};

/**
 * Optimizador de renderización
 */
export interface RenderOptimizationOptions {
  enableMemo?: boolean;
  enableLazyLoad?: boolean;
  enableCache?: boolean;
  debounceDelay?: number;
}

export const createOptimizedComponent = <P extends object>(
  Component: React.FC<P>,
  options: RenderOptimizationOptions = {}
) => {
  const {
    enableMemo = true,
    enableLazyLoad = true,
    enableCache = true,
    debounceDelay = 200,
  } = options;

  let MemoComponent = Component;

  if (enableMemo) {
    MemoComponent = React.memo(Component);
  }

  const OptimizedComponent = (props: P) => {
    const [isDeferred, setIsDeferred] = useState(enableLazyLoad);

    useEffect(() => {
      if (enableLazyLoad) {
        const timer = setTimeout(() => setIsDeferred(false), 50);
        return () => clearTimeout(timer);
      }
    }, []);

    return (
      <DeferredRender defer={isDeferred}>
        <MemoComponent {...props} />
      </DeferredRender>
    );
  };

  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;

  return OptimizedComponent;
};

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    borderColor: '#1a1a1a',
    borderWidth: 1,
  },
});
