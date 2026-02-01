import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance metrics data structure
 */
export interface PerformanceMetrics {
  renderTime: number; // ms
  mountTime: number; // ms
  updateTime: number; // ms
  memoryUsage?: number; // MB
  frameRate?: number; // fps
}

/**
 * Hook for monitoring component performance
 * Tracks render times, mount times, and memory usage
 */
export function usePerformanceMonitoring(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateTime: 0,
  });

  const renderStartRef = useRef<number>(0);
  const mountStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Mark render start
  useEffect(() => {
    renderStartRef.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartRef.current;

      if (updateCountRef.current === 0) {
        // First render (mount)
        mountStartRef.current = performance.now() - renderTime;
      }

      setMetrics((prev) => ({
        ...prev,
        renderTime,
        mountTime: updateCountRef.current === 0 ? renderTime : prev.mountTime,
      }));

      updateCountRef.current++;
      lastUpdateRef.current = performance.now();
    };
  });

  // Log performance metrics
  const logMetrics = useCallback(() => {
    console.log(
      `[Performance] ${componentName}:`,
      `Render: ${metrics.renderTime.toFixed(2)}ms,`,
      `Mount: ${metrics.mountTime.toFixed(2)}ms,`,
      `Updates: ${updateCountRef.current}`
    );
  }, [componentName, metrics]);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if (
      typeof performance !== 'undefined' &&
      (performance as any).memory
    ) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2),
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2),
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
      };
    }
    return null;
  }, []);

  return {
    metrics,
    logMetrics,
    getMemoryUsage,
    updateCount: updateCountRef.current,
  };
}

/**
 * Hook for measuring operation duration
 */
export function useOperationTimer(operationName: string) {
  const [duration, setDuration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (isRunning) {
      const elapsed = performance.now() - startTimeRef.current;
      setDuration(elapsed);
      setIsRunning(false);

      console.log(`[Timer] ${operationName}: ${elapsed.toFixed(2)}ms`);

      return elapsed;
    }
    return 0;
  }, [isRunning, operationName]);

  const reset = useCallback(() => {
    setDuration(0);
    setIsRunning(false);
  }, []);

  return {
    duration,
    isRunning,
    start,
    stop,
    reset,
  };
}

/**
 * Hook for tracking frame rate
 */
export function useFrameRateMonitoring() {
  const [frameRate, setFrameRate] = useState<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const measureFrameRate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      frameCountRef.current++;

      // Calculate FPS every 1 second
      if (deltaTime >= 1000) {
        const fps = Math.round(
          frameCountRef.current / (deltaTime / 1000)
        );
        setFrameRate(fps);

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFrameRate);
    };

    animationFrameId = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return frameRate;
}

/**
 * Hook for debouncing performance-intensive operations
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    }) as T,
    [callback, delayMs]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [debouncedCallback, cancel];
}

/**
 * Hook for throttling performance-intensive operations
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  intervalMs: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    ((...args: any[]) => {
      const now = performance.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= intervalMs) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const remainingTime = intervalMs - timeSinceLastCall;
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = performance.now();
          callback(...args);
        }, remainingTime);
      }
    }) as T,
    [callback, intervalMs]
  );

  return throttledCallback;
}
