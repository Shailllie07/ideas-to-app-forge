import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { offlineStorage } from "./utils/OfflineStorage";
import { serviceWorkerManager } from "./utils/ServiceWorkerManager";
import { performanceMonitor } from "./utils/LazyLoader";

// Initialize PWA features
const initializePWA = async () => {
  try {
    // Initialize offline storage
    await offlineStorage.initialize();
    
    // Initialize service worker
    if (serviceWorkerManager.isSupported()) {
      await serviceWorkerManager.initialize();
      
      // Cleanup expired cache periodically
      setInterval(async () => {
        await offlineStorage.cleanup();
        await serviceWorkerManager.clearExpiredCache();
      }, 24 * 60 * 60 * 1000); // Daily cleanup
    }

    // Performance monitoring
    performanceMonitor.startTiming('app-initialization');
    
    console.log('PWA features initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PWA features:', error);
  }
};

// Initialize PWA and render app
initializePWA().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
  performanceMonitor.endTiming('app-initialization');
}).catch((error) => {
  console.error('App initialization failed:', error);
  // Fallback render without PWA features
  createRoot(document.getElementById("root")!).render(<App />);
});
