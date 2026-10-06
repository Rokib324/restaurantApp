// Push Notification Service Worker (brand-neutral — titles/bodies come from the server payload)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: '🔔 New Order Received!', body: 'A new order has been placed.' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: '🔔 New Order Received!', body: event.data.text() };
    }
  }

  const title = data.title || '🔔 New Order Received!';
  const options = {
    body: data.body || 'A new order has been placed.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || `order-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: '/admin/orders' },
    actions: [
      { action: 'open_orders', title: '👀 View Order' },
    ],
    vibrate: [300, 100, 300, 100, 400],
  };

  // 1. Show native OS push notification
  const notificationPromise = self.registration.showNotification(title, options).catch((err) => {
    console.error('ServiceWorker showNotification error:', err);
  });

  // 2. Broadcast to all open admin windows so they can immediately play sound & refresh live data
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PUSH_ORDER_RECEIVED',
        payload: data,
      });
    });
  }).catch((err) => {
    console.error('ServiceWorker broadcast error:', err);
  });

  event.waitUntil(Promise.all([notificationPromise, broadcastPromise]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
