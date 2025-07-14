// Hook pour la gestion PWA et mode hors ligne
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

interface PWAActions {
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  registerBackgroundSync: (tag: string) => Promise<void>;
}

export const usePWA = (): PWAState & PWAActions => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const { toast } = useToast();

  // === ENREGISTREMENT DU SERVICE WORKER ===
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker enregistré:', registration);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  toast({
                    title: "Mise à jour disponible",
                    description: "Une nouvelle version de l'app est prête !",
                  });
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }
  }, [toast]);

  // === DÉTECTION DE L'INSTALLATION PWA ===
  useEffect(() => {
    // Vérifier si déjà installé
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };
    
    checkInstalled();
    
    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Écouter l'installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast({
        title: "App installée !",
        description: "MyFitHero V4 a été ajouté à votre écran d'accueil",
      });
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  // === DÉTECTION DU STATUT EN LIGNE ===
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation des données...",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors ligne",
        description: "Données sauvegardées localement",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // === ACTIONS PWA ===
  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;
    
    try {
      const result = await deferredPrompt.prompt();
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  };

  const checkForUpdates = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications non supportées",
        description: "Votre navigateur ne supporte pas les notifications",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: "Notifications activées",
        description: "Vous recevrez des rappels pour vos objectifs",
      });
      return true;
    } else {
      toast({
        title: "Notifications refusées",
        description: "Vous pouvez les activer dans les paramètres",
      });
      return false;
    }
  };

  const registerBackgroundSync = async (tag: string): Promise<void> => {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    checkForUpdates,
    enableNotifications,
    registerBackgroundSync
  };
};

// Hook pour le stockage hors ligne avec IndexedDB
export const useOfflineStorage = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open('MyFitHeroV4DB', 1);
      
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les données fitness en attente
        if (!database.objectStoreNames.contains('pendingData')) {
          const store = database.createObjectStore('pendingData', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store pour le cache des données utilisateur
        if (!database.objectStoreNames.contains('userCache')) {
          const userStore = database.createObjectStore('userCache', { 
            keyPath: 'key' 
          });
          userStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        setDb((event.target as IDBOpenDBRequest).result);
      };
      
      request.onerror = (event) => {
        console.error('Erreur IndexedDB:', event);
      };
    };
    
    openDB();
  }, []);

  const storePendingData = async (data: any) => {
    if (!db) return;
    
    const transaction = db.transaction(['pendingData'], 'readwrite');
    const store = transaction.objectStore('pendingData');
    
    await store.add({
      ...data,
      timestamp: Date.now()
    });
  };

  const getCachedData = async (key: string) => {
    if (!db) return null;
    
    const transaction = db.transaction(['userCache'], 'readonly');
    const store = transaction.objectStore('userCache');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  };

  const setCachedData = async (key: string, data: any, ttl = 300000) => {
    if (!db) return;
    
    const transaction = db.transaction(['userCache'], 'readwrite');
    const store = transaction.objectStore('userCache');
    
    return new Promise<void>((resolve) => {
      const request = store.put({
        key,
        data,
        expiresAt: Date.now() + ttl
      });
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  };

  return {
    storePendingData,
    getCachedData,
    setCachedData,
    isReady: !!db
  };
};
