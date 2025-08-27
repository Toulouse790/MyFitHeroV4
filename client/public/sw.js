// Service Worker pour MyFitHero
const CACHE_NAME = 'myfithero-cache-v1';
const STATIC_CACHE = 'myfithero-static-v1';
const DYNAMIC_CACHE = 'myfithero-dynamic-v1';

// Ressources à mettre en cache dès l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  // Core CSS et JS seront ajoutés dynamiquement
];

// URLs à mettre en cache dynamiquement
const CACHE_STRATEGIES = {
  // API Supabase - Network First (données fraîches prioritaires)
  supabaseApi: /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  
  // Assets statiques - Cache First
  staticAssets: /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
  
  // Pages - Stale While Revalidate
  pages: /^https?:\/\/localhost.*\/(workout|nutrition|hydration|sleep|profile|social)?$/
};

// === INSTALLATION DU SERVICE WORKER ===
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force l'activation immédiate
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Erreur lors de la mise en cache:', error);
      })
  );
});

// === ACTIVATION DU SERVICE WORKER ===
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation');
  
  event.waitUntil(
    Promise.all([
      // Suppression des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Prise de contrôle de tous les clients
      self.clients.claim()
    ])
  );
});

// === STRATÉGIES DE MISE EN CACHE ===

// Network First - Pour les données API
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Réseau indisponible, utilisation du cache pour:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback pour les données utilisateur essentielles
    if (request.url.includes('profiles') || request.url.includes('daily_stats')) {
      return new Response(JSON.stringify({ 
        offline: true, 
        message: 'Données hors ligne non disponibles' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
};

// Cache First - Pour les assets statiques
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('📦 Asset non disponible:', request.url);
    throw error;
  }
};

// Stale While Revalidate - Pour les pages
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // En cas d'erreur réseau, on retourne la version cachée
    return cachedResponse;
  });
  
  // Retourne immédiatement la version cachée si disponible
  return cachedResponse || fetchPromise;
};

// === GESTION DES REQUÊTES ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Stratégie selon le type de ressource
  if (CACHE_STRATEGIES.supabaseApi.test(url)) {
    // API Supabase: Network First
    event.respondWith(networkFirst(request));
  } else if (CACHE_STRATEGIES.staticAssets.test(url)) {
    // Assets statiques: Cache First
    event.respondWith(cacheFirst(request));
  } else if (CACHE_STRATEGIES.pages.test(url) || request.mode === 'navigate') {
    // Pages: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Par défaut: Network First avec fallback
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});

// === SYNCHRONISATION EN ARRIÈRE-PLAN ===
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'background-sync-fitness-data') {
    event.waitUntil(syncFitnessData());
  }
});

// === NOTIFICATIONS PUSH ===
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification MyFitHero',
    icon: '/placeholder.svg',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ouvrir l\'app',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MyFitHero', options)
  );
});

// === FONCTIONS UTILITAIRES ===
async function syncFitnessData() {
  try {
    // Synchroniser les données fitness en attente
    const pendingData = await getStoredPendingData();
    
    for (const data of pendingData) {
      await fetch('/api/sync-fitness-data', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Nettoyer les données synchronisées
    await clearStoredPendingData();
    console.log('✅ Synchronisation des données fitness terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
}

async function getStoredPendingData() {
  // Récupérer les données en attente depuis IndexedDB
  return []; // À implémenter avec IndexedDB
}

async function clearStoredPendingData() {
  // Nettoyer les données synchronisées
  // À implémenter avec IndexedDB
}
