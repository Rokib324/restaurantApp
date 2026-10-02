'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import LiveTracker from '@/components/LiveTracker';
import { OrderStatus } from '@/models/Order';

interface OrderData {
  _id: string;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  createdAt: string;
}

const STATUS_SEQUENCE: OrderStatus[] = ['received', 'preparing', 'packaging', 'delivered'];

const ESTIMATED_TIMES: Record<OrderStatus, number> = {
  received: 30,
  preparing: 20,
  packaging: 10,
  delivered: 0,
};

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setResolvedId(id));
  }, [params]);

  const fetchOrder = useCallback(async () => {
    if (!resolvedId) return;
    try {
      const res = await fetch(`/api/orders?id=${resolvedId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setError(null);
      } else {
        setError(data.error ?? 'Order not found');
      }
    } catch {
      setError('Failed to load order status');
    } finally {
      setLoading(false);
    }
  }, [resolvedId]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Short polling every 15 seconds for live status updates
  useEffect(() => {
    if (!resolvedId) return;
    if (order?.orderStatus === 'delivered') return;

    const interval = setInterval(() => {
      fetchOrder();
    }, 15000);

    return () => clearInterval(interval);
  }, [resolvedId, order?.orderStatus, fetchOrder]);


  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-center px-6">
        <div>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">
            {error ?? 'Order not found'}
          </h2>
          <Link href="/" className="text-orange-400 hover:underline">← Back to Menu</Link>
        </div>
      </div>
    );
  }

  const estimatedTime = ESTIMATED_TIMES[order.orderStatus];
  const paymentMethodLabels: Record<string, string> = {
    bkash: '💳 bKash',
    nagad: '💰 Nagad',
    cod: '💵 Cash on Delivery',
    whatsapp: '💬 WhatsApp',
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="text-gray-400 hover:text-orange-400 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Menu
          </Link>
          <h1 className="text-4xl font-extrabold text-white mt-2">
            Order{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Tracking
            </span>
          </h1>
          <p className="text-gray-400 mt-2">
            Hi{' '}
            <span className="text-white font-semibold">{order.customerDetails.name}</span>!
            Here&apos;s the live status of your order.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Tracker (main) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <LiveTracker
              orderStatus={order.orderStatus}
              orderId={order._id}
              estimatedTime={estimatedTime}
            />

            {/* Auto-refresh notice */}
            {order.orderStatus !== 'delivered' && (
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-gray-500 text-xs text-center mt-4"
              >
                🔄 Status refreshes automatically every 15 seconds
              </motion.p>
            )}
          </motion.div>

          {/* Order Details Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Payment Info */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold text-base mb-4">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method</span>
                  <span className="text-white font-medium">
                    {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`font-bold capitalize ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-400'
                        : order.paymentStatus === 'failed'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-3">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="text-orange-400 font-extrabold text-lg">
                    ৳{order.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold text-base mb-4">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Name</p>
                  <p className="text-white font-medium">{order.customerDetails.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Phone</p>
                  <p className="text-white font-medium">{order.customerDetails.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Address</p>
                  <p className="text-white font-medium">{order.customerDetails.address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold text-base mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.name}
                      <span className="text-gray-500 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="text-orange-400 font-semibold">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/10 text-white font-bold">
                <span>Total</span>
                <span className="text-orange-400">৳{order.totalAmount}</span>
              </div>
            </div>

            {/* Order Again CTA */}
            {order.orderStatus === 'delivered' && (
              <Link href="/">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-center rounded-2xl shadow-lg shadow-orange-500/30 cursor-pointer"
                >
                  🍔 Order Again
                </motion.div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
