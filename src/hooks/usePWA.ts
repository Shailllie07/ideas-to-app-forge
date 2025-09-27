import { useState, useEffect } from 'react';
import { serviceWorkerManager } from '@/utils/ServiceWorkerManager';
import { pushNotificationService } from '@/utils/PushNotificationService';

interface PWACapabilities {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
}

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isSupported: false,
    isInstalled: false,
    canInstall: false,
    isOffline: !navigator.onLine,
    hasUpdate: false
  });

  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize PWA capabilities
    const initializePWA = async () => {
      const isSupported = serviceWorkerManager.isSupported();
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

      setCapabilities(prev => ({
        ...prev,
        isSupported,
        isInstalled
      }));

      if (isSupported) {
        // Initialize service worker
        const initialized = await serviceWorkerManager.initialize();
        if (initialized) {
          console.log('PWA: Service Worker initialized');
          
          // Initialize push notifications
          await pushNotificationService.initialize();
        }
      }
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
      setCapabilities(prev => ({ ...prev, canInstall: true }));
      console.log('PWA: Install prompt available');
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setCapabilities(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }));
      console.log('PWA: App installed');
    };

    // Handle online/offline status
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOffline: true }));

    // Handle service worker updates
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      setCapabilities(prev => ({ ...prev, hasUpdate: true }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleUpdateAvailable);
    }

    // Initialize PWA
    initializePWA();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdateAvailable);
      }
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!installPrompt) {
      console.warn('PWA: Install prompt not available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        setInstallPrompt(null);
        setCapabilities(prev => ({ ...prev, canInstall: false }));
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  };

  const updateApp = async (): Promise<void> => {
    try {
      await serviceWorkerManager.skipWaiting();
      window.location.reload();
    } catch (error) {
      console.error('PWA: Update failed:', error);
    }
  };

  const requestPersistentStorage = async (): Promise<boolean> => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        console.log('PWA: Persistent storage granted:', granted);
        return granted;
      } catch (error) {
        console.error('PWA: Failed to request persistent storage:', error);
        return false;
      }
    }
    return false;
  };

  const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          percentage: estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0
        };
      } catch (error) {
        console.error('PWA: Failed to get storage estimate:', error);
        return null;
      }
    }
    return null;
  };

  const shareContent = async (shareData: ShareData): Promise<boolean> => {
    if ('share' in navigator) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        console.error('PWA: Share failed:', error);
        return false;
      }
    }
    return false;
  };

  const vibrate = (pattern: number | number[]): boolean => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch (error) {
        console.error('PWA: Vibration failed:', error);
        return false;
      }
    }
    return false;
  };

  return {
    capabilities,
    installApp,
    updateApp,
    updateAvailable,
    requestPersistentStorage,
    getStorageEstimate,
    shareContent,
    vibrate
  };
};