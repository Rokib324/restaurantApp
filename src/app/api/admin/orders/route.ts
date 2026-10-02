import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

function getDateRange(range: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);

  if (range === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (range === 'weekly') {
    const day = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const range = searchParams.get('range') || 'all'; // 'daily' | 'weekly' | 'monthly' | 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    if (range && range !== 'all') {
      const { start, end } = getDateRange(range);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Compute stats for the CURRENT filter range
    const [rangeStats] = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'received'] }, 1, 0] } },
          preparingOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'preparing'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } },
        },
      },
    ]).exec();

    // Always compute today's stats for the dashboard header cards
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayStats] = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: '$totalAmount' },
          todayOrders: { $sum: 1 },
        },
      },
    ]).exec();

    const defaultStats = {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      preparingOrders: 0,
      deliveredOrders: 0,
    };

    return NextResponse.json({
      success: true,
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: rangeStats || defaultStats,
      todayStats: todayStats || { todayRevenue: 0, todayOrders: 0 },
    });
  } catch (error) {
    console.error('Admin GET /orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { orderId, orderStatus, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Admin PATCH /orders error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
