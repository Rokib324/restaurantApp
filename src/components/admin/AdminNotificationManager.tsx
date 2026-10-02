'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

// Synthesize a pleasant 2-tone restaurant order alert chime using Web Audio API
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1: High crisp chime (880Hz - A5)
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

    // Tone 2: Harmonic resolving chime (1320Hz - E6)
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

interface OrderAlert {
  id: string;
  title: string;
  body: string;
  url: string;
}

export default function AdminNotificationManager() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastAlert, setToastAlert] = useState<OrderAlert | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);

  // Check subscription and register SW
  const checkStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }

    setSupported(true);
    setPermission(Notification.permission);

    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (e) {
      console.error('Error checking subscription:', e);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Listen to push broadcasts from Service Worker
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_ORDER_RECEIVED') {
        const payload = event.data.payload || {};
        playOrderChime();
        setToastAlert({
          id: String(Date.now()),
          title: payload.title || '🔔 New Order Received!',
          body: payload.body || 'A new customer order just arrived.',
          url: payload.data?.url || '/admin/orders',
        });
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    // Background poller: detect new orders even if OS push notifications are muted
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/orders?limit=1');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const newest = data.data[0];
          if (lastOrderIdRef.current && lastOrderIdRef.current !== newest._id) {
            // New order placed!
            playOrderChime();
            setToastAlert({
              id: newest._id,
              title: '🔔 New Order Arrived!',
              body: `${newest.customerDetails.name} placed order for ৳${newest.totalAmount}`,
              url: '/admin/orders',
            });
          }
          lastOrderIdRef.current = newest._id;
        }
      } catch {
        // Polling error ignore
      }
    }, 15000);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
      clearInterval(pollInterval);
    };
  }, [checkStatus]);

  // Subscribe current browser
  const subscribeUser = async () => {
    setLoading(true);
    try {
      // 1. Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        window.alert('Notification permission was not granted. Please enable notifications in your browser settings.');
        return;
      }

      // 3. Fetch VAPID public key
      const statusRes = await fetch('/api/push-subscribe');
      const statusData = await statusRes.json();
      const publicKey = statusData.publicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error('VAPID public key missing from server configuration');
      }

      // 4. Subscribe with PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Send subscription to server
      const saveRes = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setIsSubscribed(true);
        playOrderChime();
        if (Notification.permission === 'granted') {
          new Notification('✅ Notifications Enabled!', {
            body: 'You will now receive instant push alerts whenever a new order is placed.',
            icon: '/icon-192.png',
          });
        }
      } else {
        throw new Error(saveData.error || 'Failed to save subscription');
      }
    } catch (err: unknown) {
      console.error('Subscription error:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to enable push notifications');
    } finally {
      setLoading(false);
    }
  };

  // Test notification trigger
  const handleTestChime = () => {
    playOrderChime();
    setToastAlert({
      id: String(Date.now()),
      title: '🔔 Sound & Alert Test',
      body: 'This is what you will hear and see when a new order arrives.',
      url: '/admin/orders',
    });
  };

  return (
    <>
      {/* ── Top Notification Banner (If not subscribed) ────────────────────── */}
      {supported && (!isSubscribed || permission !== 'granted') && (
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm z-30 sticky top-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-base animate-bounce">🔔</span>
            <span>
              <strong>Instant Order Notifications are not active on this device.</strong> Enable them to receive instant alerts when customers order.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestChime}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg font-semibold text-xs transition-colors"
            >
              Test Sound
            </button>
            <button
              onClick={subscribeUser}
              disabled={loading}
              className="px-3 py-1 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-lg shadow-sm transition-all text-xs"
            >
              {loading ? 'Enabling…' : 'Enable Order Alerts ↗'}
            </button>
          </div>
        </div>
      )}

      {/* ── Active Status Indicator in Top-Right ────────────────────────────── */}
      {isSubscribed && permission === 'granted' && (
        <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2 bg-gray-900/90 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full shadow-xl text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Order Alerts Active</span>
          <button
            onClick={handleTestChime}
            className="text-orange-400 hover:text-orange-300 ml-1 font-semibold"
            title="Test notification chime sound"
          >
            🔊 Test
          </button>
        </div>
      )}

      {/* ── In-App Sliding Order Alert Toast ───────────────────────────────── */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-4 z-50 max-w-sm w-full bg-gray-900 border-2 border-orange-500/80 rounded-2xl shadow-2xl p-4 overflow-hidden"
          >
            {/* Top glowing bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl flex-shrink-0 animate-pulse">
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-white font-extrabold text-sm">{toastAlert.title}</h4>
                  <button
                    onClick={() => setToastAlert(null)}
                    className="text-gray-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">{toastAlert.body}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={toastAlert.url}
                    onClick={() => setToastAlert(null)}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    <span>View Orders</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => setToastAlert(null)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
