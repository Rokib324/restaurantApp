import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { SITE_SETTINGS_FIELDS, SiteSettingsData } from '@/config/site';
import { getSiteSettings, normalizeSettings, SITE_SETTINGS_TAG } from '@/lib/siteSettings';

export async function GET() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const doc = await SiteSettings.findOne({ key: 'global' }).lean();
    return NextResponse.json({ success: true, data: normalizeSettings(doc as Record<string, unknown> | null) });
  } catch (error) {
    console.error('Admin GET /settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<Record<string, unknown>>;

    // Only accept known string fields
    const update: Partial<SiteSettingsData> = {};
    for (const field of SITE_SETTINGS_FIELDS) {
      if (typeof body[field] === 'string') update[field] = (body[field] as string).trim();
    }

    // Validation
    if (update.name !== undefined && !update.name) {
      return NextResponse.json({ success: false, error: 'Restaurant name is required' }, { status: 400 });
    }
    if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid e-mail address' }, { status: 400 });
    }
    if (update.logoUrl && !/^(\/|https?:\/\/)/i.test(update.logoUrl)) {
      return NextResponse.json(
        { success: false, error: 'Logo must be an uploaded image or a URL starting with http(s)://' },
        { status: 400 }
      );
    }

    await dbConnect();
    await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: update, $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Purge cached settings immediately and re-render every page with the new branding
    revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: await getSiteSettings() });
  } catch (error) {
    console.error('Admin PUT /settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
