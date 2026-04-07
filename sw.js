importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBdfTgb7FpkYdgjvrYWQ0jr-N-1fAaW9Q0",
  authDomain: "vocabularyxdungeon.firebaseapp.com",
  databaseURL: "https://vocabularyxdungeon-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "vocabularyxdungeon",
  storageBucket: "vocabularyxdungeon.appspot.com",
  messagingSenderId: "834761939928",
  appId: "1:834761939928:web:d0fde740639a3eca46f0ad"
});

const messaging = firebase.messaging();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Lightweight service worker for installability and FCM background handling.
});

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || '同義詞の鬼';
  const options = {
    body: payload.notification?.body || '有新挑戰等緊你。',
    icon: 'icon.png',
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
