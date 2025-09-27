import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import InstallPrompt from './InstallPrompt';
import UpdatePrompt from './UpdatePrompt';
import OfflineIndicator from './OfflineIndicator';

interface PWAContextType {
  isOffline: boolean;
  canInstall: boolean;
  hasUpdate: boolean;
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<void>;
  shareContent: (data: ShareData) => Promise<boolean>;
  vibrate: (pattern: number | number[]) => boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
  showInstallPrompt?: boolean;
  autoInstallPromptDelay?: number;
}

export const PWAProvider = ({ 
  children, 
  showInstallPrompt = true,
  autoInstallPromptDelay = 30000 // 30 seconds
}: PWAProviderProps) => {
  const { capabilities, installApp, updateApp, shareContent, vibrate } = usePWA();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [hasSeenInstallPrompt, setHasSeenInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if user has seen install prompt before
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen') === 'true';
    setHasSeenInstallPrompt(hasSeenPrompt);

    // Show install prompt after delay if not seen before and can install
    if (showInstallPrompt && !hasSeenPrompt && capabilities.canInstall && !capabilities.isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallDialog(true);
      }, autoInstallPromptDelay);

      return () => clearTimeout(timer);
    }
  }, [capabilities.canInstall, capabilities.isInstalled, showInstallPrompt, autoInstallPromptDelay]);

  const handleInstallPromptDismiss = () => {
    setShowInstallDialog(false);
    setHasSeenInstallPrompt(true);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const contextValue: PWAContextType = {
    isOffline: capabilities.isOffline,
    canInstall: capabilities.canInstall,
    hasUpdate: capabilities.hasUpdate,
    installApp,
    updateApp,
    shareContent,
    vibrate
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* PWA UI Components */}
      <OfflineIndicator />
      
      {showInstallDialog && !hasSeenInstallPrompt && (
        <InstallPrompt onDismiss={handleInstallPromptDismiss} />
      )}
      
      <UpdatePrompt />
    </PWAContext.Provider>
  );
};