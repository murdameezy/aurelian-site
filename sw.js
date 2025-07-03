/* ==============================
   Aurelian Fortune – Service Worker
   ============================== */

/* ---------- 1.  Offline cache ---------- */
const CACHE = 'aurelian-v1';
const CORE_ASSETS = [
  '/', '/index.html', '/style.css',
  '/crest-192.png', '/crest-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

/* ---------- 2.  Push notifications ---------- */
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const { title = 'Aurelian Signal', body = '', ...rest } = data;

  const actions = [
    { action: 'trade',   title: 'Trade now' },
    { action: 'dismiss', title: 'Dismiss' }
  ];

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: rest,            // sym, side, qty, limit
      icon: '/crest-192.png',
      badge: '/crest-192.png',
      actions
    })
  );
});

/* ---------- 3.  Handle notification clicks ---------- */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'trade') {
    const d = event.notification.data;
    const url = `/trade.html?${new URLSearchParams(d).toString()}`;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
             .then(ws => {
               for (const w of ws) {
                 if (w.url.includes('/trade.html')) return w.focus();
               }
               return clients.openWindow(url);
             })
    );
  }
});
