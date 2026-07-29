importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgmZXPrC1J4I_rFCEajpjdFQZc4PvjAqA",
  authDomain: "enguistics-synonym.firebaseapp.com",
  databaseURL: "https://enguistics-synonym-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "enguistics-synonym",
  storageBucket: "enguistics-synonym.firebasestorage.app",
  messagingSenderId: "404253544634",
  appId: "1:404253544634:web:fcaacd682ecb2a2164f283"
});

const messaging = firebase.messaging();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || '\u540c\u7fa9\u8a5e\u306e\u9b3c';
  const options = {
    body: payload.notification?.body || '\u6709\u65b0\u6311\u6230\u7b49\u7dca\u4f60\u3002',
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
