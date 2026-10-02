import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import PushSubscriptionModel from '@/models/PushSubscription';
import { PaymentMethod } from '@/models/Order';
import webpush from 'web-push';

function initWebPush() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'admin@foodieexpress.bd';
  if (pub && priv) {
    webpush.setVapidDetails(`mailto:${email}`, pub, priv);
    return true;
  }
  return false;
}

async function sendOrderNotification(order: {
  _id: unknown;
  customerDetails: { name: string; phone?: string; address?: string };
  totalAmount: number;
  items: { name: string; quantity: number }[];
}) {
  try {
    if (!initWebPush()) {
      console.warn('VAPID keys not configured, skipping push notification');
      return;
    }

    const subscriptions = await PushSubscriptionModel.find({}).lean();
    if (subscriptions.length === 0) {
      console.log('No push subscribers registered in database.');
      return;
    }

    const itemsSummary = order.items
      .slice(0, 2)
      .map((i) => `${i.name} ×${i.quantity}`)
      .join(', ');

    const payload = JSON.stringify({
      title: '🔔 New Order Received!',
      body: `${order.customerDetails.name} ordered ${itemsSummary}${order.items.length > 2 ? ' +more' : ''} — ৳${order.totalAmount}`,
      requireInteraction: true,
      tag: `order-${order._id}`,
      data: { url: '/admin/orders', orderId: String(order._id) },
    });

    console.log(`[Push Notification] Dispatching to ${subscriptions.length} subscriber(s)...`);

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
            payload
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            // Subscription expired or unregistered; clean up from DB
            await PushSubscriptionModel.deleteOne({ endpoint: sub.endpoint });
          }
          throw err;
        }
      })
    );
  } catch (err) {
    console.error('Push notification dispatch error:', err);
  }
}

// In-memory cache for GET

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { customerDetails, items, totalAmount, paymentMethod } = body;

    // Validate required fields
    if (!customerDetails?.name || !customerDetails?.phone || !customerDetails?.address) {
      return NextResponse.json(
        { success: false, error: 'Customer details are required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const validPaymentMethods: PaymentMethod[] = ['bkash', 'nagad', 'cod', 'whatsapp'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      customerDetails,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'received',
    });


    // Send push notification (awaited with 2.5s safety cap so customer response is never delayed)
    try {
      await Promise.race([
        sendOrderNotification(order),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    } catch (e) {
      console.error('Notification trigger error:', e);
    }

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
