import { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  networkRequests: number;
  bundleSize: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  recordInteraction: (name: string) => void;
  getReport: () => PerformanceMetrics;
  clearMetrics: () => void;
}

export const usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    bundleSize: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceObserver, setPerformanceObserver] = useState<PerformanceObserver | null>(null);

  // Get memory usage if available
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }, []);

  // Get network request count
  const getNetworkRequests = useCallback((): number => {
    if ('getEntriesByType' in performance) {
      const networkEntries = performance.getEntriesByType('resource');
      return networkEntries.length;
    }
    return 0;
  }, []);

  // Calculate bundle size from resource entries
  const getBundleSize = useCallback((): number => {
    if ('getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      return (
        resourceEntries
          .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
          .reduce((total, entry) => total + (entry.transferSize || 0), 0) / 1024
      ); // Convert to KB
    }
    return 0;
  }, []);

  // Start monitoring performance
  const startMonitoring = useCallback(() => {
    if (!isMonitoring && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navigationEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navigationEntry.loadEventEnd - navigationEntry.navigationStart,
            }));
          }

          if (entry.entryType === 'measure') {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration,
            }));
          }

          if (entry.entryType === 'user-timing') {
            setMetrics(prev => ({
              ...prev,
              interactionTime: entry.duration,
            }));
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'measure', 'user-timing'] });
        setPerformanceObserver(observer);
        setIsMonitoring(true);

        // Update other metrics
        setMetrics(prev => ({
          ...prev,
          memoryUsage: getMemoryUsage(),
          networkRequests: getNetworkRequests(),
          bundleSize: getBundleSize(),
        }));
      } catch {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }, [isMonitoring, getMemoryUsage, getNetworkRequests, getBundleSize]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (performanceObserver) {
      performanceObserver.disconnect();
      setPerformanceObserver(null);
      setIsMonitoring(false);
    }
  }, [performanceObserver]);

  // Record user interaction
  const recordInteraction = useCallback((name: string) => {
    if ('mark' in performance && 'measure' in performance) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;

      performance.mark(startMark);

      // Simulate interaction end (in real app, call this when interaction completes)
      setTimeout(() => {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
      }, 0);
    }
  }, []);

  // Get current performance report
  const getReport = useCallback((): PerformanceMetrics => {
    return {
      ...metrics,
      memoryUsage: getMemoryUsage(),
      networkRequests: getNetworkRequests(),
      bundleSize: getBundleSize(),
    };
  }, [metrics, getMemoryUsage, getNetworkRequests, getBundleSize]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      bundleSize: 0,
    });

    if ('clearMarks' in performance && 'clearMeasures' in performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: getMemoryUsage(),
          networkRequests: getNetworkRequests(),
        }));
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring, getMemoryUsage, getNetworkRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceObserver) {
        performanceObserver.disconnect();
      }
    };
  }, [performanceObserver]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordInteraction,
    getReport,
    clearMetrics,
  };
};

export default usePerformanceMonitoring;
