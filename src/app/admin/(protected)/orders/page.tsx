'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveredOrders: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  received:  { label: 'New',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   icon: '📥' },
  preparing: { label: 'Preparing', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', icon: '👨‍🍳' },
  packaging: { label: 'Packaging', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: '📦' },
  delivered: { label: 'Delivered', color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30',  icon: '✅' },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400' },
  paid:    { label: 'Paid',    color: 'text-green-400'  },
  failed:  { label: 'Failed',  color: 'text-red-400'    },
};

const PAYMENT_LABELS: Record<string, string> = {
  bkash:    '💳 bKash',
  nagad:    '💰 Nagad',
  cod:      '💵 Cash',
  whatsapp: '💬 WhatsApp',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-BD', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDetailDrawer({
  order,
  onClose,
  onUpdateStatus,
  updating,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, field: 'orderStatus' | 'paymentStatus', val: string) => void;
  updating: boolean;
}) {
  const status = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.received;
  const pay = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 sticky top-0 bg-gray-900/95 backdrop-blur z-10">
          <div>
            <h2 className="text-white font-bold text-base">Order Details</h2>
            <p className="text-gray-500 text-xs font-mono mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.bg} ${status.color} ${status.border} border`}>
              {status.icon} {status.label}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${pay.color} bg-white/5 border border-white/10`}>
              {pay.label} Payment
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 bg-white/5 border border-white/10">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>

          {/* Customer */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-2.5">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">👤 Customer</p>
            <p className="text-white font-semibold">{order.customerDetails.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-orange-400">📞</span>
              <a href={`tel:${order.customerDetails.phone}`} className="hover:text-orange-400 transition-colors">
                {order.customerDetails.phone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-orange-400 mt-0.5">📍</span>
              <span>{order.customerDetails.address}</span>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">🧾 Order Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="w-6 h-6 bg-orange-500/15 text-orange-400 rounded-lg text-xs flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-orange-400 font-semibold">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-orange-400 text-base">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-gray-500 text-xs text-center">
            Ordered: {formatDate(order.createdAt)} · {timeAgo(order.createdAt)}
          </p>

          {/* Update controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Order Status</label>
              <select
                defaultValue={order.orderStatus}
                disabled={updating}
                onChange={(e) => onUpdateStatus(order._id, 'orderStatus', e.target.value)}
                className="w-full bg-gray-800 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-orange-500/40 transition-colors"
              >
                <option value="received">📥 New Order</option>
                <option value="preparing">👨‍🍳 Preparing</option>
                <option value="packaging">📦 Packaging</option>
                <option value="delivered">✅ Delivered</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Payment Status</label>
              <select
                defaultValue={order.paymentStatus}
                disabled={updating}
                onChange={(e) => onUpdateStatus(order._id, 'paymentStatus', e.target.value)}
                className="w-full bg-gray-800 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-orange-500/40 transition-colors"
              >
                <option value="pending">⏳ Pending</option>
                <option value="paid">✅ Paid</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeRange, setTimeRange]   = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [total, setTotal]           = useState(0);
  const [view, setView]             = useState<'table' | 'cards'>('table');

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (timeRange !== 'all')    params.set('range', timeRange);
      const res  = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotal(data.total);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, timeRange]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const iv = setInterval(fetchOrders, 20000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    setUpdatingId(orderId);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, [field]: value }),
      });
      await fetchOrders();
      // Update selected order if open
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => o ? { ...o, [field]: value } : null);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const TIME_TABS = [
    { value: 'daily',   label: "Today's Orders" },
    { value: 'weekly',  label: 'This Week'       },
    { value: 'monthly', label: 'This Month'      },
    { value: 'all',     label: 'All Time'        },
  ] as const;

  const STATUS_FILTERS = [
    { value: 'all',       label: 'All'       },
    { value: 'received',  label: '📥 New'     },
    { value: 'preparing', label: '👨‍🍳 Prep'   },
    { value: 'packaging', label: '📦 Pack'    },
    { value: 'delivered', label: '✅ Delivered'},
  ];

  const rangeLabel = TIME_TABS.find((t) => t.value === timeRange)?.label ?? 'Orders';

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full">

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Orders</h1>
              <p className="text-gray-400 mt-1 text-xs sm:text-sm">{total} orders · {rangeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setView('table')}
                  className={`px-3 py-2 text-sm transition-colors ${view === 'table' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
                  title="Table view"
                >📋</button>
                <button
                  onClick={() => setView('cards')}
                  className={`px-3 py-2 text-sm transition-colors ${view === 'cards' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
                  title="Card view"
                >🃏</button>
              </div>
              <button
                id="refresh-orders-btn"
                onClick={fetchOrders}
                className="px-3.5 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs sm:text-sm rounded-xl transition-all"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Time Range Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1.5 bg-white/5 border border-white/8 rounded-2xl p-1 mb-4 overflow-x-auto no-scrollbar sm:flex-wrap">
          {TIME_TABS.map((tab) => (
            <button
              key={tab.value}
              id={`time-${tab.value}`}
              onClick={() => setTimeRange(tab.value)}
              className={`flex-1 min-w-fit px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                timeRange === tab.value
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Stats Cards ─────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-6">
            {[
              { label: 'Revenue', value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-orange-400', icon: '💰' },
              { label: 'Orders',  value: stats.totalOrders,    color: 'text-white',        icon: '🧾' },
              { label: 'New',     value: stats.pendingOrders,  color: 'text-blue-400',     icon: '📥' },
              { label: 'Prep',    value: stats.preparingOrders,color: 'text-yellow-400',   icon: '👨‍🍳' },
              { label: 'Done',    value: stats.deliveredOrders,color: 'text-green-400',    icon: '✅' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm sm:text-base">{s.icon}</span>
                  <span className="text-gray-500 text-[11px] sm:text-xs">{s.label}</span>
                </div>
                <p className={`text-base sm:text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Status filter ───────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap mb-5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              id={`filter-${f.value}`}
              onClick={() => setFilterStatus(f.value)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === f.value
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ─── Content ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🧾</div>
            <p className="text-gray-400 font-medium">No orders found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different time range or status filter</p>
          </div>
        ) : view === 'table' ? (
          /* ──── TABLE VIEW ──────────────────────────────────────────── */
          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['#', 'Customer', 'Phone', 'Delivery Address', 'Items', 'Total', 'Payment', 'Status', 'Order Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const st  = STATUS_CONFIG[order.orderStatus]  ?? STATUS_CONFIG.received;
                  const pay = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.pending;
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      onClick={() => setSelectedOrder(order)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">
                        {orders.length - i}
                      </td>
                      {/* Customer name */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-white font-medium group-hover:text-orange-300 transition-colors">
                          {order.customerDetails.name}
                        </span>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a
                          href={`tel:${order.customerDetails.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs"
                        >
                          {order.customerDetails.phone}
                        </a>
                      </td>
                      {/* Address */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="text-gray-400 text-xs line-clamp-2">
                          {order.customerDetails.address}
                        </span>
                      </td>
                      {/* Items */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="text-gray-400 text-xs line-clamp-2">
                          {order.items.map((it) => `${it.name} ×${it.quantity}`).join(', ')}
                        </span>
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-orange-400 font-bold">৳{order.totalAmount.toLocaleString()}</span>
                      </td>
                      {/* Payment method */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-400 text-xs">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                      </td>
                      {/* Payment status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${pay.color}`}>{pay.label}</span>
                      </td>
                      {/* Order status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.color} border ${st.border}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-400 text-xs">{formatDate(order.createdAt)}</div>
                        <div className="text-gray-600 text-xs">{timeAgo(order.createdAt)}</div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ──── CARD VIEW ───────────────────────────────────────────── */
          <div className="space-y-3">
            {orders.map((order, i) => {
              const st  = STATUS_CONFIG[order.orderStatus]  ?? STATUS_CONFIG.received;
              const pay = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.pending;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white/5 border ${st.border} rounded-2xl p-4 sm:px-5 sm:py-4 cursor-pointer hover:bg-white/8 transition-all`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold ${st.bg} ${st.color} border ${st.border}`}>
                        {st.icon} {st.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm truncate">{order.customerDetails.name}</p>
                          <span className="text-gray-600 text-xs hidden sm:inline">·</span>
                          <span className="text-blue-400 text-xs font-mono">{order.customerDetails.phone}</span>
                        </div>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{order.customerDetails.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-orange-400 font-bold text-sm sm:text-base">৳{order.totalAmount.toLocaleString()}</p>
                        <p className={`text-[11px] sm:text-xs ${pay.color}`}>{pay.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-[11px] sm:text-xs">{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2.5 truncate border-t border-white/5 pt-2">
                    {order.items.map((it) => `${it.name} ×${it.quantity}`).join(', ')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Row count footer */}
        {orders.length > 0 && (
          <p className="text-center text-gray-600 text-xs mt-6">
            Showing {orders.length} of {total} orders — click any row to view details &amp; update status
          </p>
        )}
      </div>

      {/* ─── Order Detail Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailDrawer
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateOrderStatus}
            updating={updatingId === selectedOrder._id}
          />
        )}
      </AnimatePresence>
    </>
  );
}
