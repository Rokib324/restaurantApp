import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/siteSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(
      {
        success: true,
        isKitchenOpen: settings.isKitchenOpen ?? true,
        kitchenOpenText: settings.kitchenOpenText || 'Kitchens Open Now',
        kitchenClosedText: settings.kitchenClosedText || 'Kitchens are now close',
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/kitchen-status error:', error);
    return NextResponse.json(
      {
        success: true,
        isKitchenOpen: true,
        kitchenOpenText: 'Kitchens Open Now',
        kitchenClosedText: 'Kitchens are now close',
      },
      { status: 200 }
    );
  }
}
