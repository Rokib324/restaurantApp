import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getSiteSettings, normalizeSettings, SITE_SETTINGS_TAG } from '@/lib/siteSettings';

export async function GET() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({
      success: true,
      isKitchenOpen: settings.isKitchenOpen ?? true,
      kitchenOpenText: settings.kitchenOpenText || 'Kitchens Open Now',
      kitchenClosedText: settings.kitchenClosedText || 'Kitchens are now close',
    });
  } catch (error) {
    console.error('Admin GET /api/admin/kitchen-status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      isKitchenOpen?: boolean;
      kitchenOpenText?: string;
      kitchenClosedText?: string;
    };

    const update: Record<string, unknown> = {};

    if (typeof body.isKitchenOpen === 'boolean') {
      update.isKitchenOpen = body.isKitchenOpen;
    }
    if (typeof body.kitchenOpenText === 'string') {
      update.kitchenOpenText = body.kitchenOpenText.trim();
    }
    if (typeof body.kitchenClosedText === 'string') {
      update.kitchenClosedText = body.kitchenClosedText.trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    await dbConnect();
    const doc = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: update, $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    const normalized = normalizeSettings(doc as unknown as Record<string, unknown> | null);

    return NextResponse.json({
      success: true,
      isKitchenOpen: normalized.isKitchenOpen,
      kitchenOpenText: normalized.kitchenOpenText,
      kitchenClosedText: normalized.kitchenClosedText,
      message: normalized.isKitchenOpen
        ? 'Kitchen marked as OPEN'
        : 'Kitchen marked as CLOSED',
    });
  } catch (error) {
    console.error('Admin PATCH /api/admin/kitchen-status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update kitchen status' },
      { status: 500 }
    );
  }
}
