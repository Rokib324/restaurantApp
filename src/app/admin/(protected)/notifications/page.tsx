'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export default function AdminNotificationsPage() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (ok) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    } catch {
      // not subscribed
    }
  };

  const registerAndSubscribe = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      // Register SW
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setStatusMsg({ text: 'Permission denied. Enable notifications in your browser settings.', type: 'error' });
        return;
      }

      // Subscribe
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setStatusMsg({ text: '✅ Push notifications enabled! You will now receive order alerts.', type: 'success' });
      } else {
        setStatusMsg({ text: 'Failed to register subscription on server.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: 'Failed to enable push notifications.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      setSubscribed(false);
      setStatusMsg({ text: 'Unsubscribed from push notifications.', type: 'info' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setSending(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/push-subscribe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔔 Test Notification',
          body: message || 'This is a test push notification from FoodieExpress Admin.',
          data: { url: '/admin' },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: `✅ Sent to ${data.sent} device(s)!`, type: 'success' });
      } else {
        setStatusMsg({ text: data.error || 'Failed to send.', type: 'error' });
      }
    } catch {
      setStatusMsg({ text: 'Network error', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-white text-3xl font-extrabold">Push Notifications</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Enable browser push notifications to get instant alerts for new orders.
        </p>
      </motion.div>

      {/* Status feedback */}
      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-2xl border text-sm ${
            statusMsg.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : statusMsg.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}
        >
          {statusMsg.text}
        </motion.div>
      )}

      {/* Enable / Disable Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            🔔
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl mb-2">Order Alert Notifications</h2>
            <p className="text-gray-400 text-sm mb-4">
              When a customer places a new order, you will receive an instant push notification on this device even when the browser is in the background.
            </p>

            {!supported ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                ❌ Push notifications are not supported in this browser.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status indicator */}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${subscribed ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="text-gray-300 text-sm">
                    {subscribed
                      ? '✅ This device is subscribed to order alerts'
                      : '⚪ Not subscribed — enable below'}
                  </span>
                </div>

                {permission === 'denied' && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                    ⚠️ Notification permission is blocked. Open browser settings → Site Settings → Notifications to allow it.
                  </div>
                )}

                <div className="flex gap-3">
                  {!subscribed ? (
                    <motion.button
                      id="enable-notifications-btn"
                      onClick={registerAndSubscribe}
                      disabled={loading || permission === 'denied'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 disabled:opacity-50 text-sm transition-all"
                    >
                      {loading ? '⏳ Enabling...' : '🔔 Enable Push Notifications'}
                    </motion.button>
                  ) : (
                    <button
                      id="disable-notifications-btn"
                      onClick={unsubscribe}
                      disabled={loading}
                      className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-2xl hover:bg-red-500/20 transition-all text-sm"
                    >
                      {loading ? 'Disabling...' : '🔕 Disable Notifications'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Send Test Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8"
      >
        <h2 className="text-white font-bold text-xl mb-2">Send Test Notification</h2>
        <p className="text-gray-400 text-sm mb-5">
          Send a test push notification to all subscribed devices to verify everything is working.
        </p>

        <div className="space-y-4">
          <input
            id="notification-message"
            type="text"
            placeholder="Custom message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-orange-500/40 transition-colors text-sm"
          />

          <motion.button
            id="send-test-notification-btn"
            onClick={sendTestNotification}
            disabled={sending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white/8 border border-white/15 hover:bg-white/12 text-white font-semibold rounded-2xl transition-all text-sm"
          >
            {sending ? '📤 Sending...' : '📤 Send Test Notification'}
          </motion.button>
        </div>
      </motion.div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-5 bg-blue-500/8 border border-blue-500/15 rounded-2xl"
      >
        <p className="text-blue-400 text-sm font-semibold mb-2">💡 How it works</p>
        <ul className="text-blue-300/70 text-xs space-y-1.5">
          <li>• Open this admin panel on any device (phone, tablet, laptop) and enable notifications</li>
          <li>• You can subscribe multiple devices — all will receive alerts simultaneously</li>
          <li>• Notifications arrive instantly when a customer places an order, even if the browser tab is closed</li>
          <li>• Clicking the notification opens the Admin Orders page directly</li>
        </ul>
      </motion.div>
    </div>
  );
}
