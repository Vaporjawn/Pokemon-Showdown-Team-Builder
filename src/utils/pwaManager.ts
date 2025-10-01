// PWA utilities for service worker management and offline functionality

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private updateAvailable = false;

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
  }

  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('PWA: Service Worker registered successfully');

        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (this.updateAvailable) {
            this.reloadPage();
          }
        });

      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('PWA: Install prompt available');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });

    // Listen for visibility changes to check for updates
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.registration) {
        this.registration.update();
      }
    });
  }

  // Install PWA
  public async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    }
  }

  // Check if PWA can be installed
  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // Check if running as PWA
  public isRunningAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get installation status
  public getInstallationStatus(): 'not-supported' | 'can-install' | 'installed' {
    if (!('serviceWorker' in navigator)) {
      return 'not-supported';
    }

    if (this.isRunningAsPWA()) {
      return 'installed';
    }

    if (this.canInstall()) {
      return 'can-install';
    }

    return 'not-supported';
  }

  // Update service worker
  public async updateServiceWorker(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Cache team data for offline use
  public async cacheTeamData(teamData: any): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CACHE_TEAM',
        teamData,
      });
    }
  }

  // Handle online status
  private handleOnlineStatus(): void {
    console.log('PWA: Back online');
    // Sync pending data
    if (this.registration?.sync) {
      this.registration.sync.register('sync-teams');
    }
  }

  // Handle offline status
  private handleOfflineStatus(): void {
    console.log('PWA: Gone offline');
    // Show offline notification if needed
  }

  // Notify about update availability
  private notifyUpdateAvailable(): void {
    console.log('PWA: Update available');

    // Create custom event for the app to handle
    const updateEvent = new CustomEvent('pwa-update-available', {
      detail: { updateServiceWorker: () => this.updateServiceWorker() }
    });
    window.dispatchEvent(updateEvent);
  }

  // Reload page
  private reloadPage(): void {
    window.location.reload();
  }

  // Get network status
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Enable notifications (if supported)
  public async enableNotifications(): Promise<boolean> {
    if (!('Notification' in window) || !this.registration) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Subscribe to push notifications if needed
        console.log('PWA: Notifications enabled');
        return true;
      }

      return false;
    } catch (error) {
      console.error('PWA: Failed to enable notifications:', error);
      return false;
    }
  }

  // Show notification
  public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/pokeball.svg',
        badge: '/pokeball.svg',
        ...options,
      });
    } catch (error) {
      console.error('PWA: Failed to show notification:', error);
    }
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA functionality
export const usePWA = () => {
  const [canInstall, setCanInstall] = React.useState(pwaManager.canInstall());
  const [isOnline, setIsOnline] = React.useState(pwaManager.isOnlineStatus());
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent) => {
      setUpdateAvailable(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = () => setCanInstall(true);
    const handleAppInstalled = () => setCanInstall(false);

    window.addEventListener('pwa-update-available', handleUpdateAvailable as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    canInstall,
    isOnline,
    updateAvailable,
    installPWA: () => pwaManager.installPWA(),
    updateApp: () => pwaManager.updateServiceWorker(),
    isRunningAsPWA: pwaManager.isRunningAsPWA(),
    installationStatus: pwaManager.getInstallationStatus(),
    enableNotifications: () => pwaManager.enableNotifications(),
    showNotification: (title: string, options?: NotificationOptions) =>
      pwaManager.showNotification(title, options),
  };
};

export default pwaManager;