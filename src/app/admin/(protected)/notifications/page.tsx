'use client';

import { useEffect, useState, useCallback } from 'react';
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

function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}

export default function AdminNotificationsPage() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/push-subscribe');
      const data = await res.json();
      if (data.success) {
        setSubscribersCount(data.subscriptionCount);
      }
    } catch {
      // ignore
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    } catch {
      setSubscribed(false);
    }
  }, []);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (ok) {
      setPermission(Notification.permission);
      checkSubscription();
    }
    fetchStatus();
  }, [checkSubscription, fetchStatus]);

  const registerAndSubscribe = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      // 1. Register SW
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setStatusMsg({ text: 'Permission denied. Please allow notifications in your browser settings.', type: 'error' });
        return;
      }

      // 3. Fetch public key
      const statusRes = await fetch('/api/push-subscribe');
      const statusData = await statusRes.json();
      const publicKey = statusData.publicKey;

      if (!publicKey) {
        setStatusMsg({ text: 'VAPID public key not found on server.', type: 'error' });
        return;
      }

      // 4. Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Send to server
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        playOrderChime();
        setStatusMsg({ text: '✅ Push notifications enabled! This device will now receive order alerts.', type: 'success' });
        fetchStatus();
      } else {
        setStatusMsg({ text: data.error || 'Failed to save subscription on server.', type: 'error' });
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg({ text: err instanceof Error ? err.message : 'Failed to enable notifications.', type: 'error' });
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
        if (sub) {
          await fetch('/api/push-subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setSubscribed(false);
      setStatusMsg({ text: 'Unsubscribed from push notifications.', type: 'info' });
      fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setSending(true);
    setStatusMsg(null);
    playOrderChime();

    try {
      const res = await fetch('/api/push-subscribe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔔 New Order Received (Test)!',
          body: 'Rahma ordered 1x Double Patty Smash Burger — ৳250',
          data: { url: '/admin/orders' },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          text: `✅ Dispatched to ${data.sent} device(s)! Check your system notification tray.`,
          type: 'success',
        });
        fetchStatus();
      } else {
        setStatusMsg({ text: data.error || 'Failed to send notification.', type: 'error' });
      }
    } catch {
      setStatusMsg({ text: 'Failed to contact notification server.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-4xl w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg">
            Instant Alerts
          </span>
        </div>
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Push Notifications</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">
          Receive real-time alerts & chime sounds immediately whenever a customer places an order.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">This Device Status</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${subscribed ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <p className="text-white font-bold text-base">
              {subscribed ? 'Subscribed' : 'Not Subscribed'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Browser Permission</p>
          <p className="text-white font-bold text-base mt-1.5 capitalize">
            {permission === 'granted' ? '✅ Allowed' : permission === 'denied' ? '❌ Blocked' : '⚪ Unprompted'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Active Devices</p>
          <p className="text-orange-400 font-bold text-base mt-1.5">
            {subscribersCount !== null ? `${subscribersCount} Device(s)` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Main Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 mb-6"
      >
        <div className="flex items-start gap-5 flex-col sm:flex-row">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            🔔
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl mb-1">Instant Order Dispatch Alerts</h2>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              When an order is created by a customer, your device receives a native OS push notification and plays an audible restaurant chime so you never miss an incoming order.
            </p>

            {!supported ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                ❌ Push notifications are not supported in this browser.
              </div>
            ) : (
              <div className="space-y-4">
                {permission === 'denied' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    ⚠️ Notification permission was blocked. Please click the padlock or tune icon beside the URL in your browser bar and set <strong>Notifications → Allow</strong>.
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {!subscribed ? (
                    <motion.button
                      id="enable-notifications-btn"
                      onClick={registerAndSubscribe}
                      disabled={loading || permission === 'denied'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 disabled:opacity-50 text-sm transition-all"
                    >
                      {loading ? '⏳ Enabling...' : '🔔 Enable Notifications on this Device'}
                    </motion.button>
                  ) : (
                    <button
                      id="disable-notifications-btn"
                      onClick={unsubscribe}
                      disabled={loading}
                      className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-2xl hover:bg-red-500/20 transition-all text-sm"
                    >
                      {loading ? 'Disabling...' : '🔕 Disable on this Device'}
                    </button>
                  )}

                  <button
                    onClick={playOrderChime}
                    type="button"
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-colors text-sm flex items-center gap-2"
                  >
                    <span>🔊</span>
                    <span>Test Bell Chime</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Test Notification Trigger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8"
      >
        <h2 className="text-white font-bold text-xl mb-1">Simulate Incoming Order Alert</h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Test the full push pipeline by triggering an instant test notification right now.
        </p>

        <motion.button
          id="send-test-notification-btn"
          onClick={sendTestNotification}
          disabled={sending || (subscribersCount ?? 0) === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span>{sending ? '⏳' : '⚡'}</span>
          <span>{sending ? 'Sending Alert…' : 'Trigger Test Order Notification'}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
