import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import PushSubscriptionModel from '@/models/PushSubscription';
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

// Get push status and public key
export async function GET() {
  try {
    await dbConnect();
    const hasVapid = initWebPush();
    const count = await PushSubscriptionModel.countDocuments();
    return NextResponse.json({
      success: true,
      hasVapid,
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      subscriptionCount: count,
    });
  } catch (error) {
    console.error('GET /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get status' }, { status: 500 });
  }
}

// Save a push subscription (called from browser)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const subscription = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ success: false, error: 'Invalid subscription payload' }, { status: 400 });
    }

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('POST /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 });
  }
}

// Remove a subscription
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { endpoint } = await request.json();
    if (endpoint) {
      await PushSubscriptionModel.deleteOne({ endpoint });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Unsubscribe failed' }, { status: 500 });
  }
}

// Send test push notification (admin only)
export async function PUT(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    initWebPush();

    const { title, body, data } = await request.json();
    const subscriptions = await PushSubscriptionModel.find({}).lean();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No push subscriptions found. Please enable notifications in your browser first.',
        sent: 0,
        failed: 0,
      });
    }

    const payload = JSON.stringify({
      title: title || '🔔 FoodieExpress Notification',
      body: body || 'New order notification test',
      requireInteraction: true,
      tag: `test-${Date.now()}`,
      data: data || { url: '/admin/orders' },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          return await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            payload
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            // Remove expired subscription
            await PushSubscriptionModel.deleteOne({ endpoint: sub.endpoint });
          }
          throw err;
        }
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ success: true, sent, failed, total: subscriptions.length });
  } catch (error) {
    console.error('PUT /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
