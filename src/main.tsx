import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { preloadCriticalComponents, performanceUtils } from './utils/preloadUtils';

// Performance monitoring in development
if (import.meta.env.DEV) {
  // Log performance metrics after initial render
  setTimeout(() => {
    performanceUtils.logPerformanceMetrics();
  }, 1000);
}

// Initialize preloading
preloadCriticalComponents();

// Create root and render app
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Enable React DevTools performance profiler in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (
    id: any,
    root: any,
    priorityLevel: any
  ) => {
    // Optional: Log render performance
    if (import.meta.env.VITE_ENABLE_RENDER_LOGGING) {
      console.log('React render:', { id, root, priorityLevel });
    }
  };
}
