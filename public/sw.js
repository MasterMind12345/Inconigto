const CACHE_NAME = 'secretstory-v1.3';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Événement d'installation
self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker installing... Version:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache ouvert, ajout des URLs:', urlsToCache);
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('✅ Toutes les ressources sont en cache');
          })
          .catch((error) => {
            console.error('❌ Erreur lors de la mise en cache:', error);
          });
      })
  );
  
  // Force le Service Worker à s'activer immédiatement
  self.skipWaiting();
});

// Événement d'activation
self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker activated:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprime les anciens caches
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prend le contrôle de toutes les pages
  self.clients.claim();
});

// Événement de fetch (interception des requêtes)
self.addEventListener('fetch', (event) => {
  // Ignore les requêtes non-GET et les requêtes chrome-extension
  if (event.request.method !== 'GET' || event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est en cache, la retourner
        if (response) {
          console.log('📨 Servi depuis le cache:', event.request.url);
          return response;
        }

        // Sinon, faire la requête réseau
        console.log('🌐 Requête réseau:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Vérifie si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone la réponse pour la mettre en cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Mets en cache les nouvelles ressources
                cache.put(event.request, responseToCache);
                console.log('💾 Nouvelle ressource mise en cache:', event.request.url);
              });

            return response;
          })
          .catch((error) => {
            console.error('❌ Erreur fetch:', error);
            // Si hors ligne et pas en cache, on peut retourner une page offline
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Événement pour les messages (communication avec l'app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Événement de synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('🔄 Synchronisation en arrière-plan:', event.tag);
});

// Gestion des push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nouveau message SecretStory!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SecretStory', options)
  );
});

// Clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Gestion des erreurs
self.addEventListener('error', (error) => {
  console.error('❌ Erreur Service Worker:', error);
});

// Log pour confirmer le chargement
console.log('🚀 Service Worker chargé avec succès!');