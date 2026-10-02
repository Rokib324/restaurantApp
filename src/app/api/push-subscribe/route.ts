import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import PushSubscriptionModel from '@/models/PushSubscription';
import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Save a push subscription (called from the browser)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const subscription = await request.json();

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ success: false, error: 'Invalid subscription' }, { status: 400 });
    }

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 });
  }
}

// Send push notification to all subscriptions (admin only)
export async function PUT(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { title, body, data } = await request.json();

    const subscriptions = await PushSubscriptionModel.find({}).lean();

    const payload = JSON.stringify({
      title: title || 'FoodieExpress Admin',
      body: body || 'You have a notification',
      requireInteraction: true,
      data: data || { url: '/admin' },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          payload
        )
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error('PUT /push-subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
