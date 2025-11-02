const CACHE_NAME = 'secretstory-v1.4';
const STATIC_CACHE = 'secretstory-static-v1.0';

// Événement d'installation
self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker installing... Version:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Cache uniquement les ressources critiques
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/icon-192.png',
          '/icon-512.png',
          '/favicon.ico'
        ])
        .then(() => {
          console.log('✅ Ressources critiques en cache');
        })
        .catch((error) => {
          console.error('❌ Erreur cache ressources critiques:', error);
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
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
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
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET et les requêtes chrome-extension
  if (request.method !== 'GET' || request.url.includes('chrome-extension')) {
    return;
  }

  // Pour les routes SPA, sert toujours index.html
  if (request.destination === 'document' || 
      (request.mode === 'navigate' && !url.pathname.includes('.'))) {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              // Cache la nouvelle version d'index.html
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put('/index.html', responseClone));
              return response;
            })
            .catch(() => {
              // Fallback offline
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>SecretStory</title>
                    <meta charset="utf-8">
                  </head>
                  <body>
                    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; font-family: Arial;">
                      <div style="text-align: center;">
                        <h1>SecretStory</h1>
                        <p>Application hors ligne</p>
                      </div>
                    </div>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }

  // Pour les ressources statiques (CSS, JS, images)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Retourne la ressource en cache si disponible
        if (response) {
          return response;
        }

        // Sinon, fait la requête réseau
        return fetch(request)
          .then((response) => {
            // Ne cache que les ressources réussies
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('❌ Erreur fetch:', error);
            // Pour les images, retourne une image de fallback
            if (request.destination === 'image') {
              return caches.match('/icon-192.png');
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
console.log('🚀 Service Worker chargé avec succès! Version:', CACHE_NAME);