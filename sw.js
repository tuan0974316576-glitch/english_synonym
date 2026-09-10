importScripts('./vendor/firebase-app-compat.js');
importScripts('./vendor/firebase-messaging-compat.js');

const CACHE_VERSION = 'synonym-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './vocab.js',
  './manifest.json',
  './vendor/firebase-app-compat.js',
  './vendor/firebase-database-compat.js',
  './vendor/firebase-messaging-compat.js',
  './assets/icons/favicon.ico',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-192-maskable.png',
  './assets/icons/icon-512-maskable.png'
];

firebase.initializeApp({
  apiKey: "AIzaSyBgmZXPrC1J4I_rFCEajpjdFQZc4PvjAqA",
  authDomain: "enguistics-synonym.firebaseapp.com",
  databaseURL: "https://enguistics-synonym-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "enguistics-synonym",
  storageBucket: "enguistics-synonym.firebasestorage.app",
  messagingSenderId: "404253544634",
  appId: "1:404253544634:web:fcaacd682ecb2a2164f283"
});

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (error) {
  console.info('[Notifications] Background messaging is unavailable on this device.');
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(async response => {
        if (response.ok) {
          const copy = response.clone();
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(event.request, copy);
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});

if (messaging) messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || '\u540c\u7fa9\u8a5e\u306e\u9b3c';
  const options = {
    body: payload.notification?.body || '\u6709\u65b0\u6311\u6230\u7b49\u7dca\u4f60\u3002',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192-maskable.png',
    data: {
      url: payload.fcmOptions?.link || payload.data?.link || 'index.html'
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || 'index.html', self.registration.scope).href;

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if ('focus' in client) {
        client.navigate(targetUrl);
        return client.focus();
      }
    }
    return clients.openWindow(targetUrl);
  })());
});
