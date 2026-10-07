'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
}

interface Order {
  _id: string;
  customerDetails: { name: string; phone: string; address: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  received: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: '📥' },
  preparing: { label: 'Preparing', color: 'text-yellow-400', bg: 'bg-yellow-500/15', icon: '👨‍🍳' },
  packaging: { label: 'Packaging', color: 'text-purple-400', bg: 'bg-purple-500/15', icon: '📦' },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500/15', icon: '✅' },
};

const PAYMENT_LABELS: Record<string, string> = {
  bkash: '💳 bKash',
  nagad: '💰 Nagad',
  cod: '💵 COD',
  whatsapp: '💬 WhatsApp',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders?limit=10');
      const data = await res.json();
      if (data.success) {
        setStats({ ...data.stats, ...data.todayStats });
        setRecentOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateStatus = async (orderId: string, orderStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus }),
      });
      await fetchData();
    } finally {
      setUpdatingId(null);
    }
  };

  const STAT_CARDS = [
    {
      label: "Today's Revenue",
      value: `৳${stats?.todayRevenue?.toLocaleString() ?? 0}`,
      sub: `${stats?.todayOrders ?? 0} orders today`,
      icon: '💰',
      gradient: 'from-orange-500/20 to-red-500/10',
      border: 'border-orange-500/20',
      color: 'text-orange-400',
    },
    {
      label: 'Total Revenue',
      value: `৳${stats?.totalRevenue?.toLocaleString() ?? 0}`,
      sub: `${stats?.totalOrders ?? 0} total orders`,
      icon: '📈',
      gradient: 'from-green-500/20 to-emerald-500/10',
      border: 'border-green-500/20',
      color: 'text-green-400',
    },
    {
      label: 'Pending Orders',
      value: String(stats?.pendingOrders ?? 0),
      sub: 'Awaiting action',
      icon: '⏳',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/20',
      color: 'text-blue-400',
    },
    {
      label: 'In Kitchen',
      value: String(stats?.preparingOrders ?? 0),
      sub: 'Being prepared',
      icon: '👨‍🍳',
      gradient: 'from-yellow-500/20 to-amber-500/10',
      border: 'border-yellow-500/20',
      color: 'text-yellow-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">Live overview of your restaurant</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl sm:rounded-3xl p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-400 text-xs sm:text-sm font-medium">{card.label}</p>
              <span className="text-xl sm:text-2xl">{card.icon}</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-extrabold ${card.color}`}>{card.value}</p>
            <p className="text-gray-500 text-[11px] sm:text-xs mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-white font-bold text-base sm:text-lg">Recent Orders</h2>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 text-green-400 text-xs font-medium"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Live
            </motion.div>
            <Link
              href="/admin/orders"
              className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🧾</div>
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => {
              const status = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.received;
              return (
                <div key={order._id} className="px-4 sm:px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${status.bg} ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                        <span className="text-gray-500 text-xs">{timeAgo(order.createdAt)}</span>
                      </div>
                      <p className="text-white font-semibold text-sm">{order.customerDetails.name}</p>
                      <p className="text-gray-400 text-xs truncate">{order.customerDetails.address}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    {/* Amount & payment & action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-orange-400 font-bold text-sm sm:text-base">৳{order.totalAmount}</p>
                        <p className="text-gray-500 text-[11px] sm:text-xs">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                      </div>

                      {/* Quick status update */}
                      {order.orderStatus !== 'delivered' && (
                        <select
                          id={`status-select-${order._id}`}
                          defaultValue={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="bg-gray-800 border border-white/10 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-orange-500/40 transition-colors"
                        >
                          <option value="received">📥 New</option>
                          <option value="preparing">👨‍🍳 Preparing</option>
                          <option value="packaging">📦 Packaging</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
