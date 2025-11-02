const CACHE_NAME = 'secretstory-pwa-v1.0';
const STATIC_CACHE = 'secretstory-static-v1.0';

// Fichiers à mettre en cache pour le offline
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Événement d'installation
self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker PWA installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cache des ressources statiques');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Toutes les ressources PWA sont en cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'installation:', error);
      })
  );
});

// Événement d'activation
self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker PWA activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprime les anciens caches mais garde le static
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Événement de fetch - INTELLIGENT
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;

  // STRATÉGIE: Cache First pour les ressources PWA, Network First pour le reste
  if (url.origin === location.origin) {
    // Ressources PWA statiques - Cache First
    if (url.pathname === '/' || 
        url.pathname === '/manifest.json' ||
        url.pathname.includes('/icon-') ||
        url.pathname === '/favicon.ico') {
      
      event.respondWith(
        caches.match(request).then((response) => {
          // Retourne le cache si disponible
          if (response) {
            console.log('📨 Servi depuis le cache PWA:', url.pathname);
            return response;
          }
          
          // Sinon fetch et cache
          return fetch(request).then((response) => {
            // Vérifie que la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone la réponse pour la mettre en cache
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              console.log('💾 Nouvelle ressource PWA mise en cache:', url.pathname);
            });

            return response;
          });
        })
      );
      return;
    }
    
    // Fichiers JavaScript/CSS - Network First (NE PAS CACHER)
    if (url.pathname.includes('/static/')) {
      console.log('🌐 Fichier statique laissé à Vercel:', url.pathname);
      return; // Laisser Vercel gérer ces fichiers
    }
  }
  
  // Routes d'application - Network Only
  if (url.pathname.includes('/send/')) {
    console.log('🚀 Route application:', url.pathname);
    return;
  }
  
  // API Supabase - Network Only
  if (url.origin.includes('supabase.co')) {
    return;
  }

  // Pour toutes les autres requêtes (pages), stratégie Network First avec fallback
  event.respondWith(
    fetch(request).catch(() => {
      // Fallback hors ligne pour la page d'accueil
      if (url.pathname === '/' || url.pathname === '/index.html') {
        return caches.match('/').then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Page hors ligne basique
          return new Response(
            `
            <!DOCTYPE html>
            <html>
              <head>
                <title>SecretStory - Hors ligne</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #8B5CF6, #EC4899);
                    height: 100vh; 
                    margin: 0;
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    text-align: center;
                  }
                  .container {
                    padding: 2rem;
                    max-width: 400px;
                  }
                  h1 { 
                    font-size: 2rem; 
                    margin-bottom: 1rem;
                    font-weight: bold;
                  }
                  p { 
                    font-size: 1.1rem;
                    opacity: 0.9;
                    margin-bottom: 0.5rem;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🕵️‍♀️ SecretStory</h1>
                  <p>Vous êtes actuellement hors ligne</p>
                  <p>Reconnectez-vous pour recevoir des messages anonymes</p>
                </div>
              </body>
            </html>
            `,
            { 
              headers: { 
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
              } 
            }
          );
        });
      }
      
      // Pour les autres pages, laisser l'erreur normale
      return fetch(request);
    })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan (pour futures fonctionnalités)
self.addEventListener('sync', (event) => {
  console.log('🔄 Synchronisation en arrière-plan:', event.tag);
});

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nouveau message SecretStory! 🕵️‍♀️',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: '/icon-512.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'SecretStory', 
      options
    )
  );
});

// Clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true 
      }).then((clientList) => {
        // Ouvre ou focus une fenêtre existante
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
  }
});

// Gestion des erreurs
self.addEventListener('error', (error) => {
  console.error('❌ Erreur Service Worker:', error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée:', event.reason);
});

console.log('🚀 Service Worker PWA complet chargé avec succès!');