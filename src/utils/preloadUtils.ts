// Utility for preloading lazy components and optimizing performance

interface PreloadOptions {
  delay?: number;
  condition?: () => boolean;
}

/**
 * Preload a lazy-loaded component
 * @param importFn The dynamic import function
 * @param options Preload configuration options
 */
export const preloadComponent = async (
  importFn: () => Promise<any>,
  options: PreloadOptions = {}
): Promise<void> => {
  const { delay = 0, condition = () => true } = options;

  if (!condition()) {
    return;
  }

  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  try {
    await importFn();
  } catch (error) {
    console.warn('Failed to preload component:', error);
  }
};

/**
 * Preload multiple components in parallel
 */
export const preloadComponents = async (
  importFns: Array<() => Promise<any>>,
  options: PreloadOptions = {}
): Promise<void> => {
  await Promise.allSettled(
    importFns.map(fn => preloadComponent(fn, options))
  );
};

/**
 * Preload component on user interaction (hover, focus)
 */
export const setupPreloadOnInteraction = (
  element: HTMLElement,
  importFn: () => Promise<any>,
  events: string[] = ['mouseenter', 'focus']
): (() => void) => {
  let preloaded = false;

  const preloadHandler = () => {
    if (!preloaded) {
      preloaded = true;
      preloadComponent(importFn);
    }
  };

  events.forEach(event => {
    element.addEventListener(event, preloadHandler, { once: true, passive: true });
  });

  // Return cleanup function
  return () => {
    events.forEach(event => {
      element.removeEventListener(event, preloadHandler);
    });
  };
};

/**
 * Preload component when it becomes visible (Intersection Observer)
 */
export const setupPreloadOnVisible = (
  element: HTMLElement,
  importFn: () => Promise<any>,
  rootMargin: string = '50px'
): (() => void) => {
  let preloaded = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !preloaded) {
          preloaded = true;
          preloadComponent(importFn);
          observer.unobserve(element);
        }
      });
    },
    { rootMargin }
  );

  observer.observe(element);

  return () => observer.disconnect();
};

/**
 * Preload critical components after initial page load
 */
export const preloadCriticalComponents = (): void => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  };

  schedulePreload(() => {
    // Preload components that are likely to be used soon
    preloadComponents([
      () => import('../components/TeamBuilder'),
      () => import('../components/Pokedex'),
      () => import('../components/BackgroundSelector'),
    ], { delay: 500 });
  });
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  // Measure component load time
  measureLoadTime: (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    return fn().finally(() => {
      const end = performance.now();
      console.log(`${name} loaded in ${(end - start).toFixed(2)}ms`);
    });
  },

  // Get current memory usage (if available)
  getMemoryUsage: (): number | null => {
    if ('memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize || null;
    }
    return null;
  },

  // Log performance metrics
  logPerformanceMetrics: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      console.group('Performance Metrics');
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart);

      paint.forEach((entry) => {
        console.log(`${entry.name}:`, entry.startTime);
      });

      const memory = performanceUtils.getMemoryUsage();
      if (memory) {
        console.log('Memory Usage:', (memory / 1024 / 1024).toFixed(2), 'MB');
      }

      console.groupEnd();
    }
  },
};