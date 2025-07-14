// Hook pour la virtualisation de listes longues
import { useState, useEffect, useMemo } from 'react';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualizedList = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}: VirtualizedListProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};

// Hook pour la mise en cache intelligente avec expiration
export const useSmartCache = <T>(key: string, fetcher: () => Promise<T>, ttl = 300000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          return;
        }
      } catch (e) {
        // Cache corrompu, on ignore
      }
    }

    // Pas de cache valide, on fetch
    setLoading(true);
    fetcher()
      .then(result => {
        setData(result);
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [key, ttl]);

  return { data, loading, error };
};

// Hook pour la détection de performance
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0
  });

  useEffect(() => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });

      // Monitoring de la mémoire (si disponible)
      if ('memory' in performance) {
        const updateMemory = () => {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // En MB
          }));
        };

        const interval = setInterval(updateMemory, 5000);
        return () => {
          clearInterval(interval);
          observer.disconnect();
        };
      }

      return () => observer.disconnect();
    }
  }, []);

  return metrics;
};

// Optimisation pour les images avec lazy loading
export const useOptimizedImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const imgElement = document.querySelector(`img[data-src="${src}"]`);
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => setIsLoaded(true);

  return {
    shouldLoad: isInView,
    isLoaded,
    onLoad: handleLoad,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDEzVjE3TTEyIDEzSDgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo='
  };
};
