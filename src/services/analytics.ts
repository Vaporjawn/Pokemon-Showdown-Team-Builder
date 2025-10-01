// Error tracking and analytics service for production monitoring

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  additional?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  type: 'timing' | 'counter' | 'gauge';
  timestamp: number;
  labels?: Record<string, string>;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;
  private queue: Array<AnalyticsEvent | ErrorInfo | PerformanceMetric> = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = !import.meta.env.DEV && this.hasConsent();
    this.initializeService();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hasConsent(): boolean {
    // Check for user consent (implement your consent logic)
    return localStorage.getItem('analytics-consent') === 'true';
  }

  private initializeService(): void {
    if (!this.isEnabled) {
      return;
    }

    // Initialize error tracking
    this.setupErrorTracking();

    // Initialize performance monitoring
    this.setupPerformanceMonitoring();

    // Setup periodic flushing
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track page view
    this.trackPageView();
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        additional: {
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript-error',
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        additional: {
          type: 'unhandled-promise-rejection',
          reason: event.reason,
        },
      });
    });

    // React error boundary integration
    (window as any).__POKEMON_HUB_ERROR_BOUNDARY__ = (error: Error, errorInfo: any) => {
      this.trackError({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        additional: {
          type: 'react-error-boundary',
          errorInfo,
        },
      });
    };
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.trackPerformance({
              name: 'fcp',
              value: entry.startTime,
              type: 'timing',
              timestamp: Date.now(),
            });
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance({
          name: 'lcp',
          value: lastEntry.startTime,
          type: 'timing',
          timestamp: Date.now(),
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.trackPerformance({
          name: 'cls',
          value: clsValue,
          type: 'gauge',
          timestamp: Date.now(),
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance({
            name: 'fid',
            value: (entry as any).processingStart - entry.startTime,
            type: 'timing',
            timestamp: Date.now(),
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        this.trackPerformance({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          type: 'timing',
          timestamp: Date.now(),
        });

        this.trackPerformance({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          type: 'timing',
          timestamp: Date.now(),
        });
      }, 0);
    });
  }

  // Public API methods

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) {
      return;
    }

    this.queue.push({
      ...event,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId,
    });

    // Immediate flush for critical events
    if (event.category === 'error' || event.action === 'app_crash') {
      this.flush();
    }
  }

  public trackError(error: ErrorInfo): void {
    if (!this.isEnabled) {
      console.error('Error tracked:', error);
      return;
    }

    this.queue.push({
      type: 'error',
      ...error,
    });

    // Immediate flush for errors
    this.flush();
  }

  public trackPerformance(metric: PerformanceMetric): void {
    if (!this.isEnabled) {
      return;
    }

    this.queue.push({
      type: 'performance',
      ...metric,
    });
  }

  public trackPageView(path?: string): void {
    this.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: path || window.location.pathname,
      custom_parameters: {
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      },
    });
  }

  public trackUserInteraction(action: string, element?: string, value?: number): void {
    this.trackEvent({
      action,
      category: 'user_interaction',
      label: element,
      value,
    });
  }

  public trackPokemonAction(action: string, pokemon?: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'pokemon',
      label: pokemon,
      custom_parameters: details,
    });
  }

  public trackTeamAction(action: string, teamId?: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'team',
      label: teamId,
      custom_parameters: details,
    });
  }

  public trackPerformanceIssue(issue: string, duration: number, context?: Record<string, any>): void {
    this.trackEvent({
      action: 'performance_issue',
      category: 'performance',
      label: issue,
      value: duration,
      custom_parameters: context,
    });
  }

  // Consent management
  public enableAnalytics(): void {
    localStorage.setItem('analytics-consent', 'true');
    this.isEnabled = true;
    this.initializeService();
  }

  public disableAnalytics(): void {
    localStorage.setItem('analytics-consent', 'false');
    this.isEnabled = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }

  public hasAnalyticsConsent(): boolean {
    return this.isEnabled;
  }

  // Data management
  private async flush(): Promise<void> {
    if (this.queue.length === 0 || !this.isEnabled) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      // In a real implementation, send to your analytics service
      // For now, we'll just log to console in development
      if (import.meta.env.DEV) {
        console.group('Analytics Events');
        events.forEach(event => console.log(event));
        console.groupEnd();
        return;
      }

      // Example: Send to your analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          session_id: this.sessionId,
          user_id: this.userId,
          timestamp: Date.now(),
        }),
      });

    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }

  // Memory usage tracking
  public trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.trackPerformance({
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        type: 'gauge',
        timestamp: Date.now(),
        labels: {
          total: memory.totalJSHeapSize.toString(),
          limit: memory.jsHeapSizeLimit.toString(),
        },
      });
    }
  }

  // Feature usage tracking
  public trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      action: `feature_${action}`,
      category: 'features',
      label: feature,
      custom_parameters: metadata,
    });
  }

  // A/B testing support
  public trackExperiment(experimentId: string, variant: string): void {
    this.trackEvent({
      action: 'experiment_exposure',
      category: 'experiments',
      label: experimentId,
      custom_parameters: {
        variant,
      },
    });
  }

  // Clean up resources
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserInteraction: analytics.trackUserInteraction.bind(analytics),
    trackPokemonAction: analytics.trackPokemonAction.bind(analytics),
    trackTeamAction: analytics.trackTeamAction.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    enableAnalytics: analytics.enableAnalytics.bind(analytics),
    disableAnalytics: analytics.disableAnalytics.bind(analytics),
    hasConsent: analytics.hasAnalyticsConsent.bind(analytics),
  };
};

// Utility functions
export const withAnalytics = <T extends (...args: any[]) => any>(
  fn: T,
  eventName: string,
  category: string = 'function_call'
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();

    try {
      const result = fn(...args);

      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            analytics.trackEvent({
              action: eventName,
              category,
              value: Math.round(performance.now() - startTime),
              custom_parameters: { success: true },
            });
            return value;
          })
          .catch((error) => {
            analytics.trackEvent({
              action: eventName,
              category,
              value: Math.round(performance.now() - startTime),
              custom_parameters: { success: false, error: error.message },
            });
            throw error;
          });
      } else {
        analytics.trackEvent({
          action: eventName,
          category,
          value: Math.round(performance.now() - startTime),
          custom_parameters: { success: true },
        });
        return result;
      }
    } catch (error) {
      analytics.trackEvent({
        action: eventName,
        category,
        value: Math.round(performance.now() - startTime),
        custom_parameters: { success: false, error: error.message },
      });
      throw error;
    }
  }) as T;
};

export default analytics;