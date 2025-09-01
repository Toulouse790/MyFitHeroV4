import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
}

interface PerformanceAlert {
  type: 'warning' | 'critical';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

interface UsePerformanceMonitoringOptions {
  enableFpsMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableRenderTimeTracking?: boolean;
  fpsThreshold?: number;
  memoryThreshold?: number;
  renderTimeThreshold?: number;
  sampleInterval?: number;
}

interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearAlerts: () => void;
  trackPageLoad: () => void;
  trackRender: (componentName: string) => () => void;
  getPerformanceReport: () => string;
}

export type { UsePerformanceMonitoringReturn };

export const usePerformanceMonitoring = (
  options: UsePerformanceMonitoringOptions = {}
): UsePerformanceMonitoringReturn => {
  const {
    enableFpsMonitoring = true,
    enableMemoryMonitoring = true,
    enableRenderTimeTracking = true,
    fpsThreshold = 30,
    memoryThreshold = 80,
    renderTimeThreshold = 16, // 60fps = 16ms per frame
    sampleInterval = 1000
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    loadTime: 0,
    renderTime: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const renderTimesRef = useRef<number[]>([]);

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    const measure = (timestamp: number) => {
      if (lastTimeRef.current) {
        frameCountRef.current++;
        const deltaTime = timestamp - lastTimeRef.current;
        
        if (deltaTime >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
          
          setMetrics(prev => ({ ...prev, fps }));
          
          // Check FPS threshold
          if (fps < fpsThreshold) {
            const alert: PerformanceAlert = {
              type: fps < fpsThreshold * 0.5 ? 'critical' : 'warning',
              message: `Low FPS detected: ${fps} fps`,
              timestamp: Date.now(),
              metric: 'fps',
              value: fps,
              threshold: fpsThreshold
            };
            
            setAlerts(prev => [...prev, alert]);
          }
          
          frameCountRef.current = 0;
          lastTimeRef.current = timestamp;
        }
      } else {
        lastTimeRef.current = timestamp;
      }
      
      if (isMonitoring) {
        animationFrameRef.current = requestAnimationFrame(measure);
      }
    };
    
    if (enableFpsMonitoring && isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(measure);
    }
  }, [enableFpsMonitoring, isMonitoring, fpsThreshold]);

  // Memory Monitoring
  const measureMemory = useCallback(() => {
    if (!enableMemoryMonitoring || !('memory' in performance)) return;

    try {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (!memory) return;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024); // MB
      const percentage = Math.round((used / total) * 100);

      setMetrics(prev => ({
        ...prev,
        memoryUsage: { used, total, percentage }
      }));

      // Check memory threshold
      if (percentage > memoryThreshold) {
        const alert: PerformanceAlert = {
          type: percentage > memoryThreshold * 1.2 ? 'critical' : 'warning',
          message: `High memory usage: ${percentage}%`,
          timestamp: Date.now(),
          metric: 'memory',
          value: percentage,
          threshold: memoryThreshold
        };
        
        setAlerts(prev => [...prev, alert]);
      }
    } catch (error) {
      console.warn('Memory monitoring not available:', error);
    }
  }, [enableMemoryMonitoring, memoryThreshold]);

  // Page Load Tracking
  const trackPageLoad = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      setMetrics(prev => ({ ...prev, loadTime }));
      
      // Track bundle size if available
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      const totalBundleSize = jsResources.reduce((sum, resource) => {
        return sum + ((resource as PerformanceResourceTiming).transferSize || 0);
      }, 0);
      
      if (totalBundleSize > 0) {
        setMetrics(prev => ({ ...prev, bundleSize: Math.round(totalBundleSize / 1024) })); // KB
      }
    } catch (error) {
      console.warn('Page load tracking failed:', error);
    }
  }, []);

  // Render Time Tracking
  const trackRender = useCallback((componentName: string) => {
    if (!enableRenderTimeTracking) return () => {};

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      renderTimesRef.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }
      
      // Calculate average render time
      const avgRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length;
      
      setMetrics(prev => ({ ...prev, renderTime: avgRenderTime }));
      
      // Check render time threshold
      if (renderTime > renderTimeThreshold) {
        const alert: PerformanceAlert = {
          type: renderTime > renderTimeThreshold * 2 ? 'critical' : 'warning',
          message: `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
          timestamp: Date.now(),
          metric: 'renderTime',
          value: renderTime,
          threshold: renderTimeThreshold
        };
        
        setAlerts(prev => [...prev, alert]);
      }
    };
  }, [enableRenderTimeTracking, renderTimeThreshold]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    trackPageLoad();
  }, [trackPageLoad]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Generate performance report
  const getPerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts: alerts.length,
      summary: {
        fpsStatus: metrics.fps >= fpsThreshold ? 'Good' : 'Poor',
        memoryStatus: metrics.memoryUsage.percentage <= memoryThreshold ? 'Good' : 'High',
        renderStatus: metrics.renderTime <= renderTimeThreshold ? 'Fast' : 'Slow'
      }
    };
    
    return JSON.stringify(report, null, 2);
  }, [metrics, alerts, fpsThreshold, memoryThreshold, renderTimeThreshold]);

  // Setup monitoring intervals
  useEffect(() => {
    if (isMonitoring) {
      measureFPS();
      
      intervalRef.current = setInterval(() => {
        measureMemory();
      }, sampleInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMonitoring, measureFPS, measureMemory, sampleInterval]);

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    trackPageLoad,
    trackRender,
    getPerformanceReport
  };
};

export default usePerformanceMonitoring;
